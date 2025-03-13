<!-- src/routes/+page.svelte -->
<script lang="ts">
    import { source } from 'sveltekit-sse';
    import { onMount } from 'svelte';
    import { sseBroadcaster } from '$lib/sse/broadcaster';
    
    // Create connection to SSE endpoint with better event handling
    const connection = source('/api/sse', {
      open() {
        console.log('SSE connection opened');
        connectionState = 'connected';
      },
      close({ connect }) {
        console.log('SSE connection closed, attempting to reconnect in 2 seconds');
        connectionState = 'disconnected';
        // Reconnect after 1 seconds if disconnected
        setTimeout(() => connect(), 1000);
      },
      error(err) {
        console.error('SSE connection error:', err);
        connectionState = 'disconnected';
      }
    });
  
    // Use raw message selectors instead of json() to avoid parsing errors
    const status = connection.select('status');
    const screenEvents = connection.select('screen_event');
    const notifications = connection.select('notification');
    const systemStatus = connection.select('system_status');
    
    // Track all received events and connection state
    let eventLog = $state<Array<{time: string, type: string, data: any}>>([]);
    let connectionState = $state<'connected' | 'disconnected' | 'connecting'>('connecting');
    
    // Debounce function to prevent too many log entries
    function debounce<T extends (...args: any[]) => any>(
      func: T,
      wait: number
    ): (...args: Parameters<T>) => void {
      let timeout: ReturnType<typeof setTimeout> | null = null;
      let lastArgs: Parameters<T> | null = null;
      let lastTime = 0;
      
      return (...args: Parameters<T>) => {
        const now = Date.now();
        lastArgs = args;
        
        // Execute immediately if enough time has passed
        if (now - lastTime > wait) {
          if (timeout) {
            clearTimeout(timeout);
            timeout = null;
          }
          lastTime = now;
          func(...args);
          return;
        }
        
        // Otherwise, set up a timer to execute later
        if (timeout === null) {
          timeout = setTimeout(() => {
            lastTime = Date.now();
            timeout = null;
            if (lastArgs) func(...lastArgs);
          }, wait - (now - lastTime));
        }
      };
    }
    
    // Helper to safely add events to the log with debouncing
    const logEvent = debounce((type: string, data: any) => {
      try {
        const time = new Date().toLocaleTimeString();
        
        // Check if this is a duplicate of the last event to avoid spam
        const lastEvent = eventLog[0];
        if (lastEvent && 
            lastEvent.type === type && 
            JSON.stringify(lastEvent.data) === JSON.stringify(data)) {
          // Skip duplicate events
          return;
        }
        
        eventLog = [{time, type, data: data || 'No data'}, ...eventLog].slice(0, 20); // Keep only 20 most recent
        
        // Update connection state if we receive status events
        if (type === 'status' && data) {
          connectionState = 'connected';
        }
      } catch (error) {
        console.error('Error logging event:', error);
      }
    }, 200); // Debounce time of 200ms
    
    // Helper to safely parse JSON
    function safeJsonParse(data: any) {
      if (typeof data !== 'string') return data;
      try {
        return JSON.parse(data);
      } catch (e) {
        console.warn('Failed to parse JSON:', e);
        return data;
      }
    }
    
    // Listen to events with safer handling
    $effect(() => {
      if ($status) {
        logEvent('status', safeJsonParse($status));
      }
    });
    
    $effect(() => {
      if ($screenEvents) {
        logEvent('screen_event', safeJsonParse($screenEvents));
      }
    });
    
    $effect(() => {
      if ($notifications) {
        logEvent('notification', safeJsonParse($notifications));
      }
    });
    
    $effect(() => {
      if ($systemStatus) {
        const parsedData = safeJsonParse($systemStatus);
        logEvent('system_status', parsedData);
        
        // Update connection state based on system status
        if (parsedData && typeof parsedData === 'object' && 'status' in parsedData) {
          connectionState = parsedData.status === 'connected' ? 'connected' : 'disconnected';
        }
      }
    });
    
    // Listen for local broadcasts also - useful for testing
    onMount(() => {
      console.log('SSE test page mounted');
      
      // Add listener for locally broadcast events
      const handleLocalBroadcast = (event: Event) => {
        const customEvent = event as CustomEvent;
        const { type, payload } = customEvent.detail;
        logEvent(`local-${type}`, payload);
      };
      
      window.addEventListener('sse-broadcast', handleLocalBroadcast);
      
      return () => {
        console.log('SSE test page unmounted, closing connection');
        window.removeEventListener('sse-broadcast', handleLocalBroadcast);
        connection.close();
      };
    });
    
    // Direct broadcast functions using the broadcaster
    function broadcastReload() {
      logEvent('broadcast', { action: 'reload' });
      sseBroadcaster.reloadAllScreens();
    }
    
    function broadcastThemeChange(theme: string = 'retro') {
      logEvent('broadcast', { action: 'theme', theme });
      sseBroadcaster.changeTheme(theme);
    }
    
    function broadcastContentUpdate() {
      logEvent('broadcast', { action: 'update' });
      sseBroadcaster.updateContent('Manual content update');
    }
    
    function broadcastNotification(message: string = 'Test notification', level: 'info' | 'warning' | 'error' | 'success' = 'info') {
      logEvent('broadcast', { action: 'notify', message, level });
      sseBroadcaster.sendNotification(message, level);
    }
