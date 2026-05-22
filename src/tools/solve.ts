import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { type McpToolResult, ok, fail, ContainerName } from '../types.js';
import { getClient } from '../client.js';

const inputSchema = z.object({
  action: z
    .enum(['solve', 'has-conflicts', 'find-conflicts', 'is-self-contained'])
    .describe(
      'solve = find complete package set; has-conflicts = check for conflicts; ' +
      'find-conflicts = list conflicting packages; is-self-contained = check if image is self-contained',
    ),
  container: ContainerName.describe('Container name'),
  parcels: z
    .array(z.string())
    .describe('List of package IDs to operate on'),
});

type Input = z.infer<typeof inputSchema>;

const actionPath: Record<Input['action'], string> = {
  'solve': 'solve',
  'has-conflicts': 'hasconflicts',
  'find-conflicts': 'findconflicts',
  'is-self-contained': 'isselfcontained',
};

async function execute(raw: unknown): Promise<McpToolResult> {
  const input = inputSchema.parse(raw) as Input;
  const client = getClient();
  const c = encodeURIComponent(input.container);
  const path = actionPath[input.action];

  const data = await client.request('POST', `/${c}/${path}`, { parcels: input.parcels });
  return ok(data);
}

export const solveTool = {
  name: 'elias_solve',
  description:
    'Resolve and validate ELIAS image package dependencies. ' +
    'action=solve finds a complete, dependency-resolved package list for the given parcels. ' +
    'action=has-conflicts returns true if the package list has conflicts. ' +
    'action=find-conflicts returns the list of conflicting packages. ' +
    'action=is-self-contained checks if all dependencies are satisfied within the container.',
  inputSchema: zodToJsonSchema(inputSchema),
  execute,
};
