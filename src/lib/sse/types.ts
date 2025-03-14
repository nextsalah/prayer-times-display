// Shared types for both client and server

// Event types enum
export enum EventType {
    SCREEN_EVENT = 'screen_event',
    NOTIFICATION = 'notification',
    SYSTEM_STATUS = 'system_status',
    STATUS = 'status'
}

// Screen event subtypes
export enum ScreenEventType {
    PAGE_RELOAD = 'page_reload',
    CONTENT_UPDATE = 'content_update',
    THEME_CHANGE = 'theme_change'
}

// Event payload types
export interface ScreenEventPayload {
    type: ScreenEventType;
    data?: Record<string, any>;
}

export interface NotificationPayload {
    message: string;
    level: 'info' | 'warning' | 'error' | 'success';
    id?: string;
}

export interface SystemStatusPayload {
    status: 'connected' | 'disconnected' | 'online' | 'offline' | 'maintenance';
    message?: string;
    timestamp?: string;
}

export interface StatusPayload {
    id?: string;
    status: 'connected' | 'disconnected';
    message?: string;
}

// Combined type for any event payload
export type EventPayload = 
    | { type: EventType.SCREEN_EVENT; payload: ScreenEventPayload }
    | { type: EventType.NOTIFICATION; payload: NotificationPayload }
    | { type: EventType.SYSTEM_STATUS; payload: SystemStatusPayload }
    | { type: EventType.STATUS; payload: StatusPayload };
