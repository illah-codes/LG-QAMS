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

// Function to collect all JS files that might be dynamically imported
function collectAllJSFiles() {
  const srcDir = resolve(__dirname, 'src');
  const files = [];

  function collect(dir, baseDir = srcDir) {
    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          collect(fullPath, baseDir);
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
          files.push(fullPath);
        }
      }
    } catch {
      // Ignore errors
    }
  }

  // Collect from directories that are dynamically imported
  ['services', 'utils', 'components', 'config', 'guards'].forEach((dir) => {
    const dirPath = resolve(srcDir, dir);
    try {
      if (
        readdirSync(srcDir, { withFileTypes: true }).some((e) => e.isDirectory() && e.name === dir)
      ) {
        collect(dirPath);
      }
    } catch {
      // Ignore
    }
  });

  return files;
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
      input: (() => {
        // Include main entry point
        const input = {
          main: resolve(__dirname, 'index.html'),
        };

        // Include all JS files that might be dynamically imported
        // This ensures they're bundled and can be imported at runtime
        const jsFiles = collectAllJSFiles();
        jsFiles.forEach((file) => {
          // Use the relative path from src as the entry name
          // This preserves the path structure for dynamic imports
          const relativePath = file.replace(resolve(__dirname, 'src') + '/', '');
          const entryName = relativePath.replace(/\.js$/, '');
          input[entryName] = file;
        });

        return input;
      })(),
      output: {
        manualChunks: undefined,
        // Ensure dynamic imports are properly resolved
        inlineDynamicImports: false,
        // Preserve module structure for dynamic imports
        format: 'es',
        // Preserve entry file names for dynamic imports
        entryFileNames: (chunkInfo) => {
          // If it's the main entry, use the default name
          if (chunkInfo.name === 'main') {
            return 'assets/[name]-[hash].js';
          }
          // For other entries, preserve the path structure so dynamic imports work
          // The entry name is already the relative path (e.g., "services/auth")
          return `src/${chunkInfo.name}.js`;
        },
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
