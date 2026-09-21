import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIR = path.join(__dirname, 'build', 'client');
const PORT = process.env.PORT || 5173;
const HOST = process.env.HOST || '0.0.0.0';

console.log('📁 Serving from:', CLIENT_DIR);
console.log('📂 Files:', fs.readdirSync(CLIENT_DIR).slice(0, 20));

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.txt':  'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.map':  'application/json',
};

const server = http.createServer((req, res) => {
  const urlPath = new URL(req.url, `http://${req.headers.host}`).pathname;

  // Try to find the file in build/client
  const tryPaths = [
    path.join(CLIENT_DIR, urlPath),
    path.join(CLIENT_DIR, urlPath + '.html'),
    path.join(CLIENT_DIR, 'index.html'),
  ];

  for (const tryPath of tryPaths) {
    try {
      if (fs.existsSync(tryPath) && fs.statSync(tryPath).isFile()) {
        const data = fs.readFileSync(tryPath);
        const ext = path.extname(tryPath).toLowerCase();
        const mime = MIME_TYPES[ext] || 'application/octet-stream';
        const cache = ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable';
        res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': cache });
        res.end(data);
        return;
      }
    } catch (e) {
      console.error('Error reading:', tryPath, e.message);
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}/`);
});
