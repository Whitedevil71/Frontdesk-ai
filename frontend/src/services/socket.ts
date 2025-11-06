import { io, Socket } from 'socket.io-client';

const SOCKET_URL = (import.meta as any).env?.VITE_SOCKET_URL || 'http://localhost:4000';

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('Connected to server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinSupervisor(): void {
    if (this.socket) {
      this.socket.emit('join-supervisor');
    }
  }

  joinCaller(callerId: string): void {
    if (this.socket) {
      this.socket.emit('join-caller', callerId);
    }
  }

  onNewHelpRequest(callback: (request: any) => void): void {
    if (this.socket) {
      this.socket.on('new-help-request', callback);
    }
  }

  onSupervisorResponse(callback: (response: any) => void): void {
    if (this.socket) {
      this.socket.on('supervisor-response', callback);
    }
  }

  onRequestUpdate(callback: (request: any) => void): void {
    if (this.socket) {
      this.socket.on('request-updated', callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new SocketService();