import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import path from 'path';
import { existsSync } from 'fs';
import { scanProjects } from './scanner.js';
import { createWatcher } from './watcher.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '3737', 10);
const distPath = path.join(__dirname, '../dist');

const fastify = Fastify({ logger: false });

if (existsSync(distPath)) {
  await fastify.register(fastifyStatic, { root: distPath, prefix: '/' });
}

const clients = new Set();
let cache = [];

async function refresh() {
  cache = scanProjects();
  return cache;
}

await refresh();

// Watch only the specific files we found — avoids scanning build dirs
createWatcher(
  cache.map(p => p._filePath),
  async () => {
    await refresh();
    for (const res of clients) {
      try { res.write('event: data-changed\ndata: {}\n\n'); } catch { clients.delete(res); }
    }
  }
);

fastify.get('/api/projects', async () => {
  // Strip internal _filePath before sending to client
  return cache.map(({ _filePath, ...rest }) => rest);
});

fastify.get('/api/refresh', async () => {
  await refresh();
  return cache.map(({ _filePath, ...rest }) => rest);
});

fastify.get('/api/events', (req, reply) => {
  reply.hijack();
  const raw = reply.raw;
  raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  raw.write(': connected\n\n');
  clients.add(raw);

  const heartbeat = setInterval(() => {
    try { raw.write(': heartbeat\n\n'); } catch { clients.delete(raw); clearInterval(heartbeat); }
  }, 25000);

  req.raw.on('close', () => { clients.delete(raw); clearInterval(heartbeat); });
});

fastify.setNotFoundHandler((req, reply) => {
  if (req.url.startsWith('/api')) {
    return reply.code(404).send({ error: 'Not found' });
  }
  if (existsSync(distPath)) return reply.sendFile('index.html');
  reply.send('Dev mode: run `npm run dev:client` for the frontend.');
});

await fastify.listen({ port: PORT, host: '0.0.0.0' });
console.log(`BMAD Dashboard → http://localhost:${PORT}`);
