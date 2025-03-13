import { EventType, ScreenEventType, type NotificationPayload, type ScreenEventPayload, type SystemStatusPayload } from '$lib/sse/types';
import { logger } from '$lib/server/logger';

type EmitFunction = (type: string, data: any) => void;

/**
 * Server-side SSE service to manage client connections and broadcast events
 */
class SSEService {
    private clients = new Map<string, EmitFunction>();

    /**
     * Register a new client connection
     */
    registerClient(id: string, emit: EmitFunction): void {
        this.clients.set(id, emit);
        logger.debug(`SSE client registered: ${id}`);
    }

    /**
     * Remove a client connection
     */
    removeClient(id: string): void {
        this.clients.delete(id);
        logger.debug(`SSE client removed: ${id}`);
    }

    /**
     * Get the current number of connected clients
     */
    getClientCount(): number {
        return this.clients.size;
    }

    /**
     * Send event to a specific client
     */
    sendToClient(id: string, type: string, data: any): void {
        const emit = this.clients.get(id);
        if (emit) {
            try {
                emit(type, JSON.stringify(data));
            } catch (error) {
                logger.error(`Error sending event to client ${id}:`, error);
            }
        }
    }

    /**
     * Send status event to a specific client
     */
    sendStatus(id: string, status: 'connected' | 'disconnected', message?: string): void {
        this.sendToClient(id, EventType.STATUS, {
            id,
            status,
            message: message || `Client ${status}`
        });
    }

    /**
     * Broadcast to all connected clients
     */
    broadcast(type: string, data: any): void {
        this.clients.forEach((emit, id) => {
            try {
                emit(type, JSON.stringify(data));
            } catch (error) {
                logger.error(`Error broadcasting to client ${id}:`, error);
            }
        });
    }

    /**
     * Reload all connected screens
     */
    reloadAllScreens(): void {
        const payload: ScreenEventPayload = { type: ScreenEventType.PAGE_RELOAD };
        this.broadcast(EventType.SCREEN_EVENT, payload);
        logger.info(`Triggered page reload for ${this.clients.size} clients`);
    }

    /**
     * Change theme for all connected clients
     */
    changeTheme(theme: string): void {
        const payload: ScreenEventPayload = { 
            type: ScreenEventType.THEME_CHANGE, 
            data: { theme } 
        };
        this.broadcast(EventType.SCREEN_EVENT, payload);
        logger.info(`Changed theme to ${theme} for ${this.clients.size} clients`);
    }

    /**
     * Update content for all connected clients
     */
    updateContent(message?: string): void {
        const payload: ScreenEventPayload = { 
            type: ScreenEventType.CONTENT_UPDATE,
            data: { message: message || 'Content updated' }
        };
        this.broadcast(EventType.SCREEN_EVENT, payload);
        logger.info(`Triggered content update for ${this.clients.size} clients`);
    }

    /**
     * Broadcast notification to all clients
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
        logger.info(`Sent ${level} notification to ${this.clients.size} clients`);
    }

    /**
     * Broadcast system status to all clients
     */
    broadcastSystemStatus(
        status: SystemStatusPayload['status'],
        message?: string
    ): void {
        const payload: SystemStatusPayload = {
            status,
            message,
            timestamp: new Date().toISOString()
        };
        this.broadcast(EventType.SYSTEM_STATUS, payload);
        logger.info(`Updated system status to ${status} for ${this.clients.size} clients`);
    }
}

// Export a singleton instance
export const sseService = new SSEService();
