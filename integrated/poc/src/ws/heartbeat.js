export function setupHeartbeat(wss) {
    function heartbeat() {
      this.isAlive = true;
    }

  wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.on('pong', heartbeat);
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        console.log("Connection terminated");
        return ws.terminate();
      }

      ws.isAlive = false;
      ws.ping();
    });
  }, 10000);

  wss.on('close', () => {
    clearInterval(interval);
  });
}