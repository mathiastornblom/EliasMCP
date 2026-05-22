import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { type McpToolResult, ok, fail } from '../types.js';
import { getClient } from '../client.js';

const inputSchema = z.object({
  action: z
    .enum(['list', 'set', 'delete'])
    .describe('list = all access controls; set = add access control; delete = remove by ID'),
  id: z
    .string()
    .regex(/^[a-zA-Z0-9._-]+$/, 'Access control ID must contain only alphanumeric characters, dots, dashes, or underscores')
    .optional()
    .describe('Access control ID (required for delete)'),
  accessControl: z
    .object({
      keycloakRole: z.string().optional(),
      adUser: z.string().optional(),
      adGroup: z.string().optional(),
      adDomain: z.string().optional(),
      accessRole: z.string().optional(),
      userType: z.string().optional(),
      container: z.string().optional(),
      isGlobalAdmin: z.boolean().optional(),
    })
    .optional()
    .describe('Access control definition (required for set). Requires global admin rights.'),
});

type Input = z.infer<typeof inputSchema>;

async function execute(raw: unknown): Promise<McpToolResult> {
  const input = inputSchema.parse(raw) as Input;
  const client = getClient();

  if (input.action === 'list') {
    const data = await client.request('GET', '/accessControls');
    return ok(data);
  }

  if (input.action === 'set') {
    if (!input.accessControl) return fail('action=set requires accessControl object.');
    const data = await client.request('POST', '/accessControl', input.accessControl);
    return ok(data);
  }

  if (input.action === 'delete') {
    if (!input.id) return fail('action=delete requires id.');
    const data = await client.request('DELETE', `/accessControl/${encodeURIComponent(input.id)}`);
    return ok(data);
  }

  return fail('Unknown action');
}

export const accessTool = {
  name: 'elias_access_control',
  description:
    'Manage ELIAS access controls (requires global admin rights). ' +
    'action=list returns all access control entries. ' +
    'action=set creates or updates an access control. ' +
    'action=delete removes an access control by ID.',
  inputSchema: zodToJsonSchema(inputSchema),
  execute,
};
