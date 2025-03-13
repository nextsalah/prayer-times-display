import { browser } from '$app/environment';
import { 
    EventType, 
    ScreenEventType, 
    type ScreenEventPayload, 
    type NotificationPayload,
    type SystemStatusPayload,
} from './types';

// Type for broadcast options
interface BroadcastOptions {
    skipLocalHandling?: boolean;
}

/**
 * SSE Broadcaster utility for direct client-side broadcasting
 */
class SSEBroadcaster {
    private eventTarget: EventTarget;
    
    constructor() {
        if (browser) {
            // Use window as the event target in browser environments
            this.eventTarget = window;
        } else {
            // Use a new EventTarget in server environments (though server shouldn't use this)
            this.eventTarget = new EventTarget();
        }
    }
    
    /**
     * Broadcast a screen event (reload, content update, theme change)
     */
    broadcastScreenEvent(
        eventType: ScreenEventType, 
        data?: Record<string, any>,
        options?: BroadcastOptions
    ): void {
        const payload: ScreenEventPayload = { type: eventType, data };
        this.broadcast(EventType.SCREEN_EVENT, payload, options);
    }
    
    /**
     * Send a reload command to all screens
     */
    reloadAllScreens(options?: BroadcastOptions): void {
        this.broadcastScreenEvent(ScreenEventType.PAGE_RELOAD, undefined, options);
    }
    
    /**
     * Send a theme change command
     */
    changeTheme(theme: string, options?: BroadcastOptions): void {
        this.broadcastScreenEvent(ScreenEventType.THEME_CHANGE, { theme }, options);
    }
    
    /**
     * Send a content update notification
     */
    updateContent(message?: string, options?: BroadcastOptions): void {
        this.broadcastScreenEvent(
            ScreenEventType.CONTENT_UPDATE, 
            { message: message || 'Content updated' }, 
            options
        );
    }
    
    /**
     * Send a notification
     */
    sendNotification(
        message: string, 
        level: NotificationPayload['level'] = 'info',
        options?: BroadcastOptions
    ): void {
        const payload: NotificationPayload = { 
            message, 
            level,
            id: crypto.randomUUID() 
        };
        this.broadcast(EventType.NOTIFICATION, payload, options);
    }
    
    /**
     * Update system status
     */
    updateSystemStatus(
        status: SystemStatusPayload['status'],
        message?: string,
        options?: BroadcastOptions
    ): void {
        const payload: SystemStatusPayload = { 
            status, 
            message,
            timestamp: new Date().toISOString()
        };
        this.broadcast(EventType.SYSTEM_STATUS, payload, options);
    }
    
    /**
     * Generic broadcast method for any event type
     */
    broadcast<T extends EventType>(
        type: T, 
        payload: any,
        options?: BroadcastOptions
    ): void {
        if (!browser) {
            console.warn('SSEBroadcaster is meant for client-side use only');
            return;
        }
        
        const event = new CustomEvent('sse-broadcast', {
            detail: { type, payload }
        });
        
        // Dispatch event so other components can listen for it
        this.eventTarget.dispatchEvent(event);
        
        // If skipLocalHandling is true, don't send the POST request
        if (options?.skipLocalHandling) return;
        
        // Send to server via fetch so it can broadcast to all other clients
        this.sendToServer(type, payload);
    }
    
    /**
     * Send event to server for broadcasting
     */
    private async sendToServer(type: EventType, payload: any): Promise<void> {
        try {
            const response = await fetch('/api/sse/broadcast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type, payload })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error sending SSE broadcast to server:', error);
        }
    }
}

// Export a singleton instance
export const sseBroadcaster = new SSEBroadcaster();
