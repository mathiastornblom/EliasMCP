import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

export interface EliasConfig {
  baseUrl: string;
  username: string;
  password: string;
  domain?: string;
  ignoreTls?: boolean;
}

const CONFIG_PATH = join(homedir(), '.elias-mcp.json');

let _session: EliasConfig | null = null;

export function getSessionConfig(): EliasConfig | null {
  return _session;
}

export function setSessionConfig(config: EliasConfig): void {
  _session = config;
}

export function clearSessionConfig(): void {
  _session = null;
}

export function loadSavedConfig(): EliasConfig | null {
  try {
    const raw = readFileSync(CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<EliasConfig>;
    if (parsed.baseUrl && parsed.username && parsed.password) {
      return parsed as EliasConfig;
    }
  } catch {
    // No saved config or parse error
  }
  return null;
}

export function saveConfig(config: EliasConfig): void {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), { mode: 0o600 });
}

export function deleteSavedConfig(): void {
  try {
    unlinkSync(CONFIG_PATH);
  } catch {
    // Already gone
  }
}

// Priority: in-session config > env vars > saved file
export function resolveConfig(): EliasConfig | null {
  if (_session) return _session;

  const baseUrl = process.env.ELIAS_BASE_URL;
  const username = process.env.ELIAS_USERNAME;
  const password = process.env.ELIAS_PASSWORD;

  if (baseUrl && username && password) {
    return {
      baseUrl,
      username,
      password,
      domain: process.env.ELIAS_DOMAIN ?? '',
      ignoreTls: process.env.ELIAS_IGNORE_TLS === 'true',
    };
  }

  return loadSavedConfig();
}
