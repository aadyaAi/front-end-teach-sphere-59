
import express from 'express';
import cors from 'cors';
import { ExpressPeerServer } from 'peer';
import { Request, Response } from 'express';

const app = express();
const port = 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

const peerServer = ExpressPeerServer(server, {
  path: '/peerjs',
  allow_discovery: true,
  proxied: true,
  port: port,
  key: 'peerjs',
  alive_timeout: 60000,
  expire_timeout: 60000,
  concurrent_limit: 5000
});

// Configure ICE servers for WebRTC connections
app.get('/peerjs/config', (req: Request, res: Response) => {
  res.json({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ]
  });
});

app.use('/', peerServer);

// Track connected peers by room
const roomPeers = new Map<string, Set<string>>();

peerServer.on('connection', (client) => {
  const clientId = client.getId();
  const roomId = clientId.split('-')[0];
  
  if (!roomPeers.has(roomId)) {
    roomPeers.set(roomId, new Set());
  }
  roomPeers.get(roomId)?.add(clientId);
  
  console.log(`Client connected to room ${roomId}:`, clientId);
});

peerServer.on('disconnect', (client) => {
  const clientId = client.getId();
  const roomId = clientId.split('-')[0];
  
  roomPeers.get(roomId)?.delete(clientId);
  if (roomPeers.get(roomId)?.size === 0) {
    roomPeers.delete(roomId);
  }
  
  console.log(`Client disconnected from room ${roomId}:`, clientId);
});

// Get peers in a room
app.get('/api/room/:roomId/peers', (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  const peers = Array.from(roomPeers.get(roomId) || []);
  res.json({ peers });
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});
