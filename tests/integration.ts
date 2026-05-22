/**
 * Integration tests for EliasMCP.
 * Requires a live ELIAS server. Set env vars before running:
 *
 *   ELIAS_BASE_URL    — required for all tests
 *   ELIAS_USERNAME
 *   ELIAS_PASSWORD
 *   ELIAS_DOMAIN      — optional
 *   ELIAS_IGNORE_TLS  — optional, true for self-signed certs
 *   ELIAS_TEST_CONTAINER — required for destructive tests
 *
 * Run: npm test
 */

import 'dotenv/config';
import { setSessionConfig, resolveConfig } from '../src/session.js';
import { EliasClient, EliasError } from '../src/client.js';

// ── Test runner ───────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures: string[] = [];

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  ✗ ${name}: ${msg}`);
    failures.push(`${name}: ${msg}`);
    failed++;
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function assertExists<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined) throw new Error(message);
  return value;
}

// ── Environment setup ─────────────────────────────────────────────────────────

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return val;
}

const BASE_URL = requireEnv('ELIAS_BASE_URL');
const USERNAME = requireEnv('ELIAS_USERNAME');
const PASSWORD = requireEnv('ELIAS_PASSWORD');
const DOMAIN = process.env.ELIAS_DOMAIN ?? '';
const IGNORE_TLS = process.env.ELIAS_IGNORE_TLS === 'true';
const TEST_CONTAINER = process.env.ELIAS_TEST_CONTAINER;

const config = { baseUrl: BASE_URL, username: USERNAME, password: PASSWORD, domain: DOMAIN, ignoreTls: IGNORE_TLS };
setSessionConfig(config);
const client = new EliasClient(config);

let containerCreatedByTest = false;

// ── Tests ─────────────────────────────────────────────────────────────────────

console.log('\n=== EliasMCP Integration Tests ===');
console.log(`Server: ${BASE_URL}`);
console.log(`User:   ${USERNAME}`);
console.log(`TLS:    ${IGNORE_TLS ? 'ignored (self-signed)' : 'verified'}`);
if (TEST_CONTAINER) console.log(`Test container: ${TEST_CONTAINER}`);
console.log('');

// ── Auth tests ────────────────────────────────────────────────────────────────

console.log('--- Authentication ---');

await test('login returns token', async () => {
  await client.login();
  assert(client.isAuthenticated(), 'Expected client to be authenticated after login');
});

await test('verify token endpoint', async () => {
  const data = await client.request<{ isVerifed?: boolean; isVerified?: boolean }>('GET', '/verify');
  // API has typo in some versions: isVerifed vs isVerified
  const verified = data.isVerifed ?? (data as Record<string, unknown>).isVerified;
  assert(verified === true, `Expected token to be verified, got: ${JSON.stringify(data)}`);
});

// ── Global read-only tests ────────────────────────────────────────────────────

console.log('\n--- Read-only Operations (global) ---');

await test('list containers', async () => {
  const data = await client.request<unknown[]>('GET', '/containers');
  assert(Array.isArray(data), `Expected array of containers, got: ${typeof data}`);
  console.log(`    (found ${data.length} container(s))`);
});

if (TEST_CONTAINER) {
  // Ensure the test container exists — create it if needed, clean up after
  console.log('\n--- Test Container Setup ---');
  await test('create test container if missing', async () => {
    try {
      await client.request('GET', `/container/${encodeURIComponent(TEST_CONTAINER)}`);
      console.log(`    (container already exists)`);
    } catch (err) {
      if (err instanceof EliasError && (err.statusCode === 404 || err.statusCode === 400)) {
        await client.request('POST', `/container/${encodeURIComponent(TEST_CONTAINER)}`);
        containerCreatedByTest = true;
        console.log(`    (created container: ${TEST_CONTAINER})`);
      } else {
        throw err;
      }
    }
  });

  console.log('\n--- Read-only Operations ---');

  await test('check container exists', async () => {
    const data = await client.request<{ message?: string }>('GET', `/container/${encodeURIComponent(TEST_CONTAINER)}`);
    assertExists(data, 'Expected container check response');
  });

  await test('list images (idfs)', async () => {
    const data = await client.request<unknown[]>('GET', `/${encodeURIComponent(TEST_CONTAINER)}/idfs`);
    assert(Array.isArray(data), `Expected array of images`);
    console.log(`    (found ${data.length} image(s))`);
  });

  await test('list templates (idts)', async () => {
    const data = await client.request<unknown[]>('GET', `/${encodeURIComponent(TEST_CONTAINER)}/idts`);
    assert(Array.isArray(data), `Expected array of templates`);
    console.log(`    (found ${data.length} template(s))`);
  });

  await test('list EPMs', async () => {
    const data = await client.request<unknown[]>('GET', `/${encodeURIComponent(TEST_CONTAINER)}/epms`);
    assert(Array.isArray(data), `Expected array of EPMs`);
    console.log(`    (found ${data.length} EPM(s))`);
  });

  await test('list FPMs', async () => {
    const data = await client.request<unknown[]>('GET', `/${encodeURIComponent(TEST_CONTAINER)}/fpms`);
    assert(Array.isArray(data), `Expected array of FPMs`);
    console.log(`    (found ${data.length} FPM(s))`);
  });

  await test('list certificates', async () => {
    const data = await client.request<unknown[]>('GET', `/${encodeURIComponent(TEST_CONTAINER)}/certs`);
    assert(Array.isArray(data), `Expected array of certificates`);
    console.log(`    (found ${data.length} cert(s))`);
  });

  await test('get about info', async () => {
    const data = await client.request<{ version?: string; container?: string }>('GET', `/${encodeURIComponent(TEST_CONTAINER)}/about`);
    assertExists(data, 'Expected about response');
    console.log(`    (ELIAS version: ${data.version ?? 'unknown'})`);
  });
} else {
  console.log('  (skipping container-scoped read tests — set ELIAS_TEST_CONTAINER)');
}

// ── Error handling tests ──────────────────────────────────────────────────────

console.log('\n--- Error Handling ---');

await test('non-existent container returns error', async () => {
  try {
    await client.request('GET', '/container/this-container-does-not-exist-abc123');
    assert(false, 'Expected request to throw');
  } catch (err) {
    assert(err instanceof EliasError, `Expected EliasError, got ${err}`);
    assert(
      err.statusCode === 400 || err.statusCode === 404,
      `Expected 400 or 404, got ${err.statusCode}`,
    );
  }
});

// ── Destructive tests (require TEST_CONTAINER) ────────────────────────────────

if (TEST_CONTAINER) {
  console.log(`\n--- Destructive Tests (container: ${TEST_CONTAINER}) ---`);

  let createdImageName: string | null = null;

  await test('create a test image', async () => {
    const testIdf = {
      id: 'mcp-test-image',
      name: 'mcp-test-image',
      version: '1.0',
      container: TEST_CONTAINER,
    };
    const data = await client.request<Record<string, unknown>>('POST', `/${encodeURIComponent(TEST_CONTAINER)}/idfs`, {
      overwrite: true,
      idf: testIdf,
    });
    assertExists(data, 'Expected created IDF response');
    const idField = (data.id ?? data.name) as string | undefined;
    createdImageName = idField ?? null;
    assert(createdImageName !== null, `Create response missing id/name. Keys: ${Object.keys(data).join(', ')}`);
    console.log(`    (created image: ${createdImageName}, response keys: ${Object.keys(data).join(', ')})`);
  });

  if (createdImageName) {
    await test('get created image', async () => {
      const data = await client.request<unknown[] | Record<string, unknown>>(
        'GET',
        `/${encodeURIComponent(TEST_CONTAINER)}/idf/${encodeURIComponent(createdImageName!)}`,
      );
      // Server returns array; check first element
      const item = Array.isArray(data) ? (data[0] as Record<string, unknown>) : data;
      assert(Array.isArray(data) ? data.length > 0 : !!item, 'Expected non-empty IDF response');
      const returnedId = (item?.id ?? item?.name) as string | undefined;
      assert(returnedId === createdImageName, `Expected id/name=${createdImageName}, got ${returnedId}`);
    });

    await test('delete created image', async () => {
      const data = await client.request<{ message?: string }>(
        'DELETE',
        `/${encodeURIComponent(TEST_CONTAINER)}/idf/${encodeURIComponent(createdImageName!)}`,
      );
      assertExists(data, 'Expected delete response');
      console.log(`    (deleted image: ${createdImageName})`);
    });

    await test('confirm image is gone', async () => {
      // After delete, server returns [] (empty array) — not an error status
      const data = await client.request<unknown[]>(
        'GET',
        `/${encodeURIComponent(TEST_CONTAINER)}/idf/${encodeURIComponent(createdImageName!)}`,
      );
      assert(Array.isArray(data) && data.length === 0, `Expected empty array after delete, got: ${JSON.stringify(data)}`);
    });
  }

  // Teardown: remove the container we created
  if (containerCreatedByTest) {
    console.log('\n--- Test Container Teardown ---');
    await test('delete test container', async () => {
      await client.request('DELETE', `/container/${encodeURIComponent(TEST_CONTAINER)}`);
      console.log(`    (deleted container: ${TEST_CONTAINER})`);
    });
  }
} else {
  console.log('\n  (skipping destructive tests — set ELIAS_TEST_CONTAINER to enable)');
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log('\n=== Results ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failures.length > 0) {
  console.log('\nFailures:');
  failures.forEach((f) => console.log(`  - ${f}`));
  process.exit(1);
} else {
  console.log('\nAll tests passed.');
}
