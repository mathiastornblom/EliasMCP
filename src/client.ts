import { Agent, fetch, FormData, File } from 'undici';
import { type EliasConfig, resolveConfig } from './session.js';

const DEFAULT_TIMEOUT_MS = 30_000;

interface ApiError {
  code?: string | number;
  message?: string;
}

export class EliasError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'EliasError';
  }
}

// ELIAS 18.2603+ redirects all paths to trailing-slash form (301).
// Inserting the slash proactively avoids redirect-induced POST→GET conversion.
function withTrailingSlash(path: string): string {
  const qi = path.indexOf('?');
  if (qi === -1) return path.endsWith('/') ? path : path + '/';
  const base = path.slice(0, qi);
  return (base.endsWith('/') ? base : base + '/') + path.slice(qi);
}

// Proactively re-verify the token after this many milliseconds to avoid mid-request expiry.
const TOKEN_VERIFY_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export class EliasClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly dispatcher: Agent | undefined;
  private token: string | null = null;
  private tokenAcquiredAt: number | null = null;

  constructor(private readonly config: EliasConfig) {
    const ignoreTls = config.ignoreTls ?? false;

    if (!config.baseUrl.startsWith('https://') && !ignoreTls) {
      throw new EliasError(
        'baseUrl must use https:// — set ignoreTls=true to allow http:// in test environments',
      );
    }

    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    const parsedTimeout = parseInt(process.env.ELIAS_REQUEST_TIMEOUT_MS ?? '', 10);
    this.timeoutMs =
      Number.isFinite(parsedTimeout) && parsedTimeout > 0
        ? Math.min(parsedTimeout, 300_000)
        : DEFAULT_TIMEOUT_MS;

    if (ignoreTls) {
      this.dispatcher = new Agent({ connect: { rejectUnauthorized: false } });
    }
  }

  async login(): Promise<void> {
    const url = `${this.baseUrl}/authenticate/`;
    const res = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: this.config.username,
        domain: this.config.domain ?? '',
        password: this.config.password,
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(this.dispatcher ? { dispatcher: this.dispatcher as any } : {}),
    });

    if (!res.ok) {
      const body = await this.tryParseError(res);
      throw new EliasError(body?.message ?? `Login failed (HTTP ${res.status})`, res.status);
    }

    const data = (await res.json()) as { token?: string };
    if (!data.token) throw new EliasError('Login response missing token');
    this.token = data.token;
    this.tokenAcquiredAt = Date.now();
  }

  /** Verify the current token is still accepted by the server; re-authenticate if not. */
  async verifyOrRelogin(): Promise<void> {
    if (!this.token) {
      await this.login();
      return;
    }
    const url = `${this.baseUrl}/verify/?token=${encodeURIComponent(this.token)}`;
    try {
      const res = await this.fetchWithTimeout(url, {
        method: 'GET',
        headers: { ...this.authHeaders(), Accept: 'application/json' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(this.dispatcher ? { dispatcher: this.dispatcher as any } : {}),
      });
      const json = (await res.json()) as Record<string, unknown>;
      if (!res.ok || json['isVerified'] === false) {
        this.token = null;
        this.tokenAcquiredAt = null;
        await this.login();
      }
    } catch {
      // If verify itself fails (network hiccup), fall through — the actual request will 401 and retry.
    }
  }

  /** All API routes — prefixes path with /api */
  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    await this.ensureAuth();
    return this.doRequest<T>(method, path, body, false);
  }

  /** Returns response as plain text (for IDF/IDT content) */
  async requestText(method: string, path: string, body?: unknown): Promise<string> {
    await this.ensureAuth();
    return this.doRequestText(method, path, body, false);
  }

  /** Returns raw binary data with content-type (for zip/binary export) */
  async requestBinary(
    method: string,
    path: string,
  ): Promise<{ data: Buffer; contentType: string }> {
    await this.ensureAuth();
    return this.doRequestBinary(method, path, false);
  }

  /** Multipart form upload (for zip/cab import) */
  async requestMultipart(
    method: string,
    path: string,
    formData: FormData,
  ): Promise<{ headers: Record<string, string>; body: unknown }> {
    await this.ensureAuth();
    return this.doRequestMultipart(method, path, formData, false);
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }

  private async ensureAuth(): Promise<void> {
    if (!this.token) {
      await this.login();
      return;
    }
    // Proactively verify the token if it has been held for longer than TOKEN_VERIFY_INTERVAL_MS.
    if (this.tokenAcquiredAt !== null && Date.now() - this.tokenAcquiredAt > TOKEN_VERIFY_INTERVAL_MS) {
      await this.verifyOrRelogin();
    }
  }

  private authHeaders(): Record<string, string> {
    return {
      'x-access-token': this.token ?? '',
      Accept: 'application/json',
    };
  }

  private async doRequest<T>(
    method: string,
    path: string,
    body: unknown,
    isRetry: boolean,
  ): Promise<T> {
    const url = `${this.baseUrl}${withTrailingSlash(path)}`;
    const headers: Record<string, string> = { ...this.authHeaders() };
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await this.fetchWithTimeout(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(this.dispatcher ? { dispatcher: this.dispatcher as any } : {}),
    });

    if (res.status === 401 && !isRetry) {
      this.token = null;
      await this.login();
      return this.doRequest<T>(method, path, body, true);
    }

    if (!res.ok) {
      const apiError = await this.tryParseError(res);
      const msg =
        apiError?.message && apiError.message !== 'OK'
          ? apiError.message
          : `Request failed (HTTP ${res.status})`;
      throw new EliasError(msg, res.status);
    }

    if (res.status === 204) return undefined as T;

    const json = (await res.json()) as T;

    // ELIAS returns HTTP 200 with { isVerified: false, msgId: "tokenFailed" } on token expiry
    if (
      !isRetry &&
      json !== null &&
      typeof json === 'object' &&
      (json as Record<string, unknown>)['msgId'] === 'tokenFailed'
    ) {
      this.token = null;
      await this.login();
      return this.doRequest<T>(method, path, body, true);
    }

    return json;
  }

  private async doRequestText(
    method: string,
    path: string,
    body: unknown,
    isRetry: boolean,
  ): Promise<string> {
    const url = `${this.baseUrl}${withTrailingSlash(path)}`;
    const headers: Record<string, string> = {
      ...this.authHeaders(),
      Accept: 'text/plain, application/json',
    };
    if (body !== undefined) {
      headers['Content-Type'] = 'text/plain';
    }

    const res = await this.fetchWithTimeout(url, {
      method,
      headers,
      body: body !== undefined ? String(body) : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(this.dispatcher ? { dispatcher: this.dispatcher as any } : {}),
    });

    if (res.status === 401 && !isRetry) {
      this.token = null;
      await this.login();
      return this.doRequestText(method, path, body, true);
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new EliasError(text || `Request failed (HTTP ${res.status})`, res.status);
    }

    if (res.status === 204) return '';

    return res.text();
  }

  private async doRequestBinary(
    method: string,
    path: string,
    isRetry: boolean,
  ): Promise<{ data: Buffer; contentType: string }> {
    const url = `${this.baseUrl}${withTrailingSlash(path)}`;
    const headers: Record<string, string> = {
      ...this.authHeaders(),
      Accept: '*/*',
    };

    const res = await this.fetchWithTimeout(url, {
      method,
      headers,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(this.dispatcher ? { dispatcher: this.dispatcher as any } : {}),
    });

    if (res.status === 401 && !isRetry) {
      this.token = null;
      await this.login();
      return this.doRequestBinary(method, path, true);
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new EliasError(text || `Request failed (HTTP ${res.status})`, res.status);
    }

    const contentType = res.headers.get('content-type') ?? 'application/octet-stream';
    const arrayBuffer = await res.arrayBuffer();
    const data = Buffer.from(arrayBuffer);
    return { data, contentType };
  }

  private async doRequestMultipart(
    method: string,
    path: string,
    formData: FormData,
    isRetry: boolean,
  ): Promise<{ headers: Record<string, string>; body: unknown }> {
    const url = `${this.baseUrl}${withTrailingSlash(path)}`;
    const headers: Record<string, string> = {
      'x-access-token': this.token ?? '',
    };

    const res = await this.fetchWithTimeout(url, {
      method,
      headers,
      body: formData,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(this.dispatcher ? { dispatcher: this.dispatcher as any } : {}),
    });

    if (res.status === 401 && !isRetry) {
      this.token = null;
      await this.login();
      return this.doRequestMultipart(method, path, formData, true);
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new EliasError(text || `Request failed (HTTP ${res.status})`, res.status);
    }

    const responseHeaders: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      responseHeaders[key.toLowerCase()] = value;
    });

    let body: unknown = null;
    try {
      const text = await res.text();
      body = text ? JSON.parse(text) : null;
    } catch {
      body = null;
    }

    return { headers: responseHeaders, body };
  }

  private async fetchWithTimeout(
    url: string,
    init: Parameters<typeof fetch>[1],
  ): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      return (await fetch(url, {
        ...init,
        signal: controller.signal,
      })) as unknown as Response;
    } finally {
      clearTimeout(timer);
    }
  }

  private async tryParseError(res: Response): Promise<ApiError | undefined> {
    try {
      const text = await res.text();
      if (!text) return undefined;
      return JSON.parse(text) as ApiError;
    } catch {
      return undefined;
    }
  }
}

// Re-export FormData and File for use in tools
export { FormData, File };

let _instance: EliasClient | undefined;
let _instanceKey: string | undefined;

export function getClient(): EliasClient {
  const config = resolveConfig();
  if (!config) {
    throw new EliasError(
      'ELIAS credentials are not set. Please call elias_configure with:\n' +
      '  action="set", baseUrl="https://<host>/elias/api", username="<user>", password="<pass>"\n' +
      'Optionally add domain="" and ignoreTls=true for self-signed certificates.',
    );
  }

  // Invalidate cached instance if credentials changed
  const key = `${config.baseUrl}|${config.username}|${config.password}`;
  if (!_instance || _instanceKey !== key) {
    _instance = new EliasClient(config);
    _instanceKey = key;
  }
  return _instance;
}
