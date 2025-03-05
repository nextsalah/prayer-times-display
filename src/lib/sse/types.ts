// src/lib/sse/types.ts
export enum EventType {
    SCREEN_EVENT = 'screen_event',
    SCREEN_DATA = 'screen_data',
    NOTIFICATION = 'notification',
    SYSTEM_STATUS = 'system_status'
  }
  
  export enum ScreenEventType {
    PAGE_RELOAD = 'page_reload',
    CONTENT_UPDATE = 'content_update',
    THEME_CHANGE = 'theme_change'
  }
  
  // Optional: Add type definitions for payloads
  export interface ScreenEventPayload {
    type: ScreenEventType;
    data?: any;
  }
  
  export interface NotificationPayload {
    message: string;
    level: 'info' | 'warning' | 'error';
    id: string;
  }
  
  export interface SystemStatusPayload {
    status: 'online' | 'offline' | 'maintenance';
    message?: string;
  }