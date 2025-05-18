
import Peer, { DataConnection } from 'peerjs';
import { toast } from 'sonner';

export type DrawingAction = {
  type: 'start' | 'draw' | 'end' | 'clear' | 'undo' | 'redo';
  tool?: string;
  color?: string;
  lineWidth?: number;
  points?: { x: number; y: number }[];
  startPosition?: { x: number; y: number };
  currentPosition?: { x: number; y: number };
};

export type CodeAction = {
  type: 'code-change' | 'code-selection' | 'code-cursor' | 'code-language-change' | 'code-run';
  content?: string;
  selection?: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number };
  position?: { lineNumber: number; column: number };
  language?: string;
  senderId?: string;
};

export type PeerAction = DrawingAction | CodeAction;

type PeerEventCallbacks = {
  onConnection: (peerId: string) => void;
  onDisconnection: (peerId: string) => void;
  onDrawingAction: (action: DrawingAction, peerId: string) => void;
  onCodeAction?: (action: CodeAction, peerId: string) => void;
};

class PeerService {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private callbacks: PeerEventCallbacks | null = null;
  private roomId: string | null = null;
  private userId: string;

  constructor() {
    // Generate a unique user ID for this browser session
    this.userId = `user-${Math.random().toString(36).substring(2, 10)}`;
  }

  init(roomId: string, callbacks: PeerEventCallbacks) {
    this.roomId = roomId;
    this.callbacks = callbacks;
    const peerId = `${roomId}-${this.userId}`;
    
    try {
      this.peer = new Peer(peerId);
      
      this.peer.on('open', () => {
        console.log('Peer connection established with ID:', peerId);
        this.joinRoom();
      });
      
      this.peer.on('connection', (conn) => this.handleConnection(conn));
      
      this.peer.on('error', (err) => {
        console.error('Peer connection error:', err);
        toast.error('Connection error', {
          description: 'There was an error connecting to the room. Please try again.'
        });
      });
    } catch (error) {
      console.error('Failed to initialize peer:', error);
      toast.error('Connection failed', {
        description: 'Could not initialize connection. Please refresh the page and try again.'
      });
    }
    
    return this.userId;
  }

  private joinRoom() {
    if (!this.peer || !this.roomId) return;
    
    // Look for other peers in the same room
    const roomPrefix = `${this.roomId}-`;
    
    // This is a simplified discovery mechanism
    // In a production environment, you might want to use a signaling server
    // Here we're using a predefined format: roomId-userId
    // Try to connect to a few potential peers - assuming there aren't too many
    for (let i = 0; i < 10; i++) {
      const attemptId = `${roomPrefix}user-${i}`;
      
      // Don't connect to ourselves
      if (attemptId === this.peer.id) continue;
      
      const conn = this.peer.connect(attemptId);
      if (conn) {
        this.handleConnection(conn);
      }
    }
  }

  private handleConnection(conn: DataConnection) {
    conn.on('open', () => {
      console.log('Connected to peer:', conn.peer);
      this.connections.set(conn.peer, conn);
      
      if (this.callbacks) {
        this.callbacks.onConnection(conn.peer);
      }
      
      conn.on('data', (data) => {
        if (typeof data === 'object' && data !== null && 'type' in data) {
          const action = data as PeerAction;
          
          // Handle different types of actions
          if (action.type.startsWith('code-') && this.callbacks?.onCodeAction) {
            this.callbacks.onCodeAction(action as CodeAction, conn.peer);
          } else if (this.callbacks) {
            this.callbacks.onDrawingAction(action as DrawingAction, conn.peer);
          }
        }
      });
      
      conn.on('close', () => {
        this.connections.delete(conn.peer);
        if (this.callbacks) {
          this.callbacks.onDisconnection(conn.peer);
        }
      });
      
      conn.on('error', (err) => {
        console.error('Connection error:', err);
        this.connections.delete(conn.peer);
        if (this.callbacks) {
          this.callbacks.onDisconnection(conn.peer);
        }
      });
    });
  }

  sendDrawingAction(action: DrawingAction) {
    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(action);
      }
    });
  }

  sendCodeAction(action: CodeAction) {
    action.senderId = this.userId;
    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(action);
      }
    });
  }

  disconnect() {
    this.connections.forEach((conn) => conn.close());
    this.connections.clear();
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }

  getConnectedPeers(): string[] {
    return Array.from(this.connections.keys());
  }

  isConnected(): boolean {
    return this.peer !== null && this.connections.size > 0;
  }

  getUserId(): string {
    return this.userId;
  }
}

// Singleton instance
export const peerService = new PeerService();
