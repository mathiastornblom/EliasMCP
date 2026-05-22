import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { type McpToolResult, ok, fail, ContainerName, ImageName } from '../types.js';
import { getClient } from '../client.js';

const inputSchema = z.object({
  action: z
    .enum(['list', 'get', 'create', 'update', 'delete', 'sign', 'lock'])
    .describe('CRUD operations on IDT image templates, plus sign and lock'),
  container: ContainerName.describe('Container name'),
  name: ImageName.optional().describe('Template name without extension (required for get/create/update/delete/sign/lock)'),
  idf: z.record(z.unknown()).optional().describe('IDT definition object (required for create/update)'),
  overwrite: z.boolean().optional().describe('Overwrite existing template (default: false)'),
});

type Input = z.infer<typeof inputSchema>;

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
    const data = await client.request<unknown[] | unknown>('GET', `/${c}/idt/${n}`);
    if (Array.isArray(data)) {
      if (data.length === 0) return fail(`Template '${input.name}' not found in container '${input.container}'.`);
      return ok(data[0]);
    }
    return ok(data);
  }

  if (input.action === 'create') {
    if (!input.idf) return fail('action=create requires idf.');
    const data = await client.request('POST', `/${c}/idts`, {
      overwrite: input.overwrite ?? false,
      idf: input.idf,
    });
    return ok(data);
  }

  if (input.action === 'update') {
    if (!input.idf) return fail('action=update requires idf.');
    const data = await client.request('PUT', `/${c}/idt/${n}`, {
      overwrite: input.overwrite ?? false,
      idf: input.idf,
    });
    return ok(data);
  }

  if (input.action === 'delete') {
    const data = await client.request('DELETE', `/${c}/idt/${n}`);
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
    'action=create creates a new template (requires idf object). ' +
    'action=update updates an existing template (requires idf object). ' +
    'action=delete deletes a template. ' +
    'action=sign signs a template with the container certificate. ' +
    'action=lock locks a template in its current state.',
  inputSchema: zodToJsonSchema(inputSchema),
  execute,
};
