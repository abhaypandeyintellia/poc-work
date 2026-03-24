const rooms = new Map();

export function joinRoom(ws, roomId) {
    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(ws);
    ws.on('close', () => {
        leaveRoom(ws, roomId);
    });
}

export function leaveRoom(ws, roomId) {
    const clients = rooms.get(roomId);
    if (clients) {
        clients.delete(ws);
        if (clients.size === 0) {
            rooms.delete(roomId);
        }
    }
}

export function emitToRoom(roomId, data) {
    const clients = rooms.get(roomId);
    if(clients){
        for(const client of clients){
            if(client.readyState === 1){
                client.send(JSON.stringify(data));
            }
        }
    }
    return;
}