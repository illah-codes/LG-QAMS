import express from 'express';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');

let viteServer;
let appInstance;

async function getViteServer() {
  if (!viteServer) {
    viteServer = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root,
    });
  }
  return viteServer;
}

async function createApp() {
  const app = express();
  const vite = await getViteServer();

  app.use(vite.middlewares);

  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl;
      let template = readFileSync(resolve(root, 'index.html'), 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      console.error(e);
      res.status(500).end(e.message);
    }
  });

  return app;
}

// Vercel serverless function handler
export default async function handler(req, res) {
  if (!appInstance) {
    appInstance = await createApp();
  }
  return appInstance(req, res);
}
