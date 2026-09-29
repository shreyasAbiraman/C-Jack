/**
 * CJack Real-Time WebSocket Telemetry & Downlink Gateway
 * 
 * Provides ultra-low latency bi-directional communication between:
 *  - ESP32 TFT Resuscitation Hardware / Vest
 *  - Web Dashboard Frontend
 */

const { WebSocketServer, WebSocket } = require('ws');
const hardwareManager = require('./hardware/hardwareManager');

let wss = null;
const clients = new Set();
const hardwareSockets = new Set();

function initWebSocketServer(httpServer) {
  wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws/telemetry'
  });

  wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    console.log(`[WebSocket] New client connected from ${clientIp}`);
    clients.add(ws);

    // Send initial handshake and current hardware status
    try {
      ws.send(JSON.stringify({
        type: 'CONNECTION_ACK',
        status: 'CONNECTED',
        serverTime: Date.now(),
        hardwareStatus: hardwareManager.getHardwareStatus()
      }));
    } catch (err) {
      console.error('[WebSocket] Handshake send error:', err.message);
    }

    ws.on('message', (message) => {
      try {
        const payload = JSON.parse(message.toString());

        // 1. Hardware Telemetry Ingestion from ESP32
        if (payload.deviceId || payload.hardwareSource === 'PHYSICAL') {
          hardwareSockets.add(ws);
          const result = hardwareManager.ingestTelemetry(payload, true);

          // Broadcast real-time packet to all web dashboard clients
          const broadcastMsg = JSON.stringify({
            type: 'TELEMETRY_UPDATE',
            source: 'HARDWARE',
            data: payload,
            processed: result,
            timestamp: Date.now()
          });

          for (const client of clients) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(broadcastMsg);
            }
          }
        }
        
        // 2. Downlink Command from Web Frontend to ESP32
        else if (payload.type === 'COMMAND_DOWNLINK' || payload.command) {
          console.log('[WebSocket Downlink Command]:', payload);
          const downlinkMsg = JSON.stringify(payload);
          
          for (const hwSocket of hardwareSockets) {
            if (hwSocket.readyState === WebSocket.OPEN) {
              hwSocket.send(downlinkMsg);
            }
          }
        }
      } catch (err) {
        console.error('[WebSocket] Message parsing error:', err.message);
      }
    });

    ws.on('close', () => {
      console.log(`[WebSocket] Client disconnected (${clientIp})`);
      clients.delete(ws);
      hardwareSockets.delete(ws);
    });

    ws.on('error', (err) => {
      console.error(`[WebSocket Error] ${clientIp}:`, err.message);
      clients.delete(ws);
      hardwareSockets.delete(ws);
    });
  });

  console.log('[WebSocket Server] Telemetry stream listening on ws://0.0.0.0:5000/ws/telemetry');
  return wss;
}

function broadcastTelemetry(data) {
  if (!wss) return;
  const msg = JSON.stringify({
    type: 'TELEMETRY_BROADCAST',
    data,
    timestamp: Date.now()
  });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

module.exports = {
  initWebSocketServer,
  broadcastTelemetry
};
