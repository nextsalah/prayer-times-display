import { sseClient, EventType, ScreenEventType } from '$lib/sse/client';
import { writable, type Unsubscriber } from 'svelte/store';
import { invalidateAll } from '$app/navigation';

export type ConnectionStatus = 'online' | 'offline' | 'maintenance' | 'unknown';

export interface SSEState {
    connectionStatus: ConnectionStatus;
    lastUpdateTime: string;
}

type ToastFunction = (message: string, level?: string) => void;
type ThemeChangeHandler = (theme: string) => void;

export class SSEHandler {
    private stateUnsubscribe: Unsubscriber | null = null;
    private eventUnsubscribes: Array<() => void> = [];
    private showToast: ToastFunction;
    private handleThemeChange: ThemeChangeHandler;
    
    public state = writable<SSEState>({
        connectionStatus: 'unknown',
        lastUpdateTime: ''
    });
    
    constructor(toastFn: ToastFunction, themeChangeFn: ThemeChangeHandler) {
        this.showToast = toastFn;
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
                
                this.state.update(s => ({ ...s, lastUpdateTime }));
                
                // Direct handling of theme change from SSE state
                if (state.lastMessage.type === 'theme_change') {
                    const theme = state.lastMessage.payload;
                    console.log('[SSE Handler] Theme change detected in SSE message:', theme);
                    this.handleThemeChange(theme);
                }
            }
            
            // Handle connection status changes
            let connectionStatus: ConnectionStatus;
            connectionStatus = state.connected ? 'online' : 'offline';
            
            this.state.update(s => ({ ...s, connectionStatus }));
        });
        
        this.setupEventHandlers();
    }
    
    private setupEventHandlers(): void {
        // Handle screen events (like page reload or theme change)
        this.eventUnsubscribes.push(
            sseClient.on(EventType.SCREEN_EVENT, async (payload) => {
                console.log('[SSE Handler] Screen event received:', payload);
                if (payload.type === ScreenEventType.PAGE_RELOAD) {
                    this.showToast('Reloading page...', 'info');
                    setTimeout(() => window.location.reload(), 1000);
                } 
            })
        );
        
        // Handle direct theme change events
        this.eventUnsubscribes.push(
            sseClient.on(EventType.SCREEN_EVENT, (payload) => {
                if (payload.type === ScreenEventType.THEME_CHANGE) {
                    console.log('[SSE Handler] Direct theme change event:', payload);
                    const theme = typeof payload.data === 'string' ? payload.data : payload.data?.theme;
                    if (theme) {
                        this.handleThemeChange(theme);
                    }
                }
            })
        );
        
        // Handle content updates
        this.eventUnsubscribes.push(
            sseClient.on(EventType.SCREEN_EVENT, (payload) => {
                if (payload.type === ScreenEventType.CONTENT_UPDATE) {
                    console.log('[SSE Handler] Content update event:', payload);
                    this.showToast('Content updated', 'info');
                    invalidateAll();
                }
            })
        );
        
        // Handle notifications
        this.eventUnsubscribes.push(
            sseClient.on(EventType.NOTIFICATION, (payload) => {
                console.log('[SSE Handler] Notification received:', payload);
                this.showToast(payload.message, payload.level);
            })
        );
        
        // Handle system status updates
        this.eventUnsubscribes.push(
            sseClient.on(EventType.SYSTEM_STATUS, (payload) => {
                console.log('[SSE Handler] System status update:', payload);
                
                this.state.update(s => ({ ...s, connectionStatus: payload.status }));
                
                if (payload.status === 'maintenance') {
                    this.showToast(
                        payload.message || 'System maintenance in progress', 
                        'warning'
                    );
                }
            })
        );
    }
    
    public destroy(): void {
        if (this.stateUnsubscribe) this.stateUnsubscribe();
        this.eventUnsubscribes.forEach(unsub => unsub());
    }
}
