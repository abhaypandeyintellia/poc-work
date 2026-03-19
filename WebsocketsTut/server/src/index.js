import { WebSocketServer } from 'ws';
import http from 'http';
import priceGenerator from './priceGenerator.js';

const server = http.createServer();
const wss = new WebSocketServer({ server });

const subscribedClients = new Map();
let priceInterval;

wss.on('connection', (ws) => {
  console.log('Client connected');
  subscribedClients.set(ws, new Set());

  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      handleClientMessage(ws, message);
    } catch (error) {
      console.error('Invalid message:', error);
    }
  });

  ws.on('close', () => {
    subscribedClients.delete(ws);
    console.log('Client disconnected');
  });
});

function handleClientMessage(ws, message) {
  const { type, symbol } = message;
  const clientSubscriptions = subscribedClients.get(ws);

  if (type === 'SUBSCRIBE') {
    clientSubscriptions.add(symbol);
    ws.send(JSON.stringify({ 
      type: 'SUBSCRIBED', 
      symbol,
      message: `Subscribed to ${symbol}` 
    }));
  } else if (type === 'UNSUBSCRIBE') {
    clientSubscriptions.delete(symbol);
    ws.send(JSON.stringify({ 
      type: 'UNSUBSCRIBED', 
      symbol,
      message: `Unsubscribed from ${symbol}` 
    }));
  } else if (type === 'GET_SYMBOLS') {
    ws.send(JSON.stringify({
      type: 'SYMBOLS',
      symbols: priceGenerator.getAvailableSymbols()
    }));
  }
}

function broadcastPrices() {
  const prices = priceGenerator.getAllPrices();
  
  wss.clients.forEach((ws) => {
    if (ws.readyState === 1) {
      const clientSubscriptions = subscribedClients.get(ws);
      const filteredPrices = prices.filter(p => clientSubscriptions.has(p.symbol));
      
      if (filteredPrices.length > 0) {
        ws.send(JSON.stringify({
          type: 'PRICE_UPDATE',
          data: filteredPrices
        }));
      }
    }
  });
}

setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

priceInterval = setInterval(broadcastPrices, 1000);

server.listen(8080, () => {
  console.log('WebSocket server running on ws://localhost:8080');
});