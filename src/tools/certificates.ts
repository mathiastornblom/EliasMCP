import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { type McpToolResult, ok, fail, ContainerName, SafeFilename } from '../types.js';
import { getClient, FormData, File } from '../client.js';

const inputSchema = z.object({
  action: z
    .enum(['list', 'get', 'save', 'get-signing', 'save-signing'])
    .describe(
      'list = all certs; get = single cert; save = upload cert (PEM text); ' +
      'get-signing = container signing cert; save-signing = upload signing cert (base64 file content)',
    ),
  container: ContainerName.describe('Container name'),
  filename: SafeFilename.optional().describe('Certificate filename (required for get/save)'),
  content: z.string().optional().describe('PEM certificate content as text (required for save)'),
  fileContentBase64: z
    .string()
    .optional()
    .describe('Signing cert file content as base64 (required for save-signing; .pfx or .pem)'),
  signingFilename: SafeFilename.optional().describe('Filename for the signing cert (required for save-signing)'),
  password: z.string().optional().describe('Password for the signing certificate (if encrypted)'),
});

type Input = z.infer<typeof inputSchema>;

const ALLOWED_SIGNING_EXTENSIONS = ['.pfx', '.pem'];

async function execute(raw: unknown): Promise<McpToolResult> {
  const input = inputSchema.parse(raw) as Input;
  const client = getClient();
  const c = encodeURIComponent(input.container);

  if (input.action === 'list') {
    const data = await client.request('GET', `/${c}/certs`);
    return ok(data);
  }

  if (input.action === 'get-signing') {
    const data = await client.request('GET', `/${c}/sign`);
    return ok(data);
  }

  if (input.action === 'get') {
    if (!input.filename) return fail('action=get requires filename.');
    const data = await client.request('GET', `/${c}/cert/${encodeURIComponent(input.filename)}`);
    return ok(data);
  }

  if (input.action === 'save') {
    if (!input.filename) return fail('action=save requires filename.');
    if (!input.content) return fail('action=save requires content (PEM text).');
    const data = await client.requestText('POST', `/${c}/cert/${encodeURIComponent(input.filename)}`, input.content);
    try {
      return ok(JSON.parse(data));
    } catch {
      return ok({ message: data });
    }
  }

  if (input.action === 'save-signing') {
    if (!input.fileContentBase64) return fail('action=save-signing requires fileContentBase64.');
    if (!input.signingFilename) return fail('action=save-signing requires signingFilename.');

    const ext = input.signingFilename.substring(input.signingFilename.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_SIGNING_EXTENSIONS.includes(ext)) {
      return fail(`Signing cert must be one of: ${ALLOWED_SIGNING_EXTENSIONS.join(', ')}`);
    }

    const buffer = Buffer.from(input.fileContentBase64, 'base64');
    const formData = new FormData();
    if (input.password) {
      formData.append('password', input.password);
    }
    formData.append('files', new File([buffer], input.signingFilename));

    const result = await client.requestMultipart('POST', `/${c}/sign`, formData);
    return ok(result.body ?? { status: 'uploaded' });
  }

  return fail('Unknown action');
}

export const certificatesTool = {
  name: 'elias_certificates',
  description:
    'Manage ELIAS certificates. ' +
    'action=list returns all certificates in a container. ' +
    'action=get retrieves a specific certificate by filename. ' +
    'action=save uploads a PEM certificate (requires filename and content). ' +
    'action=get-signing returns the container signing certificate. ' +
    'action=save-signing uploads a signing certificate (.pfx or .pem) as base64 content.',
  inputSchema: zodToJsonSchema(inputSchema),
  execute,
};
