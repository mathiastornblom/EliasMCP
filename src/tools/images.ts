import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { type McpToolResult, ok, fail, ContainerName, ImageName, buildQuery } from '../types.js';
import { getClient, type EliasClient } from '../client.js';

const inputSchema = z.object({
  action: z
    .enum(['list', 'get', 'create', 'update', 'delete', 'sign', 'lock', 'setdescription'])
    .describe('CRUD operations on IDF images, plus sign, lock, and setdescription'),
  container: ContainerName.describe('Container name'),
  name: ImageName.optional().describe('Image name without extension (required for get/create/update/delete/sign/lock/setdescription)'),
  idf: z.record(z.unknown()).optional().describe('IDF definition object (required for create/update)'),
  overwrite: z.boolean().optional().describe('Overwrite existing image (default: false)'),
  description: z.string().max(64).optional().describe('Image description, max 64 chars, no newlines (required for setdescription)'),
});

type Input = z.infer<typeof inputSchema>;

// EPM as returned by GET /{container}/epms — fpms are FPM ID strings
interface EpmPackage {
  id: string;
  name?: string;
  version?: string;
  summary?: string;
  release?: string[];
  fpms?: string[];
  [key: string]: unknown;
}

// FPM as returned by GET /{container}/fpms
interface FpmPackage {
  id: string;
  name?: string;
  version?: string;
  summary?: string;
  release?: string[];
  packageSize?: number;
  isMandatory?: boolean;
  isPreselected?: boolean;
  [key: string]: unknown;
}

// MongoDB/server fields ELIAS adds on read — must not be sent back in PUT body.
const SERVER_FIELDS = new Set(['_id', '__v', 'usedContainer', 'author', 'created', 'modified', 'conflicts', 'locked']);

// Solve dependencies, build the complete IDF, PUT it, then GET the ELIAS-computed result.
async function resolveAndSave(
  client: EliasClient,
  c: string,
  n: string,
  idfBase: Record<string, unknown>,
  overwrite: boolean,
): Promise<McpToolResult> {
  const packageList = Array.isArray(idfBase.packageList)
    ? (idfBase.packageList as string[])
    : [];

  const [solved, allEpmsRaw, allFpmsRaw, about] = await Promise.all([
    client.request<string[]>('POST', `/${c}/solve`, { parcels: packageList }),
    client.request<EpmPackage[]>('GET', `/${c}/epms`),
    client.request<FpmPackage[]>('GET', `/${c}/fpms`),
    client.request<{ container?: string }>('GET', `/${c}/about`),
  ]);
  const allEpms = allEpmsRaw ?? [];
  const allFpms = allFpmsRaw ?? [];
  const solvedSet = new Set(solved);
  const fpmMap = new Map(allFpms.map(f => [f.id, f]));

  const epms = allEpms
    .filter(epm => solvedSet.has(epm.id) || (epm.fpms ?? []).some(fId => solvedSet.has(fId)))
    .map(epm => ({
      id: epm.id,
      name: epm.name,
      version: epm.version,
      available: true,
      isUserSelected: false,
      summary: epm.summary,
      release: epm.release ?? [],
      fpms: (epm.fpms ?? []).map(fpmId => {
        const f = fpmMap.get(fpmId);
        return {
          id: fpmId,
          name: f?.name,
          version: f?.version,
          summary: f?.summary,
          release: f?.release ?? [],
          size: f?.packageSize,
          available: true,
          selected: solvedSet.has(fpmId),
          isUserSelected: false,
          isMandatory: f?.isMandatory ?? false,
          isPreselected: f?.isPreselected ?? false,
        };
      }),
    }));

  // Strip server-internal fields; only send user-data fields to ELIAS.
  // Use platform version from about as the IDF container field.
  const platformVersion = about?.container ?? idfBase.container;
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(idfBase)) {
    if (!SERVER_FIELDS.has(k)) clean[k] = v;
  }
  const imageSize = epms.reduce(
    (total, epm) => total + epm.fpms.reduce((s, fpm) => s + (fpm.selected ? (fpm.size ?? 0) : 0), 0),
    0,
  );

  // selfContained: true tells ELIAS to compute legacyIDF — ELIAS trusts the client's assertion.
  const finalIdf = { ...clean, id: (clean.id as string | undefined) ?? `${n}.idf`, version: '3.0', container: platformVersion, packageList: [], epms, selfContained: true, imageSize };

  const saved = await client.request('PUT', `/${c}/idf/${n}.idf`, { overwrite, idf: finalIdf });
  return ok(saved);
}

async function execute(raw: unknown): Promise<McpToolResult> {
  const input = inputSchema.parse(raw) as Input;
  const client = getClient();
  const c = encodeURIComponent(input.container);

  if (input.action === 'list') {
    const data = await client.request('GET', `/${c}/idfs`);
    return ok(data);
  }

  if (!input.name) return fail(`action=${input.action} requires name.`);
  const n = encodeURIComponent(input.name);

  if (input.action === 'get') {
    const data = await client.request<unknown[] | unknown>('GET', `/${c}/idf/${n}.idf`);
    if (Array.isArray(data)) {
      if (data.length === 0) return fail(`Image '${input.name}' not found in container '${input.container}'.`);
      return ok(data[0]);
    }
    return ok(data);
  }

  if (input.action === 'create') {
    if (!input.idf) return fail('action=create requires idf.');
    // ELIAS validates id/version/container even on the initial POST, so fetch about first.
    const aboutData = await client.request<{ container?: string }>('GET', `/${c}/about`);
    const augmented: Record<string, unknown> = {
      id: `${input.name}.idf`,
      version: '3.0',
      container: aboutData?.container,
      ...input.idf,
    };
    await client.request('POST', `/${c}/idfs`, {
      overwrite: input.overwrite ?? false,
      idf: augmented,
    });
    return resolveAndSave(client, c, n, augmented, true);
  }

  if (input.action === 'update') {
    if (!input.idf) return fail('action=update requires idf.');
    return resolveAndSave(client, c, n, input.idf, input.overwrite ?? true);
  }

  if (input.action === 'delete') {
    const data = await client.request('DELETE', `/${c}/idf/${n}.idf`);
    return ok(data);
  }

  if (input.action === 'sign') {
    const data = await client.request('GET', `/${c}/sign/${n}.idf`);
    return ok(data);
  }

  if (input.action === 'lock') {
    const data = await client.request('POST', `/${c}/lock/${n}.idf`);
    return ok(data);
  }

  if (input.action === 'setdescription') {
    if (!input.description) return fail('action=setdescription requires description.');
    const qs = buildQuery({ newDescription: input.description });
    const data = await client.request('PUT', `/${c}/idfdescription/${n}.idf${qs}`);
    return ok(data);
  }

  return fail('Unknown action');
}

export const imagesTool = {
  name: 'elias_images',
  description:
    'Manage ELIAS image definitions (IDF). ' +
    'action=list returns all images in a container. ' +
    'action=get retrieves a specific image. ' +
    'action=create creates a new image (requires idf object) — automatically solves dependencies so the image is self-contained. ' +
    'action=update updates an existing image (requires idf object) — automatically solves dependencies so the image is self-contained. ' +
    'action=delete deletes an image. ' +
    'action=sign signs an image with the container certificate. ' +
    'action=lock locks an image in its current state. ' +
    'action=setdescription sets a short description on the image (requires description, max 64 chars).',
  inputSchema: zodToJsonSchema(inputSchema),
  execute,
};
