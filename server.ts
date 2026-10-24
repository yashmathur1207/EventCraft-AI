import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import {
  securityHeadersMiddleware,
  payloadSanitizationMiddleware,
  corsMiddleware,
  apiRateLimiter,
  aiRateLimiter
} from './src/server/middleware/security';
import { eventsRouter } from './src/server/routes/events';
import { geminiRouter } from './src/server/routes/gemini';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Security & Transport Protection Headers
app.use(securityHeadersMiddleware);
app.use(corsMiddleware);

// Safe Body Parsing with bounded size limits (5MB)
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Automatic Payload Sanitization against Stored XSS & Prototype Pollution
app.use(payloadSanitizationMiddleware);

// Rate Limiting Protection (General API: 200 req/min, AI endpoints: 25 req/min)
app.use('/api', apiRateLimiter);
app.use('/api/gemini', aiRateLimiter);

// Modular API Routers
app.use('/api/events', eventsRouter);
app.use('/api/gemini', geminiRouter);

// Serve Vite frontend in development / prebuilt static assets in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ EventCraft AI Full-Stack Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