</script>

<div class="p-4 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">SSE Test Dashboard</h1>
    
    <div class="mb-6">
        <h2 class="text-xl font-semibold mb-2">Connection Status</h2>
        <div class="flex items-center gap-2 mb-2">
            <span class="px-2 py-1 text-sm rounded-md font-medium
                {connectionState === 'connected' ? 'bg-green-100 text-green-800' : 
                 connectionState === 'disconnected' ? 'bg-red-100 text-red-800' :
                 'bg-yellow-100 text-yellow-800'}">
                {connectionState === 'connected' ? 'Connected' : 
                 connectionState === 'disconnected' ? 'Disconnected' : 
                 'Connecting...'}
            </span>
            
            <button 
                class="ml-2 px-2 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300"
                onclick={() => connection.close()}
            >
                Disconnect
            </button>
            
  
        </div>
        <div class="p-3 bg-gray-100 rounded">
            <pre class="whitespace-pre-wrap break-all text-sm text-gray-600">{
              typeof $status === 'string' 
                ? ($status.length > 500 ? $status.substring(0, 500) + '...' : $status)
                : JSON.stringify($status, null, 2) || 'Awaiting status...'
            }</pre>
        </div>
    </div>
    
    <div class="mb-6">
        <h2 class="text-xl font-semibold mb-3">Test Controls (Direct Code Broadcast)</h2>
        <div class="flex flex-wrap gap-2">
            <button 
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onclick={broadcastReload}
            >
                Broadcast Reload
            </button>
            
            <button 
                class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                onclick={() => broadcastThemeChange('retro')}
            >
                Broadcast Theme Change
            </button>
            
            <button 
                class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onclick={broadcastContentUpdate}
            >
                Broadcast Content Update
            </button>
            
            <button 
                class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                onclick={() => broadcastNotification('Test notification', 'info')}
            >
                Broadcast Notification
            </button>
            
            <button 
                class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onclick={() => broadcastNotification('Warning notification', 'warning')}
            >
                Warning Notification
            </button>
            
            <button 
                class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onclick={() => eventLog = []}
            >
                Clear Log
            </button>
        </div>
    </div>
    
    <div class="mb-6">
        <h2 class="text-xl font-semibold mb-3">Event Log</h2>
        <div class="border rounded overflow-auto max-h-96">
            <table class="min-w-full">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="px-4 py-2 text-left">Time</th>
                        <th class="px-4 py-2 text-left">Event Type</th>
                        <th class="px-4 py-2 text-left">Data</th>
                    </tr>
                </thead>
                <tbody>
                    {#if eventLog.length === 0}
                        <tr class="border-t">
                            <td colspan="3" class="px-4 py-4 text-center text-gray-500">No events recorded yet</td>
                        </tr>
                    {:else}
                        {#each eventLog as event}
                            <tr class="border-t">
                                <td class="px-4 py-2">{event.time}</td>
                                <td class="px-4 py-2">{event.type}</td>
                                <td class="px-4 py-2">
                                    <pre class="whitespace-pre-wrap break-all text-sm">{
                                      typeof event.data === 'object' 
                                        ? JSON.stringify(event.data, null, 2)
                                        : typeof event.data === 'string' && event.data.length > 300
                                          ? event.data.substring(0, 300) + '...'
                                          : event.data
                                    }</pre>
                                </td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
</div>