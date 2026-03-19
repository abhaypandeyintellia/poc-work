import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import { connectRedis } from './config/redis.js';
import { initWebSocket } from './ws/websocket.js';

dotenv.config();

const app = express();
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uiDistPath = path.resolve(__dirname, '../../poc_ui/dist');
const hasUiBuild = existsSync(path.join(uiDistPath, 'index.html'));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRoutes);

if (hasUiBuild) {
  app.use(express.static(uiDistPath));

  app.get(/^(?!\/auth|\/health).*/, (_req, res) => {
    res.sendFile(path.join(uiDistPath, 'index.html'));
  });
}

const server = http.createServer(app);

await connectRedis();
initWebSocket(server);

const port = Number(process.env.PORT || 3000);
server.listen(port, () => {
  console.log(`Server running on ${port}`);
});
