import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Plugin to handle preset saving during development
function presetApiPlugin(): Plugin {
  return {
    name: 'preset-api',
    configureServer(server) {
      server.middlewares.use('/api/presets', async (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const { id, preset } = JSON.parse(body);
              const presetsDir = path.resolve(__dirname, '../../presets');
              const filePath = path.join(presetsDir, `${id}.json`);

              // Don't include id in the saved file
              const { id: _id, ...presetData } = preset;

              fs.writeFileSync(filePath, JSON.stringify(presetData, null, 2));

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, id }));
            } catch (err) {
              res.statusCode = 500;
              res.end(String(err));
            }
          });
        } else {
          res.statusCode = 405;
          res.end('Method not allowed');
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), presetApiPlugin()],
  resolve: {
    alias: {
      '@bauhaus/core': path.resolve(__dirname, '../../packages/core/src'),
      '@bauhaus/rings': path.resolve(__dirname, '../../packages/rings/src'),
    },
  },
  optimizeDeps: {
    exclude: ['@bauhaus/core', '@bauhaus/rings'],
  },
});
