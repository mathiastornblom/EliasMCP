import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { type McpToolResult, ok, fail, ContainerName, ImageName } from '../types.js';
import { getClient, type EliasClient } from '../client.js';

const inputSchema = z.object({
  action: z
    .enum(['list', 'get', 'create', 'update', 'delete', 'sign', 'lock'])
    .describe('CRUD operations on IDT image templates, plus sign and lock'),
  container: ContainerName.describe('Container name'),
  name: ImageName.optional().describe('Template name without extension (required for get/create/update/delete/sign/lock)'),
  idf: z.record(z.unknown()).optional().describe(
    'IDT definition object (required for create/update). ' +
    'epmGroups accepts either group names (e.g. "baseos") for flexible version selection, ' +
    'or exact EPM IDs (e.g. "baseos-7.2509.0-4.UC_ELUX7-1.0.epm") to pin a specific version. ' +
    'fpmGroups lists optional FPM names to include.',
  ),
  overwrite: z.boolean().optional().describe('Overwrite existing template (default: false)'),
});

type Input = z.infer<typeof inputSchema>;

interface EpmInfo {
  id: string;
  name?: string;
}

// Returns a map of group-name → [epm-id, ...] for groups that have more than one version.
async function findMultiVersionGroups(
  client: EliasClient,
  c: string,
  requestedGroups: string[],
): Promise<Record<string, string[]>> {
  const allEpms = await client.request<EpmInfo[]>('GET', `/${c}/epms`);

  const byName: Record<string, string[]> = {};
  for (const epm of allEpms) {
    if (!epm.name) continue;
    (byName[epm.name] ??= []).push(epm.id);
  }

  const multi: Record<string, string[]> = {};
  for (const group of requestedGroups) {
    const isExactId = group.endsWith('.epm');
    const groupName = isExactId
      ? (allEpms.find(e => e.id === group)?.name ?? group)
      : group;
    if ((byName[groupName]?.length ?? 0) > 1) {
      multi[groupName] = byName[groupName];
    }
  }
  return multi;
}

async function saveTemplate(
  client: EliasClient,
  method: 'POST' | 'PUT',
  url: string,
  overwrite: boolean,
  idfInput: Record<string, unknown>,
  c: string,
): Promise<McpToolResult> {
  const idf = {
    isTemplate: true,
    selfContained: false,
    imageSize: 0,
    conflicted: false,
    hasMissing: false,
    ...idfInput,
  };

  const requestedGroups = Array.isArray((idf as Record<string, unknown>).epmGroups)
    ? ((idf as Record<string, unknown>).epmGroups as string[])
    : [];

  const [saved, multiVersionGroups] = await Promise.all([
    client.request(method, url, { overwrite, idf }),
    findMultiVersionGroups(client, c, requestedGroups),
  ]);

  const result: Record<string, unknown> = { saved };
  if (Object.keys(multiVersionGroups).length > 0) {
    result.multipleVersionsAvailable = multiVersionGroups;
    result.note =
      'Some epmGroups have multiple versions in this container. ' +
      'The template currently uses the group name (flexible — always picks latest). ' +
      'To pin a specific version, replace the group name with an exact EPM ID in epmGroups.';
  }
  return ok(result);
}

async function execute(raw: unknown): Promise<McpToolResult> {
  const input = inputSchema.parse(raw) as Input;
  const client = getClient();
  const c = encodeURIComponent(input.container);

  if (input.action === 'list') {
    const data = await client.request('GET', `/${c}/idts`);
    return ok(data);
  }

  if (!input.name) return fail(`action=${input.action} requires name.`);
  const n = encodeURIComponent(input.name);

  if (input.action === 'get') {
    const data = await client.request<unknown[] | unknown>('GET', `/${c}/idt/${n}.idt`);
    if (Array.isArray(data)) {
      if (data.length === 0) return fail(`Template '${input.name}' not found in container '${input.container}'.`);
      return ok(data[0]);
    }
    return ok(data);
  }

  if (input.action === 'create') {
    if (!input.idf) return fail('action=create requires idf.');
    return saveTemplate(client, 'POST', `/${c}/idts`, input.overwrite ?? false, input.idf, c);
  }

  if (input.action === 'update') {
    if (!input.idf) return fail('action=update requires idf.');
    return saveTemplate(client, 'PUT', `/${c}/idt/${n}.idt`, input.overwrite ?? false, input.idf, c);
  }

  if (input.action === 'delete') {
    const data = await client.request('DELETE', `/${c}/idt/${n}.idt`);
    return ok(data);
  }

  if (input.action === 'sign') {
    const data = await client.request('GET', `/${c}/sign/${n}.idt`);
    return ok(data);
  }

  if (input.action === 'lock') {
    const data = await client.request('POST', `/${c}/lock/${n}.idt`);
    return ok(data);
  }

  return fail('Unknown action');
}

export const templatesTool = {
  name: 'elias_image_templates',
  description:
    'Manage ELIAS image definition templates (IDT). ' +
    'action=list returns all templates in a container. ' +
    'action=get retrieves a specific template. ' +
    'action=create creates a new template (requires idf object with epmGroups and fpmGroups). ' +
    'action=update updates an existing template (requires idf object). ' +
    'action=delete deletes a template. ' +
    'action=sign signs a template with the container certificate. ' +
    'action=lock locks a template in its current state. ' +
    'IMPORTANT: epmGroups accepts group names ("baseos") for flexible/latest-version selection, ' +
    'or exact EPM IDs ("baseos-7.2509.0-4.UC_ELUX7-1.0.epm") to pin a version. ' +
    'create/update will report which groups have multiple versions available so you can ask the user whether to pin.',
  inputSchema: zodToJsonSchema(inputSchema),
  execute,
};
