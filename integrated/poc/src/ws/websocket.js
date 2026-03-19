import { WebSocketServer } from 'ws';
import { verifyToken } from '../auth/jwt.js';
import { sub } from '../config/redis.js';
import { handleDriverLocation, handleNearby } from './handlers.js';
import { createRateLimiter } from './rateLimiter.js';
import { setupHeartbeat } from './heartbeat.js';

const clients = new Map();

export function initWebSocket(server) {
  const wss = new WebSocketServer({ server });

  setupHeartbeat(wss);

  wss.on('connection', (ws) => {
    ws.user = null;
    ws.isAuthenticated = false;
    ws.isAlive = true;
    ws.rateLimit = createRateLimiter();

    ws.on('message', async (message) => {
      if (!ws.rateLimit()) {
        ws.terminate();
        return;
      }

      let data;
      try {
        data = JSON.parse(message);
      } catch {
        ws.close(1003, 'Invalid JSON');
        return;
      }

      if (!ws.isAuthenticated) {
        if (data.type !== 'auth' || typeof data.token !== 'string' || !data.token) {
          ws.close(1008, 'Authentication required');
          return;
        }

        try {
          const user = verifyToken(data.token);
          const existing = clients.get(user.userId);

          if (existing && existing !== ws) {
            existing.close(1000, 'Replaced by new connection');
          }

          ws.user = user;
          ws.isAuthenticated = true;
          clients.set(user.userId, ws);

          if (ws.readyState === 1) {
            ws.send(JSON.stringify({ type: 'auth_success' }));
          }
        } catch {
          ws.close(1008, 'Invalid token');
        }
        return;
      }

      if (ws.user.role === 'driver' && data.type === 'location') {
        await handleDriverLocation(ws.user.userId, data);
      }

      if (ws.user.role === 'rider' && data.type === 'nearby') {
        await handleNearby(ws, data);
      }
    });

    ws.on('close', () => {
      
    console.log("connection closed");
      clients.delete(ws.user?.userId);
    });
  });

  // Redis Pub/Sub listener
  sub.subscribe("driver_location", (message) => {
    const data = JSON.parse(message);

    clients.forEach((client) => {
      if (client.user?.role === 'rider' && client.readyState === 1) {
        client.send(JSON.stringify({
          type: "driver_update",
          ...data
        }));
      }
    });
  });
}
