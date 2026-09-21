import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIR = path.join(__dirname, 'build', 'client');
const PORT = process.env.PORT || 5173;
const HOST = process.env.HOST || '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.eot':  'application/vnd.ms-fontobject',
  '.txt':  'text/plain; charset=utf-8',
  '.xml':  'application/xml',
  '.webp': 'image/webp',
  '.map':  'application/json',
};

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) return false;
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable' });
    res.end(data);
    return true;
  });
}

const server = http.createServer((req, res) => {
  let urlPath = new URL(req.url, `http://${req.headers.host}`).pathname;

  // Remove leading slash
  let filePath = path.join(CLIENT_DIR, urlPath);

  // Try exact file first
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      return serveFile(res, filePath);
    }

    // Try with .html extension
    const htmlPath = filePath + '.html';
    fs.stat(htmlPath, (err2, stats2) => {
      if (!err2 && stats2.isFile()) {
        return serveFile(res, htmlPath);
      }

      // SPA fallback - serve index.html
      const indexPath = path.join(CLIENT_DIR, 'index.html');
      fs.stat(indexPath, (err3) => {
        if (!err3) {
          return serveFile(res, indexPath);
        }

        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      });
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}/`);
});
