import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'node:url';
import { copyFileSync, mkdirSync, readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Recursive function to copy files with specific extensions
function copyRecursive(src, dest, fileExtensions = ['.html']) {
  try {
    mkdirSync(dest, { recursive: true });
    const entries = readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = join(src, entry.name);
      const destPath = join(dest, entry.name);

      if (entry.isDirectory()) {
        copyRecursive(srcPath, destPath, fileExtensions);
      } else if (entry.isFile()) {
        const ext = entry.name.substring(entry.name.lastIndexOf('.'));
        if (fileExtensions.includes(ext)) {
          copyFileSync(srcPath, destPath);
        }
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error copying from ${src} to ${dest}:`, error);
    throw error;
  }
}

// Plugin to copy HTML pages and CSS files to dist
function copyPagesPlugin() {
  return {
    name: 'copy-pages',
    writeBundle() {
      try {
        // Copy HTML pages
        const srcPagesDir = resolve(__dirname, 'src/pages');
        const distPagesDir = resolve(__dirname, 'dist/src/pages');
        copyRecursive(srcPagesDir, distPagesDir, ['.html']);

        // Copy CSS files (needed because HTML pages reference them)
        const srcStylesDir = resolve(__dirname, 'src/styles');
        const distStylesDir = resolve(__dirname, 'dist/src/styles');
        copyRecursive(srcStylesDir, distStylesDir, ['.css']);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error in copy-pages plugin:', error);
        throw error;
      }
    },
  };
}

export default {
  root: '.',
  plugins: [copyPagesPlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
      output: {
        // Ensure dynamic imports are properly resolved
        inlineDynamicImports: false,
        // Preserve module structure for dynamic imports
        format: 'es',
      },
      // Don't externalize any dependencies - bundle everything
      // All npm packages including @supabase/supabase-js should be bundled
      external: (id) => {
        // Only externalize Node.js built-ins, not npm packages
        return id.startsWith('node:');
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    // Ensure all dependencies are bundled
    ssr: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@pages': resolve(__dirname, './src/pages'),
      '@components': resolve(__dirname, './src/components'),
      '@utils': resolve(__dirname, './src/utils'),
      '@styles': resolve(__dirname, './src/styles'),
      '@assets': resolve(__dirname, './src/assets'),
      // Replace Node.js modules with browser-compatible shims
      ws: resolve(__dirname, './src/utils/ws-shim.js'),
    },
    conditions: ['browser', 'module', 'import'],
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['ws'],
    include: ['flowbite', '@supabase/supabase-js'],
  },
  server: {
    port: 3000,
    open: true,
  },
};
