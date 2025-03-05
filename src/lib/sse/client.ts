// src/lib/sse/client.ts
import { writable, type Writable } from 'svelte/store';
import { EventType } from '$lib/sse/types';

// Client-side state
interface SSEState {
  connected: boolean;
  connectionId: string | null;
  lastMessage: any | null;
  error: Error | null;
}

export interface SSEClient {
  state: Writable<SSEState>;
  connect: () => void;
  disconnect: () => void;
  isConnected: () => boolean;
  on: <T extends EventType>(type: T, callback: (data: any) => void) => () => void;
}

export function createSSEClient(endpoint = '/api/server_events'): SSEClient {
  let eventSource: EventSource | null = null;
  
  // Create a store for the SSE state
  const state = writable<SSEState>({
    connected: false,
    connectionId: null,
    lastMessage: null,
    error: null
  });

  // Store event handlers
  const handlers: Map<string, Set<(data: any) => void>> = new Map();

  // Connect to the SSE endpoint
  function connect(): void {
    if (eventSource) {
      disconnect();
    }

    try {
      eventSource = new EventSource(endpoint);
      
      eventSource.onopen = () => {
        state.update(s => ({ ...s, connected: true, error: null }));
        console.log('[SSE Client] Connected');
      };
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          state.update(s => ({ ...s, lastMessage: data }));
          
          // Process the received message
          if (data.type && handlers.has(data.type)) {
            handlers.get(data.type)?.forEach(handler => {
              try {
                handler(data.payload);
              } catch (err) {
                console.error(`[SSE Client] Handler error for ${data.type}:`, err);
              }
            });
          }
        } catch (err) {
          console.error('[SSE Client] Error processing message:', err);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('[SSE Client] Connection error:', error);
        state.update(s => ({ 
          ...s, 
          connected: false, 
          error: new Error('EventSource connection error') 
        }));
        
        // Attempt to reconnect after a delay
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        
        setTimeout(connect, 2500);
      };
    } catch (error) {
      console.error('[SSE Client] Failed to create EventSource:', error);
      state.update(s => ({ 
        ...s, 
        connected: false, 
        error: error instanceof Error ? error : new Error(String(error)) 
      }));
    }
  }

  // Disconnect from the SSE endpoint
  function disconnect(): void {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
      state.update(s => ({ ...s, connected: false }));
      console.log('[SSE Client] Disconnected');
    }
  }

  // Register a callback for a specific event type
  function on<T extends EventType>(type: T, callback: (data: any) => void): () => void {
    if (!handlers.has(type)) {
      handlers.set(type, new Set());
    }
    
    handlers.get(type)?.add(callback);
    
    // Return an unsubscribe function
    return () => {
      const handlersForType = handlers.get(type);
      if (handlersForType) {
        handlersForType.delete(callback);
      }
    };
  }

  // Check if connected
  function isConnected(): boolean {
    let result = false;
    state.update(s => {
      result = s.connected;
      return s;
    });
    return result;
  }

  return {
    state,
    connect,
    disconnect,
    isConnected,
    on
  };
}

// Create singleton instance
export const sseClient = createSSEClient();

// Auto-connect in browser environment (optional)
if (typeof window !== 'undefined') {
  // Connect on client-side only
  setTimeout(() => {
    sseClient.connect();
  }, 100);
}