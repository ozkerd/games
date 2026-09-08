import Peer, { DataConnection } from 'peerjs';
import { OkeyGameState } from './types';

export interface NetworkMessage {
  type: 'SYNC_STATE' | 'PLAYER_JOINED' | 'ACTION_DRAW' | 'ACTION_DISCARD' | 'ACTION_OPEN_101' | 'ACTION_FINISH';
  senderId: string;
  senderName: string;
  payload?: any;
}

export class OkeyP2PManager {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private isHost: boolean = false;
  public roomCode: string = '';
  public playerName: string = '';
  private onStateReceived?: (state: OkeyGameState) => void;
  private onPlayerCountChanged?: (count: number, names: string[]) => void;
  private onActionReceived?: (msg: NetworkMessage) => void;
  private onError?: (err: any) => void;

  constructor(
    callbacks: {
      onStateReceived?: (state: OkeyGameState) => void;
      onPlayerCountChanged?: (count: number, names: string[]) => void;
      onActionReceived?: (msg: NetworkMessage) => void;
      onError?: (err: any) => void;
    }
  ) {
    this.onStateReceived = callbacks.onStateReceived;
    this.onPlayerCountChanged = callbacks.onPlayerCountChanged;
    this.onActionReceived = callbacks.onActionReceived;
    this.onError = callbacks.onError;
  }

  /**
   * Host creates a new online room
   */
  public createRoom(
    roomCode: string,
    playerName: string,
    onReady: (roomCode: string) => void,
    onError: (err: any) => void
  ) {
    this.isHost = true;
    this.roomCode = roomCode;
    this.playerName = playerName;
    const peerId = `primer-okey-${roomCode.toLowerCase()}`;

    try {
      this.peer = new Peer(peerId, {
        debug: 1,
      });

      this.peer.on('open', () => {
        onReady(roomCode);
      });

      this.peer.on('connection', (conn) => {
        this.connections.set(conn.peer, conn);

        conn.on('data', (data) => {
          this.handleIncomingData(data as NetworkMessage);
        });

        conn.on('close', () => {
          this.connections.delete(conn.peer);
          this.broadcastPlayerList();
        });
      });

      this.peer.on('error', (err) => {
        if (this.onError) this.onError(err);
        onError(err);
      });
    } catch (e) {
      if (this.onError) this.onError(e);
      onError(e);
    }
  }

  /**
   * Guest joins an existing online room by roomCode
   */
  public joinRoom(
    roomCode: string,
    playerName: string,
    onConnected: () => void,
    onError: (err: any) => void
  ) {
    this.isHost = false;
    this.roomCode = roomCode;
    const hostPeerId = `primer-okey-${roomCode.toLowerCase()}`;

    try {
      this.peer = new Peer({
        debug: 1,
      });

      this.peer.on('open', () => {
        if (!this.peer) return;
        const conn = this.peer.connect(hostPeerId, { reliable: true });

        conn.on('open', () => {
          this.connections.set(hostPeerId, conn);
          // Send join announcement
          conn.send({
            type: 'PLAYER_JOINED',
            senderId: this.peer?.id || '',
            senderName: playerName,
          });
          onConnected();
        });

        conn.on('data', (data) => {
          this.handleIncomingData(data as NetworkMessage);
        });

        conn.on('error', (err) => {
          if (this.onError) this.onError(err);
          onError(err);
        });
      });

      this.peer.on('error', (err) => {
        if (this.onError) this.onError(err);
        onError(err);
      });
    } catch (e) {
      if (this.onError) this.onError(e);
      onError(e);
    }
  }

  /**
   * Broadcast state from host to all connected guests
   */
  public broadcastState(state: OkeyGameState) {
    if (!this.isHost) return;
    const msg: NetworkMessage = {
      type: 'SYNC_STATE',
      senderId: this.peer?.id || 'host',
      senderName: 'Host',
      payload: state,
    };
    this.connections.forEach((conn) => {
      if (conn.open) conn.send(msg);
    });
  }

  /**
   * Send action from guest to host
   */
  public sendActionToHost(actionType: NetworkMessage['type'], payload?: any) {
    const msg: NetworkMessage = {
      type: actionType,
      senderId: this.peer?.id || '',
      senderName: 'Player',
      payload,
    };
    this.connections.forEach((conn) => {
      if (conn.open) conn.send(msg);
    });
  }

  private handleIncomingData(msg: NetworkMessage) {
    if (msg.type === 'SYNC_STATE' && this.onStateReceived && msg.payload) {
      this.onStateReceived(msg.payload);
    } else if (this.isHost) {
      if (this.onActionReceived) {
        this.onActionReceived(msg);
      }
      if (msg.type === 'PLAYER_JOINED') {
        this.broadcastPlayerList();
      }
    }
  }

  private broadcastPlayerList() {
    if (!this.isHost) return;
    const count = this.connections.size + 1; // +1 for host
    if (this.onPlayerCountChanged) {
      this.onPlayerCountChanged(count, ['Host']);
    }
  }

  public destroy() {
    this.connections.forEach((conn) => conn.close());
    this.connections.clear();
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}
