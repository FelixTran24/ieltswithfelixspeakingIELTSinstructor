import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleTtsRequest } from '../src/server/speakingHandlers.ts';

interface ServerlessRequest extends IncomingMessage {
  body?: unknown;
}

interface ServerlessResponse extends ServerResponse {
  status?: (code: number) => ServerlessResponse;
  json?: (body: unknown) => void;
}

async function readJsonBody(req: ServerlessRequest): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === 'object') {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    return JSON.parse(req.body) as Record<string, unknown>;
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
}

function sendJson(res: ServerlessResponse, status: number, body: Record<string, unknown>) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(status);
    res.json(body);
    return;
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const result = await handleTtsRequest(body);
    sendJson(res, result.status, result.body);
  } catch {
    sendJson(res, 400, { error: 'Dữ liệu JSON gửi lên không hợp lệ.' });
  }
}
