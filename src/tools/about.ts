import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { type McpToolResult, ok, ContainerName } from '../types.js';
import { getClient } from '../client.js';

const inputSchema = z.object({
  container: ContainerName.describe('Container name'),
});

async function execute(raw: unknown): Promise<McpToolResult> {
  const input = inputSchema.parse(raw);
  const client = getClient();
  const data = await client.request('GET', `/${encodeURIComponent(input.container)}/about`);
  return ok(data);
}

export const aboutTool = {
  name: 'elias_about',
  description:
    'Get copyright and version information for an ELIAS container.',
  inputSchema: zodToJsonSchema(inputSchema),
  execute,
};
