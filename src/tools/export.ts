import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { type McpToolResult, ok, fail, ContainerName, ImageName } from '../types.js';
import { getClient } from '../client.js';

const inputSchema = z.object({
  action: z
    .enum(['container', 'idf', 'idt', 'jidf', 'sig', 'stw', 'zip'])
    .describe(
      'container = export entire container as zip; idf/idt/jidf = export image as text; ' +
      'sig = export image signature; stw = StickWizz format; zip = full image zip',
    ),
  container: ContainerName.describe('Container name'),
  name: ImageName.optional().describe('Image name without extension (required for all except container)'),
  stickWizzDescription: z
    .string()
    .optional()
    .describe('Optional description shown in StickWizz (only for stw)'),
});

type Input = z.infer<typeof inputSchema>;

const TEXT_ACTIONS = new Set(['idf', 'idt', 'jidf']);
const BINARY_ACTIONS = new Set(['container', 'sig', 'stw', 'zip']);

async function execute(raw: unknown): Promise<McpToolResult> {
  const input = inputSchema.parse(raw) as Input;
  const client = getClient();
  const c = encodeURIComponent(input.container);

  if (input.action === 'container') {
    const { data, contentType } = await client.requestBinary('GET', `/${c}/export/container`);
    return ok({
      contentType,
      sizeBytes: data.length,
      dataBase64: data.toString('base64'),
    });
  }

  if (!input.name) return fail(`action=${input.action} requires name.`);
  const n = encodeURIComponent(input.name);

  if (TEXT_ACTIONS.has(input.action)) {
    const text = await client.requestText('GET', `/${c}/export/${n}.${input.action}`);
    return ok({ content: text });
  }

  if (input.action === 'stw') {
    const qs = input.stickWizzDescription
      ? `?stickWizzDescription=${encodeURIComponent(input.stickWizzDescription)}`
      : '';
    const { data, contentType } = await client.requestBinary('GET', `/${c}/export/${n}.stw${qs}`);
    return ok({
      contentType,
      sizeBytes: data.length,
      dataBase64: data.toString('base64'),
    });
  }

  if (BINARY_ACTIONS.has(input.action)) {
    const ext = input.action === 'sig' ? 'sig' : 'zip';
    const { data, contentType } = await client.requestBinary('GET', `/${c}/export/${n}.${ext}`);
    return ok({
      contentType,
      sizeBytes: data.length,
      dataBase64: data.toString('base64'),
    });
  }

  return fail('Unknown action');
}

export const exportTool = {
  name: 'elias_export',
  description:
    'Export ELIAS container or image data. ' +
    'action=container exports the entire container as a zip (returned as base64). ' +
    'action=idf/idt/jidf exports the image definition as text. ' +
    'action=sig exports the image signature (base64). ' +
    'action=stw exports as StickWizz format (base64). ' +
    'action=zip exports a full image bundle as zip (base64).',
  inputSchema: zodToJsonSchema(inputSchema),
  execute,
};
