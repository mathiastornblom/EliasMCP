import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  type CallToolResult,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { loadSavedConfig, setSessionConfig } from './session.js';
import { configureTool } from './tools/configure.js';
import { containersTool } from './tools/containers.js';
import { imagesTool } from './tools/images.js';
import { templatesTool } from './tools/templates.js';
import { packagesTool } from './tools/packages.js';
import { certificatesTool } from './tools/certificates.js';
import { solveTool } from './tools/solve.js';
import { exportTool } from './tools/export.js';
import { importTool } from './tools/import.js';
import { aboutTool } from './tools/about.js';
import { accessTool } from './tools/access.js';

const savedConfig = loadSavedConfig();
if (savedConfig) setSessionConfig(savedConfig);

const tools = [
  configureTool,
  containersTool,
  imagesTool,
  templatesTool,
  packagesTool,
  certificatesTool,
  solveTool,
  exportTool,
  importTool,
  aboutTool,
  accessTool,
];

const toolMap = new Map(tools.map((t) => [t.name, t]));

const server = new Server(
  { name: 'elias-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, () => ({
  tools: tools.map(({ name, description, inputSchema }) => ({
    name,
    description,
    inputSchema,
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
  const { name, arguments: args } = request.params;
  const tool = toolMap.get(name);
  if (!tool) {
    return {
      content: [{ type: 'text', text: `Unknown tool: ${name}` }],
      isError: true,
    };
  }
  try {
    const result = await tool.execute(args ?? {});
    return result as CallToolResult;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return { content: [{ type: 'text', text: message }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
