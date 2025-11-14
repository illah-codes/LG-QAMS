import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync, existsSync } from 'fs';
import { extname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');

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
  '.ico': 'image/x-icon',
};

// Transform imports to use esm.sh CDN for bare specifiers
function transformImports(content, filePath) {
  // Only transform JS files
  if (!filePath.endsWith('.js')) {
    return content;
  }

  // Replace bare module specifiers with esm.sh CDN
  // Handle: import ... from 'package' and import 'package'
  // But preserve relative imports and absolute URLs
  return content
    .replace(/import\s+([^'"]*)\s+from\s+['"]([^./][^'"]*)['"]/g, (match, imports, pkg) => {
      // Skip if it's a relative import or absolute URL
      if (pkg.startsWith('.') || pkg.startsWith('/') || pkg.startsWith('http')) {
        return match;
      }
      // Transform bare specifier to esm.sh
      return `import ${imports} from 'https://esm.sh/${pkg}'`;
    })
    .replace(/import\s+['"]([^./][^'"]*)['"]/g, (match, pkg) => {
      // Skip if it's a relative import or absolute URL
      if (pkg.startsWith('.') || pkg.startsWith('/') || pkg.startsWith('http')) {
        return match;
      }
      // Transform bare specifier to esm.sh
      return `import 'https://esm.sh/${pkg}'`;
    })
    .replace(/export\s+.*\s+from\s+['"]([^./][^'"]*)['"]/g, (match, pkg) => {
      // Skip if it's a relative import or absolute URL
      if (pkg.startsWith('.') || pkg.startsWith('/') || pkg.startsWith('http')) {
        return match;
      }
      // Transform bare specifier to esm.sh
      return match.replace(pkg, `https://esm.sh/${pkg}`);
    });
}

// Transform HTML to inject import map and transform script tags
function transformHTML(content) {
  // Add import map for common dependencies
  const importMap = `
    <script type="importmap">
    {
      "imports": {
        "@supabase/supabase-js": "https://esm.sh/@supabase/supabase-js@2",
        "flowbite": "https://esm.sh/flowbite@3",
        "jspdf": "https://esm.sh/jspdf@2",
        "qrcode": "https://esm.sh/qrcode@1"
      }
    }
    </script>
  `;

  // Inject import map before the first script tag
  return content.replace(/(<head>)/i, `$1${importMap}`);
}

// Vercel serverless function handler
export default async function handler(req, res) {
  try {
    const url = req.url || req.originalUrl || '/';
    const pathname = url.split('?')[0];

    // Handle root and SPA routes - serve index.html
    if (pathname === '/' || (!pathname.includes('.') && !pathname.startsWith('/@'))) {
      try {
        let template = readFileSync(resolve(root, 'index.html'), 'utf-8');
        template = transformHTML(template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        return;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error serving HTML:', error);
        res.status(500).end('Error loading page: ' + error.message);
        return;
      }
    }

    // Handle source files
    // Normalize path: remove leading slash and resolve
    const normalizedPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    const filePath = resolve(root, normalizedPath);

    // Security check - ensure file is within root
    if (!filePath.startsWith(root)) {
      // eslint-disable-next-line no-console
      console.error('Security check failed:', { filePath, root, pathname });
      res.status(403).end('Forbidden');
      return;
    }

    // Debug logging
    // eslint-disable-next-line no-console
    console.log('File request:', {
      pathname,
      normalizedPath,
      filePath,
      exists: existsSync(filePath),
    });

    if (existsSync(filePath)) {
      try {
        const ext = extname(filePath);
        const mimeType = mimeTypes[ext] || 'application/octet-stream';
        let content = readFileSync(filePath, 'utf-8');

        // Transform JS files to use CDN for bare specifiers
        if (ext === '.js') {
          content = transformImports(content, filePath);
        }

        // Transform HTML files
        if (ext === '.html') {
          content = transformHTML(content);
        }

        res.status(200).set({ 'Content-Type': mimeType }).end(content);
        return;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error reading file:', error);
        res.status(500).end('Error reading file: ' + error.message);
        return;
      }
    }

    // File not found
    res.status(404).end('Not found: ' + pathname);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Server error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  }
}
