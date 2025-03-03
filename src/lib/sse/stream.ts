// src/lib/sse/stream.ts
import { EventEmitter } from 'node:events';

// These enums should match the client-side ones
export enum EventType {
  SCREEN_EVENT = 'screen_event',
  SCREEN_DATA = 'screen_data',
  NOTIFICATION = 'notification',
  SYSTEM_STATUS = 'system_status'
}

export enum ScreenEventType {
  THEME_CHANGE = 'theme_change',
  PAGE_RELOAD = 'page_reload',
  CONTENT_UPDATE = 'content_update',
}

// Server-side event stream class
export class ServerStream extends EventEmitter {
  id: string;
  createdAt: Date;
  lastActive: Date;
  
  constructor() {
    super();
    this.id = crypto.randomUUID();
    this.createdAt = new Date();
    this.lastActive = new Date();
  }

  sendMessage(type: string, payload: any): boolean {
    this.lastActive = new Date();
    return this.emit('message', JSON.stringify({ type, payload }));
  }
}

// Connection manager to track active connections
class ConnectionManager {
  private connections: Map<string, ServerStream> = new Map();
  private heartbeatInterval: NodeJS.Timer | null = null;
  private readonly HEARTBEAT_INTERVAL = 10000; // 10 seconds
  private readonly CONNECTION_TIMEOUT = 180000; // 3 minutes

  constructor() {
    this.startHeartbeat();
  }

  addConnection(stream: ServerStream): void {
    this.connections.set(stream.id, stream);
    console.log(`[SSE] New connection ${stream.id}. Total: ${this.connections.size}`);
  }

  removeConnection(id: string): boolean {
    const removed = this.connections.delete(id);
    return removed;
  }

  broadcast(type: string, payload?: any): void {
    console.log(`[SSE] Broadcasting to ${this.connections.size} connections:`, type, payload);
    for (const [id, stream] of this.connections.entries()) {
      try {
        stream.sendMessage(type, payload);
      } catch (error) {
        console.error(`[SSE] Error broadcasting to ${id}:`, error);
        this.removeConnection(id);
      }
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      
      for (const [id, stream] of this.connections.entries()) {
        // Check for stale connections
        if (now - stream.lastActive.getTime() > this.CONNECTION_TIMEOUT) {
          this.removeConnection(id);
          continue;
        }
        
        // Send heartbeat
        try {
          stream.emit('heartbeat', JSON.stringify({ timestamp: now }));
        } catch (error) {
          console.error(`[SSE] Heartbeat failed for ${id}:`, error);
          this.removeConnection(id);
        }
      }
    }, this.HEARTBEAT_INTERVAL);
  }

  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Helper methods for common events
  broadcastScreenEvent(type: ScreenEventType, data?: any): void {
    this.broadcast(EventType.SCREEN_EVENT, { type, data });
  }

  broadcastNotification(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    this.broadcast(EventType.NOTIFICATION, {
      message,
      level,
      id: crypto.randomUUID()
    });
  }

  broadcastSystemStatus(status: 'online' | 'offline' | 'maintenance', message?: string): void {
    this.broadcast(EventType.SYSTEM_STATUS, { status, message });
  }
}

// Singleton instance
export const connectionManager = new ConnectionManager();