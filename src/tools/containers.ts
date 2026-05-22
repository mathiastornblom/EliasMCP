import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { type McpToolResult, ok, fail, ContainerName } from '../types.js';
import { getClient } from '../client.js';

const inputSchema = z.object({
  action: z
    .enum(['list', 'check', 'create', 'rename', 'delete'])
    .describe('list = all containers; check = validate container; create/rename/delete = manage'),
  name: ContainerName.optional().describe('Container name (required for check, create, rename, delete)'),
  newName: ContainerName.optional().describe('New container name (required for rename)'),
});

type Input = z.infer<typeof inputSchema>;

async function execute(raw: unknown): Promise<McpToolResult> {
  const input = inputSchema.parse(raw) as Input;
  const client = getClient();

  if (input.action === 'list') {
    const data = await client.request('GET', '/containers');
    return ok(data);
  }

  if (input.action === 'check') {
    if (!input.name) return fail('action=check requires name.');
    const data = await client.request('GET', `/container/${encodeURIComponent(input.name)}`);
    return ok(data);
  }

  if (input.action === 'create') {
    if (!input.name) return fail('action=create requires name.');
    const data = await client.request('POST', `/container/${encodeURIComponent(input.name)}`);
    return ok(data);
  }

  if (input.action === 'rename') {
    if (!input.name) return fail('action=rename requires name.');
    if (!input.newName) return fail('action=rename requires newName.');
    const data = await client.request('PUT', `/container/${encodeURIComponent(input.name)}`, {
      name: input.newName,
    });
    return ok(data);
  }

  if (input.action === 'delete') {
    if (!input.name) return fail('action=delete requires name.');
    const data = await client.request('DELETE', `/container/${encodeURIComponent(input.name)}`);
    return ok(data);
  }

  return fail('Unknown action');
}

export const containersTool = {
  name: 'elias_containers',
  description:
    'Manage ELIAS containers. ' +
    'action=list returns all containers. ' +
    'action=check validates a container by name. ' +
    'action=create creates a new container. ' +
    'action=rename renames an existing container (requires newName). ' +
    'action=delete deletes a container.',
  inputSchema: zodToJsonSchema(inputSchema),
  execute,
};
