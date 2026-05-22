import { z } from 'zod';

// ── Shared path-safe validators (prevent path traversal) ──────────────────────

export const ContainerName = z
  .string()
  .min(1)
  .max(255)
  .regex(/^[a-zA-Z0-9._-]+$/, 'Container name must contain only letters, digits, dots, underscores, and hyphens');

export const ImageName = z
  .string()
  .min(1)
  .max(255)
  .regex(/^[a-zA-Z0-9._-]+$/, 'Image name must contain only letters, digits, dots, underscores, and hyphens');

export const SafeFilename = z
  .string()
  .min(1)
  .max(255)
  .regex(/^[a-zA-Z0-9._-]+$/, 'Filename must contain only letters, digits, dots, underscores, and hyphens');

// ── MCP tool contract ─────────────────────────────────────────────────────────

export interface McpToolResult {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

export function ok(data: unknown): McpToolResult {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}

export function fail(message: string): McpToolResult {
  return {
    content: [{ type: 'text', text: message }],
    isError: true,
  };
}

// ── URL query string builder ──────────────────────────────────────────────────

export function buildQuery(
  params: Record<string, string | number | boolean | undefined>,
): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return '';
  const qs = entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return `?${qs}`;
}
