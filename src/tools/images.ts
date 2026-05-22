import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { type McpToolResult, ok, fail, ContainerName, ImageName } from '../types.js';
import { getClient } from '../client.js';

const inputSchema = z.object({
  action: z
    .enum(['list', 'get', 'create', 'update', 'delete', 'sign', 'lock'])
    .describe('CRUD operations on IDF images, plus sign and lock'),
  container: ContainerName.describe('Container name'),
  name: ImageName.optional().describe('Image name without extension (required for get/create/update/delete/sign/lock)'),
  idf: z.record(z.unknown()).optional().describe('IDF definition object (required for create/update)'),
  overwrite: z.boolean().optional().describe('Overwrite existing image (default: false)'),
});

type Input = z.infer<typeof inputSchema>;

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
    const data = await client.request('POST', `/${c}/idfs`, {
      overwrite: input.overwrite ?? false,
      idf: input.idf,
    });
    return ok(data);
  }

  if (input.action === 'update') {
    if (!input.idf) return fail('action=update requires idf.');
    const data = await client.request('PUT', `/${c}/idf/${n}.idf`, {
      overwrite: input.overwrite ?? false,
      idf: input.idf,
    });
    return ok(data);
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

  return fail('Unknown action');
}

export const imagesTool = {
  name: 'elias_images',
  description:
    'Manage ELIAS image definitions (IDF). ' +
    'action=list returns all images in a container. ' +
    'action=get retrieves a specific image. ' +
    'action=create creates a new image (requires idf object). ' +
    'action=update updates an existing image (requires idf object). ' +
    'action=delete deletes an image. ' +
    'action=sign signs an image with the container certificate. ' +
    'action=lock locks an image in its current state.',
  inputSchema: zodToJsonSchema(inputSchema),
  execute,
};
