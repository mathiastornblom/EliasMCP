import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { type McpToolResult, ok, fail, ContainerName, SafeFilename } from '../types.js';
import { getClient } from '../client.js';

const inputSchema = z.object({
  action: z
    .enum(['list-epms', 'list-fpms', 'delete-epm', 'cleanup', 'package-contains'])
    .describe(
      'list-epms = all EPMs; list-fpms = all FPMs; delete-epm = remove EPM; ' +
      'cleanup = remove unused packages; package-contains = find packages containing a file',
    ),
  container: ContainerName.describe('Container name'),
  epm: SafeFilename.optional().describe('EPM identifier (required for delete-epm)'),
  filename: z.string().min(1).max(512).optional().describe('Filename or regex to search for (required for package-contains)'),
  confirm: z.boolean().optional().describe('Must be true to execute cleanup (prevents accidental deletion)'),
});

type Input = z.infer<typeof inputSchema>;

async function execute(raw: unknown): Promise<McpToolResult> {
  const input = inputSchema.parse(raw) as Input;
  const client = getClient();
  const c = encodeURIComponent(input.container);

  if (input.action === 'list-epms') {
    const data = await client.request('GET', `/${c}/epms`);
    return ok(data);
  }

  if (input.action === 'list-fpms') {
    const data = await client.request('GET', `/${c}/fpms`);
    return ok(data);
  }

  if (input.action === 'delete-epm') {
    if (!input.epm) return fail('action=delete-epm requires epm.');
    await client.request('DELETE', `/${c}/epm/${encodeURIComponent(input.epm)}`);
    return ok({ status: 'deleted', epm: input.epm });
  }

  if (input.action === 'cleanup') {
    if (!input.confirm) {
      return fail(
        'action=cleanup permanently removes unused EPMs and FPMs from the container. ' +
        'Pass confirm=true to proceed.',
      );
    }
    const data = await client.request('DELETE', `/${c}/cleanup`);
    return ok(data);
  }

  if (input.action === 'package-contains') {
    if (!input.filename) return fail('action=package-contains requires filename.');
    const data = await client.request('POST', `/${c}/packagecontains`, {
      filename: input.filename,
    });
    return ok(data);
  }

  return fail('Unknown action');
}

export const packagesTool = {
  name: 'elias_packages',
  description:
    'Manage ELIAS packages (EPM/FPM). ' +
    'action=list-epms lists all eLux Package Manager packages. ' +
    'action=list-fpms lists all Feature Package Manager packages. ' +
    'action=delete-epm deletes an EPM (requires epm). ' +
    'action=cleanup removes all unused packages from the container (requires confirm=true). ' +
    'action=package-contains finds which packages contain a specific file (supports regex).',
  inputSchema: zodToJsonSchema(inputSchema),
  execute,
};
