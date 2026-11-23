import type { IncomingMessage, ServerResponse } from 'node:http';

interface ServerlessResponse extends ServerResponse {
  status?: (code: number) => ServerlessResponse;
  json?: (body: unknown) => void;
}

export default function handler(_req: IncomingMessage, res: ServerlessResponse) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(200);
    res.json({ ok: true });
    return;
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ ok: true }));
}
