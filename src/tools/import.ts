import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { type McpToolResult, ok, fail, ContainerName, ImageName, SafeFilename } from '../types.js';
import { getClient, FormData, File } from '../client.js';

const ALLOWED_ARCHIVE_EXTENSIONS = ['.zip', '.cab', '.udf', '.cap', '.bup'];
const ALLOWED_IMAGE_EXTENSIONS = ['.idf', '.idt', '.jidf'];

const inputSchema = z.object({
  action: z
    .enum(['zip', 'idf', 'idt', 'jidf', 'check-status'])
    .describe(
      'zip = import archive file; idf/idt/jidf = import image text; ' +
      'check-status = poll async import status by importId',
    ),
  container: ContainerName.describe('Container name'),
  filename: SafeFilename.optional().describe('Archive filename including extension (required for zip)'),
  name: ImageName.optional().describe('Image name without extension (required for idf/idt/jidf)'),
  content: z.string().optional().describe('IDF/IDT/JIDF file content as text (required for idf/idt/jidf)'),
  fileContentBase64: z
    .string()
    .optional()
    .describe('Archive file content as base64 (required for zip)'),
  force: z.boolean().optional().describe('Overwrite existing files (default: false)'),
  importId: z.string().optional().describe('Import job UUID for check-status'),
});

type Input = z.infer<typeof inputSchema>;

async function execute(raw: unknown): Promise<McpToolResult> {
  const input = inputSchema.parse(raw) as Input;
  const client = getClient();
  const c = encodeURIComponent(input.container);
  const forcePrefix = input.force ? '/force' : '';

  if (input.action === 'zip') {
    if (!input.filename) return fail('action=zip requires filename.');
    if (!input.fileContentBase64) return fail('action=zip requires fileContentBase64.');

    const ext = input.filename.substring(input.filename.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_ARCHIVE_EXTENSIONS.includes(ext)) {
      return fail(`Archive must be one of: ${ALLOWED_ARCHIVE_EXTENSIONS.join(', ')}`);
    }

    const buffer = Buffer.from(input.fileContentBase64, 'base64');
    const formData = new FormData();
    formData.append('zip', new File([buffer], input.filename));

    const result = await client.requestMultipart(
      'POST',
      `/${c}/import${forcePrefix}/${encodeURIComponent(input.filename)}`,
      formData,
    );

    const importId = result.headers['uuid'] ?? null;
    return ok({ importId, status: importId ? 'pending' : 'completed', body: result.body });
  }

  if (input.action === 'check-status') {
    if (!input.importId) return fail('action=check-status requires importId.');
    const data = await client.request('GET', `/${c}/checkimport/${encodeURIComponent(input.importId)}`);
    return ok(data);
  }

  if (['idf', 'idt', 'jidf'].includes(input.action)) {
    if (!input.name) return fail(`action=${input.action} requires name.`);
    if (!input.content) return fail(`action=${input.action} requires content.`);

    const ext = `.${input.action}`;
    if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
      return fail(`Unsupported image extension: ${ext}`);
    }

    const n = encodeURIComponent(input.name);
    // Try JSON object body first (avoids checksum issues with string-encoded content).
    // Fall back to text/plain for non-JSON formats (legacy IDF).
    let body: unknown;
    try {
      body = JSON.parse(input.content);
    } catch {
      body = null;
    }

    if (body !== null && typeof body === 'object') {
      const result = await client.request<unknown>(
        'POST',
        `/${c}/import${forcePrefix}/${n}${ext}`,
        body,
      );
      return ok(result);
    }

    const data = await client.requestText(
      'POST',
      `/${c}/import${forcePrefix}/${n}${ext}`,
      input.content,
    );
    try {
      return ok(JSON.parse(data));
    } catch {
      return ok({ message: data });
    }
  }

  return fail('Unknown action');
}

export const importTool = {
  name: 'elias_import',
  description:
    'Import data into an ELIAS container. ' +
    'action=zip imports an archive file (.zip, .cab, .udf, .cap, .bup) as base64 content — ' +
    'returns importId for async status polling. ' +
    'action=idf/idt/jidf imports image definition text directly. ' +
    'action=check-status polls async import status (requires importId). ' +
    'Pass force=true to overwrite existing files.',
  inputSchema: zodToJsonSchema(inputSchema),
  execute,
};
