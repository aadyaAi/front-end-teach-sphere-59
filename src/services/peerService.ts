
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

export type TimerAction = {
  type: 'timer-start' | 'timer-pause' | 'timer-reset';
  startTime?: number;
  pausedTime?: number;
  mode?: 'countdown' | 'countup';
  senderId?: string;
};

export type PeerAction = DrawingAction | CodeAction | TimerAction;

type PeerEventCallbacks = {
  onConnection: (peerId: string) => void;
  onDisconnection: (peerId: string) => void;
  onDrawingAction: (action: DrawingAction, peerId: string) => void;
  onCodeAction?: (action: CodeAction, peerId: string) => void;
  onTimerAction?: (action: TimerAction, peerId: string) => void;
};

class PeerService {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private callbacks: PeerEventCallbacks | null = null;
  private roomId: string | null = null;
  private userId: string;
  private timerActionHandler: ((action: TimerAction, peerId: string) => void) | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  constructor() {
    this.userId = `user-${Math.random().toString(36).substring(2, 10)}`;
  }

  init(roomId: string, callbacks: PeerEventCallbacks) {
    this.roomId = roomId;
    this.callbacks = callbacks;
    const peerId = `${roomId}-${this.userId}`;

    try {
      this.peer = new Peer(peerId, {
        host: window.location.hostname,
        port: Number(window.location.port) || 5000,
        path: '/peerjs',
        secure: window.location.protocol === 'https:',
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
          ]
        },
        debug: 2,
        retry_options: {
          retries: 3,
          minTimeout: 1000,
          maxTimeout: 5000
        }
      });

      this.peer.on('open', () => {
        console.log('Peer connection established with ID:', peerId);
        this.reconnectAttempts = 0;
        this.joinRoom();
      });

      this.peer.on('connection', (conn) => this.handleConnection(conn));

      this.peer.on('error', (err) => {
        console.error('Peer connection error:', err);
        if (err.type === 'peer-unavailable') {
          // Ignore peer-unavailable errors during room joining
          return;
        }
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => this.reconnect(), 1000 * this.reconnectAttempts);
        } else {
          toast.error('Connection error', {
            description: 'There was an error connecting to the room. Please try again.'
          });
        }
      });

      this.peer.on('disconnected', () => {
        console.log('Peer disconnected. Attempting to reconnect...');
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => this.reconnect(), 1000 * this.reconnectAttempts);
        }
      });

    } catch (error) {
      console.error('Failed to initialize peer:', error);
      toast.error('Connection failed', {
        description: 'Could not initialize connection. Please refresh the page and try again.'
      });
    }

    return this.userId;
  }

  private reconnect() {
    if (this.peer) {
      this.peer.reconnect();
    }
  }

  private joinRoom() {
    if (!this.peer || !this.roomId) return;

    const roomPrefix = `${this.roomId}-`;
    const currentPeers = Array.from(this.connections.keys());

    // Connect to existing peers in the room
    this.peer.listAllPeers((peers) => {
      peers.forEach((peerId) => {
        if (
          peerId.startsWith(roomPrefix) &&
          peerId !== this.peer?.id &&
          !currentPeers.includes(peerId)
        ) {
          const conn = this.peer?.connect(peerId);
          if (conn) {
            this.handleConnection(conn);
          }
        }
      });
    });
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
          
          if (action.type.startsWith('code-') && this.callbacks?.onCodeAction) {
            this.callbacks.onCodeAction(action as CodeAction, conn.peer);
          } else if (action.type.startsWith('timer-')) {
            if (this.timerActionHandler) {
              this.timerActionHandler(action as TimerAction, conn.peer);
            } else if (this.callbacks?.onTimerAction) {
              this.callbacks.onTimerAction(action as TimerAction, conn.peer);
            }
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

  registerTimerActionHandler(handler: (action: TimerAction, peerId: string) => void) {
    this.timerActionHandler = handler;
  }

  unregisterTimerActionHandler() {
    this.timerActionHandler = null;
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

  sendTimerAction(action: TimerAction) {
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

export const peerService = new PeerService();
