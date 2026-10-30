import { defineConfig, loadEnv } from "vite";
import { Readable } from 'node:stream';
import process from 'node:process';
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import githubContributions from "./api/github-contributions.js";
import chat from './api/chat.js';

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), {
    name: 'public-github-calendar',
    configureServer(server) {
      const local = loadEnv(mode, process.cwd(), '');
      // Only server-side code receives these values. VITE_ variables remain public.
      for (const name of ['GEMINI_API_KEY', 'GROQ_API_KEY', 'GEMINI_MODEL', 'GROQ_MODEL', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN', 'VISITOR_COOKIE_SECRET', 'AI_RATE_LIMIT_SECRET']) {
        if (local[name]) process.env[name] = local[name];
      }
      server.middlewares.use('/api/chat', async (request, response) => {
        const abort = new AbortController();
        response.on('close', () => { if (!response.writableEnded) abort.abort(); });
        try {
          const headers = new Headers();
          for (const [name, value] of Object.entries(request.headers)) {
            if (Array.isArray(value)) value.forEach(item => headers.append(name, item));
            else if (value !== undefined) headers.set(name, value);
          }
          let body = '';
          if (request.method === 'POST') {
            let bytes = 0;
            const chunks: Buffer[] = [];
            for await (const chunk of request) {
              const value = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
              bytes += value.length;
              if (bytes > 16000) { response.writeHead(400, { 'Content-Type': 'application/json' }); response.end(JSON.stringify({ code: 'invalid_request' })); return; }
              chunks.push(value);
            }
            body = Buffer.concat(chunks).toString('utf8');
          }
          const result = await chat.fetch(new Request(`http://${request.headers.host}/api/chat`, { method: request.method, headers, signal: abort.signal, ...(request.method === 'POST' ? { body } : {}) }));
          response.statusCode = result.status;
          result.headers.forEach((value, name) => response.setHeader(name, value));
          if (result.body) Readable.fromWeb(result.body as import('node:stream/web').ReadableStream<Uint8Array>).pipe(response);
          else response.end();
        } catch {
          if (!response.headersSent) response.writeHead(503, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ code: 'unavailable' }));
        }
      });
      server.middlewares.use('/api/github-contributions', async (request, response) => {
        const result = await githubContributions.fetch(new Request('http://localhost/api/github-contributions', { method: request.method }));
        response.statusCode = result.status;
        result.headers.forEach((value, name) => response.setHeader(name, value));
        response.end(await result.text());
      });
    },
  }],
}));
