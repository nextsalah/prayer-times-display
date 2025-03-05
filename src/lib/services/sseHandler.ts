import { sseClient } from '$lib/sse/client';
import { writable, type Unsubscriber } from 'svelte/store';
import { invalidateAll } from '$app/navigation';
import { EventType, ScreenEventType } from '$lib/sse/types';

export type ConnectionStatus = 'online' | 'offline' | 'maintenance' | 'unknown';

export interface SSEState {
    connectionStatus: ConnectionStatus;
    lastUpdateTime: string;
    lastAction?: string;
}

type ThemeChangeHandler = (theme: string) => void;

export class SSEHandler {
    private stateUnsubscribe: Unsubscriber | null = null;
    private eventUnsubscribes: Array<() => void> = [];
    private handleThemeChange: ThemeChangeHandler;
    
    public state = writable<SSEState>({
        connectionStatus: 'unknown',
        lastUpdateTime: ''
    });
    
    constructor(themeChangeFn: ThemeChangeHandler) {
        this.handleThemeChange = themeChangeFn;
    }
    
    public initialize(): void {
        // Connect to SSE if not already connected
        if (!sseClient.isConnected()) {
            sseClient.connect();
        }
        
        // Subscribe to SSE state changes
        this.stateUnsubscribe = sseClient.state.subscribe(state => {
            console.log('[SSE Handler] SSE state changed:', state);
            
            // Debug: Check the raw message to understand what's being received
            if (state.lastMessage) {
                console.log('[SSE Handler] Raw SSE message received:', state.lastMessage);
                const lastUpdateTime = new Date().toLocaleTimeString();
                
                this.state.update(s => ({ 
                    ...s, 
                    lastUpdateTime,
                    lastAction: `Message type: ${state.lastMessage.type}`
                }));
                
                // Handle theme change message directly
                if (state.lastMessage.type === 'theme_change') {
                    const theme = state.lastMessage.payload;
                    console.log('[SSE Handler] Theme change detected in message:', theme);
                    this.handleThemeChange(theme);
                }
            }
            
            // Handle connection status changes
            let connectionStatus: ConnectionStatus = state.connected ? 'online' : 'offline';
            
            this.state.update(s => ({ ...s, connectionStatus }));
        });
        
        this.setupEventHandlers();
    }
    
    private setupEventHandlers(): void {
        this.eventUnsubscribes.push(
            sseClient.on(EventType.SCREEN_EVENT, async (payload) => {
                console.log('[SSE Handler] Screen event received:', payload);
                
                // Update state with latest action info
                const action = payload.type === ScreenEventType.CONTENT_UPDATE 
                    ? 'Content update: ' + (payload.data?.message || 'Data refreshed')
                    : `Screen event: ${payload.type}`;
                    
                this.state.update(s => ({ 
                    ...s, 
                    lastUpdateTime: new Date().toLocaleTimeString(),
                    lastAction: action
                }));
                
                if (payload.type === ScreenEventType.PAGE_RELOAD) {
                    setTimeout(() => window.location.reload(), 1000);
                } 
                else if (payload.type === ScreenEventType.CONTENT_UPDATE) {
                    console.log('[SSE Handler] Refreshing data due to content update');
                    invalidateAll(); // This should refresh the data
                }
                else if (payload.type === ScreenEventType.THEME_CHANGE) {
                    // Your existing theme change code
                }
            })
        );
        
        // Handle notifications
        this.eventUnsubscribes.push(
            sseClient.on(EventType.NOTIFICATION, (payload) => {
                console.log('[SSE Handler] Notification received:', payload);
                this.state.update(s => ({ 
                    ...s, 
                    lastUpdateTime: new Date().toLocaleTimeString(),
                    lastAction: `Notification: ${payload.message}`
                }));
            })
        );
        
        // Handle system status updates
        this.eventUnsubscribes.push(
            sseClient.on(EventType.SYSTEM_STATUS, (payload) => {
                console.log('[SSE Handler] System status update:', payload);
                
                this.state.update(s => ({ 
                    ...s, 
                    connectionStatus: payload.status,
                    lastUpdateTime: new Date().toLocaleTimeString(),
                    lastAction: `System status: ${payload.status}`
                }));
            })
        );
    }
    
    public destroy(): void {
        if (this.stateUnsubscribe) this.stateUnsubscribe();
        this.eventUnsubscribes.forEach(unsub => unsub());
    }
}