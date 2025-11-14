import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync, existsSync } from 'fs';
import { extname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');

// Cache the Vite server instance
let viteServerPromise;

async function getViteServer() {
  if (!viteServerPromise) {
    viteServerPromise = createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root,
    });
  }
  return viteServerPromise;
}

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

// Vercel serverless function handler
export default async function handler(req, res) {
  try {
    const vite = await getViteServer();
    const url = req.url || req.originalUrl || '/';

    // Remove query string
    const pathname = url.split('?')[0];

    // Handle root and SPA routes - serve index.html
    if (pathname === '/' || (!pathname.includes('.') && !pathname.startsWith('/@'))) {
      try {
        let template = readFileSync(resolve(root, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(pathname, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        return;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error transforming HTML:', error);
        res.status(500).end('Error loading page');
        return;
      }
    }

    // Handle Vite internal requests (@vite/client, etc.)
    if (pathname.startsWith('/@')) {
      // Let Vite handle these through its internal server
      // We'll need to proxy these, but for now return 404
      res.status(404).end('Vite internal request not handled');
      return;
    }

    // Handle source files - check if file exists and serve it
    const filePath = resolve(root, pathname.startsWith('/') ? pathname.slice(1) : pathname);

    // Security check - ensure file is within root
    if (!filePath.startsWith(root)) {
      res.status(403).end('Forbidden');
      return;
    }

    if (existsSync(filePath)) {
      try {
        const ext = extname(filePath);
        const mimeType = mimeTypes[ext] || 'application/octet-stream';
        const content = readFileSync(filePath, 'utf-8');

        // Transform JS/CSS through Vite if needed
        if (ext === '.js' || ext === '.css') {
          try {
            const transformed = await vite.transformRequest(pathname, { ssr: false });
            res
              .status(200)
              .set({ 'Content-Type': mimeType })
              .end(transformed?.code || content);
            return;
          } catch {
            // If transformation fails, serve original
            res.status(200).set({ 'Content-Type': mimeType }).end(content);
            return;
          }
        }

        res.status(200).set({ 'Content-Type': mimeType }).end(content);
        return;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error reading file:', error);
        res.status(500).end('Error reading file');
        return;
      }
    }

    // File not found
    res.status(404).end('Not found');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Server error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
      });
    }
  }
}
