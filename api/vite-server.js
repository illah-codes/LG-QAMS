import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve, extname } from 'path';
import { readFileSync, existsSync, statSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');

// Cache the Vite server instance
let viteServer = null;

/**
 * Get or create Vite server instance
 * Cached to reuse across function invocations (warm starts)
 */
async function getViteServer() {
  if (!viteServer) {
    viteServer = await createViteServer({
      root,
      server: {
        middlewareMode: true,
        hmr: false, // Disable HMR in serverless environment
      },
      appType: 'spa',
    });
  }
  return viteServer;
}

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.ts': 'application/typescript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

/**
 * Check if path is a file (has extension)
 */
function isFileRequest(pathname) {
  const ext = extname(pathname);
  return ext !== '' && ext !== '/';
}

/**
 * Vercel serverless function handler
 */
export default async function handler(req, res) {
  try {
    const vite = await getViteServer();
    const url = req.url || req.originalUrl || '/';
    const pathname = url.split('?')[0];

    // Handle SPA routing - serve index.html for non-file routes
    if (pathname === '/' || (!isFileRequest(pathname) && !pathname.startsWith('/@'))) {
      try {
        // Read and transform index.html with Vite
        const indexPath = resolve(root, 'index.html');
        const template = readFileSync(indexPath, 'utf-8');
        const transformed = await vite.transformIndexHtml(pathname, template);
        res.setHeader('Content-Type', 'text/html');
        res.status(200).end(transformed);
        return;
      } catch (error) {
        console.error('Error serving index.html:', error);
        // Fallback: serve index.html without transformation
        const indexPath = resolve(root, 'index.html');
        const template = readFileSync(indexPath, 'utf-8');
        res.setHeader('Content-Type', 'text/html');
        res.status(200).end(template);
        return;
      }
    }

    // Handle Vite-specific endpoints (@vite/client, @fs/*, etc.)
    if (pathname.startsWith('/@')) {
      try {
        // Use Vite's transformRequest to handle Vite-specific modules
        const transformed = await vite.transformRequest(pathname, { ssr: false });
        if (transformed) {
          res.setHeader('Content-Type', 'application/javascript');
          res.status(200).end(transformed.code);
          return;
        }
      } catch (error) {
        console.error('Error handling Vite endpoint:', error);
        res.status(404).end('Not found');
        return;
      }
    }

    // Handle file requests - serve from source directory with Vite transforms
    const normalizedPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    const filePath = resolve(root, normalizedPath);

    // Security check - ensure file is within root
    if (!filePath.startsWith(root)) {
      res.status(403).end('Forbidden');
      return;
    }

    // Check if file exists
    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      res.status(404).end('Not found');
      return;
    }

    const ext = extname(filePath);
    const mimeType = mimeTypes[ext] || 'application/octet-stream';

    try {
      // For JS/TS files, use Vite to transform them
      if (ext === '.js' || ext === '.mjs' || ext === '.ts') {
        try {
          // Use Vite's transformRequest - it needs the URL path, not file path
          const transformed = await vite.transformRequest(pathname, { ssr: false });
          if (transformed && transformed.code) {
            res.setHeader('Content-Type', mimeType);
            res.setHeader('Cache-Control', 'no-cache');
            // Handle source maps if present
            if (transformed.map) {
              res.setHeader('X-SourceMap', pathname + '.map');
            }
            res.status(200).end(transformed.code);
            return;
          }
        } catch (transformError) {
          // If transform fails, fall back to reading file directly
          console.warn('Transform failed, serving raw file:', transformError.message);
          const content = readFileSync(filePath, 'utf-8');
          res.setHeader('Content-Type', mimeType);
          res.setHeader('Cache-Control', 'no-cache');
          res.status(200).end(content);
          return;
        }
      }

      // For CSS files, check if they need transformation (e.g., CSS imports)
      if (ext === '.css') {
        try {
          // Try to transform CSS through Vite (handles @import, etc.)
          const transformed = await vite.transformRequest(pathname, { ssr: false });
          if (transformed && transformed.code) {
            res.setHeader('Content-Type', mimeType);
            res.setHeader('Cache-Control', 'no-cache');
            res.status(200).end(transformed.code);
            return;
          }
        } catch (transformError) {
          // Fall through to serve raw CSS
          console.warn('CSS transform failed, serving raw file:', transformError.message);
        }
      }

      // For HTML files in src/pages, serve directly (they're loaded by the router)
      if (ext === '.html' && pathname.startsWith('/src/pages/')) {
        const content = readFileSync(filePath, 'utf-8');
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Cache-Control', 'no-cache');
        res.status(200).end(content);
        return;
      }

      // For other files (images, fonts, etc.), serve directly
      const content = readFileSync(filePath);
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.status(200).end(content);
    } catch (error) {
      console.error('Error serving file:', error);
      res.status(500).end('Error reading file: ' + error.message);
    }
  } catch (error) {
    console.error('Vite server error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  }
}
