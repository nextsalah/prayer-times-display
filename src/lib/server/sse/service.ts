import { logger } from '$lib/server/logger';
import { 
    EventType, 
    ScreenEventType, 
    type ScreenEventPayload, 
    type NotificationPayload,
    type SystemStatusPayload,
    type StatusPayload
} from '$lib/sse/types';

// Type for the client connection info
interface ClientConnection {
    emit: (type: string, data: any) => void;
    connectedAt: Date;
    lastActive: Date;
}

/**
 * Server-side SSE service for managing client connections
 */
class SSEService {
    private clients: Map<string, ClientConnection> = new Map();
    private readonly CONNECTION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
    private cleanupInterval: ReturnType<typeof setInterval> | null = null;
    
    constructor() {
        // Setup automatic cleanup every 30 minutes
        this.cleanupInterval = setInterval(() => this.cleanupOldConnections(), 30 * 60 * 1000);
    }

    /**
     * Register a new client connection
     */
    registerClient(id: string, emit: (type: string, data: any) => void): void {
        const now = new Date();
        this.clients.set(id, {
            emit,
            connectedAt: now,
            lastActive: now
        });
        
        logger.debug(`SSE client connected: ${id} (Total: ${this.clients.size})`);
        
        // Run cleanup to remove stale connections when new clients connect
        this.cleanupOldConnections();
    }
    
    /**
     * Remove a client connection
     */
    removeClient(id: string): void {
        this.clients.delete(id);
        logger.debug(`SSE client disconnected: ${id} (Total: ${this.clients.size})`);
    }
    
    /**
     * Get current client count
     */
    getClientCount(): number {
        return this.clients.size;
    }
    
    /**
     * Send screen event to all clients
     */
    broadcastScreenEvent(eventType: ScreenEventType, data?: Record<string, any>): void {
        const payload: ScreenEventPayload = { type: eventType, data };
        this.broadcast(EventType.SCREEN_EVENT, payload);
    }
    
    /**
     * Send reload command to all screens
     */
    reloadAllScreens(): void {
        this.broadcastScreenEvent(ScreenEventType.PAGE_RELOAD);
    }
    
    /**
     * Send theme change command
     */
    changeTheme(theme: string): void {
        this.broadcastScreenEvent(ScreenEventType.THEME_CHANGE, { theme });
    }
    
    /**
     * Send content update notification
     */
    updateContent(message?: string): void {
        this.broadcastScreenEvent(
            ScreenEventType.CONTENT_UPDATE, 
            { 
                message: message || 'Content updated',
                updateId: crypto.randomUUID(),
                timestamp: Date.now()
            }
        );
    }
    
    /**
     * Send a notification to all clients
     */
    broadcastNotification(
        message: string, 
        level: NotificationPayload['level'] = 'info'
    ): void {
        const payload: NotificationPayload = { 
            message, 
            level,
            id: crypto.randomUUID() 
        };
        this.broadcast(EventType.NOTIFICATION, payload);
    }
    
    /**
     * Update system status for all clients
     */
    updateSystemStatus(
        status: SystemStatusPayload['status'],
        message?: string
    ): void {
        const payload: SystemStatusPayload = { 
            status, 
            message,
            timestamp: new Date().toISOString()
        };
        this.broadcast(EventType.SYSTEM_STATUS, payload);
    }
    
    /**
     * Send connection status to a specific client
     */
    sendStatus(clientId: string, status: StatusPayload['status'], message?: string): void {
        const client = this.clients.get(clientId);
        if (!client) return;
        
        const payload: StatusPayload = {
            id: clientId,
            status,
            message
        };
        
        try {
            // Update last active timestamp
            client.lastActive = new Date();
            client.emit(EventType.STATUS, JSON.stringify(payload));
        } catch (error) {
            logger.error(`Error sending status to client ${clientId}:`, error);
            this.removeClient(clientId);
        }
    }
    
    /**
     * Generic broadcast method for any event type
     */
    private broadcast<T extends EventType>(type: T, payload: any): void {
        const clientsToRemove: string[] = [];
        
        this.clients.forEach((client, id) => {
            try {
                // Update last active timestamp for successful broadcasts
                client.lastActive = new Date();
                client.emit(type, JSON.stringify(payload));
            } catch (error) {
                logger.error(`Error broadcasting to client ${id}:`, error);
                clientsToRemove.push(id);
            }
        });
        
        // Remove any clients that failed to receive the broadcast
        clientsToRemove.forEach(id => this.removeClient(id));
        
        logger.debug(`Broadcast ${type} to ${this.clients.size} clients`);
    }
    
    /**
     * Clean up old connections
     */
    cleanupOldConnections(): void {
        const now = new Date();
        const clientsToRemove: string[] = [];
        
        this.clients.forEach((client, id) => {
            const connectionAge = now.getTime() - client.connectedAt.getTime();
            const inactiveTime = now.getTime() - client.lastActive.getTime();
            
            // Remove connections older than 8 hours or inactive for more than 1 hour
            if (connectionAge > this.CONNECTION_TIMEOUT || inactiveTime > 60 * 60 * 1000) {
                clientsToRemove.push(id);
            }
        });
        
        if (clientsToRemove.length > 0) {
            clientsToRemove.forEach(id => this.removeClient(id));
            logger.info(`Cleaned up ${clientsToRemove.length} stale SSE connections`);
        }
    }
    
    /**
     * Clean up resources when the service is stopped
     */
    destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
}

// Export a singleton instance
export const sseService = new SSEService();
