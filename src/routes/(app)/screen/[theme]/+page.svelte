<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import Loader from '$lib/themes/components/Loader.svelte';
    import type { AppDataResult } from '$lib/themes/interfaces/types.js';
    import { error } from '@sveltejs/kit';
    import '$lib/themes/styles/global.css';
    import SSEStatus from '$lib/themes/components/SSEStatus.svelte';
    import { source } from 'sveltekit-sse';
    import { EventType, ScreenEventType } from '$lib/sse/types';
    import { invalidateAll } from '$app/navigation';
    import { PrayerSubscriptionManager } from '$lib/services/prayerSubscriptionManager';
    import InternetStatus from '$lib/themes/components/InternetStatus.svelte';
    
    // Define props
    let { data } = $props();
    
    // Component state
    let pageComponent = $state<typeof Loader | any>(Loader);
    let lastUpdateId = $state('');  // Track the last update ID
    let processedEvents = $state<Map<string, number>>(new Map()); // Track events with timestamps
    let isProcessingEvent = $state(false); // Lock to prevent concurrent processing
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let scheduledReloadTimer: ReturnType<typeof setTimeout> | null = null;
    
    // Services
    let prayerManager = $state<PrayerSubscriptionManager | null>(null);
    
    // State stores
    let prayerState = $state<any>({
        nextPrayer: null,
        currentPrayer: null,
        countdownText: '--:--:--',
        allPrayerTimes: [],
        calculator: null
    });
    
    let sseState = $state<{
        connectionStatus: 'unknown' | 'connected' | 'disconnected' | 'error';
        lastUpdateTime: string;
        lastAction: string;
        nextScheduledReload: string;
    }>({
        connectionStatus: 'unknown',
        lastUpdateTime: '',
        lastAction: '',
        nextScheduledReload: ''
    });
    
    console.log('[Prayer Screen] Initializing screen component');
    // Create SSE connection with better event handling
    const connection = source('/api/sse', {
        open() {
            console.log('[Prayer Screen] SSE connection opened');
            sseState.connectionStatus = 'connected';
            sseState.lastAction = 'Connection established';
        },
        close({ connect }) {
            console.log('[Prayer Screen] SSE connection closed, reconnecting...');
            sseState.connectionStatus = 'disconnected';
            sseState.lastAction = 'Connection closed, reconnecting...';
            // Reconnect after 3 seconds if disconnected
            setTimeout(() => connect(), 3000);
        },
        error(err) {
            console.error('[Prayer Screen] SSE connection error:', err);
            sseState.connectionStatus = 'error';
            sseState.lastAction = 'Connection error';
        }
    });
    
    // Schedule reloads - at 1:00 AM nightly and every 4 hours
    function scheduleReloads() {
        // Clear any existing scheduled reload
        if (scheduledReloadTimer) {
            clearTimeout(scheduledReloadTimer);
        }

        const now = new Date();
        
        // Calculate time until next 1:00 AM
        const nextMidnight = new Date(now);
        nextMidnight.setHours(1, 0, 0, 0); // Set to 1:00:00.000 AM
        
        // If it's already past 1:00 AM, schedule for tomorrow
        if (now >= nextMidnight) {
            nextMidnight.setDate(nextMidnight.getDate() + 1);
        }
        
        // Calculate time until next 4-hour interval (from the start of the day)
        const hours = now.getHours();
        const next4HourBlock = new Date(now);
        const nextBlockHour = Math.ceil(hours / 4) * 4;
        next4HourBlock.setHours(nextBlockHour, 0, 0, 0);
        
        // If the next 4-hour block is in the past, add 4 hours
        if (next4HourBlock <= now) {
            next4HourBlock.setHours(next4HourBlock.getHours() + 4);
        }
        
        // Choose the earlier of the two times
        const nextReloadTime = nextMidnight < next4HourBlock ? nextMidnight : next4HourBlock;
        const timeUntilReload = nextReloadTime.getTime() - now.getTime();
        
        // Update the next scheduled reload time for display
        sseState.nextScheduledReload = nextReloadTime.toLocaleString();
        
        console.log(`[Prayer Screen] Next reload scheduled for ${nextReloadTime.toLocaleString()} (in ${Math.round(timeUntilReload/1000/60)} minutes)`);
        
        // Schedule the reload
        scheduledReloadTimer = setTimeout(() => {
            console.log('[Prayer Screen] Executing scheduled reload');
            window.location.reload();
        }, timeUntilReload);
    }
    
    // Subscribe to specific event types
    const screenEvents = connection.select(EventType.SCREEN_EVENT);
    const notifications = connection.select(EventType.NOTIFICATION);
    const systemStatus = connection.select(EventType.SYSTEM_STATUS);
    const status = connection.select(EventType.STATUS);
    
    // Extract theme change logic to a dedicated function
    async function handleThemeChange(theme: string) {
        console.log('[Prayer Screen] Handling theme change to:', theme);
        
        try {
            const componentModule = await import(
                `$lib/themes/collections/${theme}/page.svelte`
            ).catch(err => {
                console.error(`Failed to load theme: ${theme}`, err);
                return null;
            });
            
            if (componentModule) {
                console.log('[Prayer Screen] Theme component loaded successfully');
                pageComponent = componentModule.default;
                sseState.lastAction = `Theme changed to ${theme}`;
            }
        } catch (err) {
            console.error('[Prayer Screen] Error loading theme component:', err);
        }
    }
    
    // Helper to safely parse JSON
    function safeJsonParse(data: any) {
        if (typeof data !== 'string') return data;
        try {
            return JSON.parse(data);
        } catch (e) {
            console.warn('[Prayer Screen] Failed to parse JSON:', e);
            return data;
        }
    }
    
    // Function to forcefully refresh content with debouncing
    function forceContentRefresh() {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        
        debounceTimer = setTimeout(async () => {
            console.log('[Prayer Screen] Executing content refresh');
            try {
                // First invalidate all data
                await invalidateAll();
                
                // Then directly refresh the prayer calculator if available
                if (prayerManager && data?.data) {
                    prayerManager.updateCalculator(data.data);
                }

                sseState.lastAction = 'Content refreshed';
                sseState.lastUpdateTime = new Date().toLocaleTimeString();
            } catch (err) {
                console.error('[Prayer Screen] Error during forced refresh:', err);
            } finally {
                // Reset the processing lock after a delay
                setTimeout(() => {
                    isProcessingEvent = false;
                }, 500);
                debounceTimer = null;
            }
        }, 100); // Short debounce
    }
    
    // Process content update with deduplication
    function handleContentUpdate(payload: any) {
        // Extract update info
        const updateId = payload.data?.updateId || '';
        const timestamp = payload.data?.timestamp || Date.now();
        const message = payload.data?.message || '';
        
        // Create a unique event signature that includes the content
        const eventSignature = `${payload.type}-${updateId}-${message}`;
        const now = Date.now();
        
        // Log the update
        console.log(`[Prayer Screen] Content update received: ID=${updateId}, Message="${message}"`);
        
        // Check if we're still processing a previous event
        if (isProcessingEvent) {
            return;
        }
        
        // Check if we've seen this exact event recently (within 2 seconds)
        if (processedEvents.has(eventSignature)) {
            const lastTime = processedEvents.get(eventSignature) || 0;
            if (now - lastTime < 2000) {
                return;
            }
        }
        
        // Set processing lock
        isProcessingEvent = true;
        
        // Record this event
        processedEvents.set(eventSignature, now);
        
        // Clean up old events (keep only last 10)
        if (processedEvents.size > 10) {
            // Convert to array, sort by timestamp, and keep the newest 10
            const eventsArray = Array.from(processedEvents.entries());
            eventsArray.sort((a, b) => b[1] - a[1]); // Sort by timestamp (newest first)
            
            // Create new map with just the newest 10 items
            processedEvents = new Map(eventsArray.slice(0, 10));
        }
        
        // Update the last ID and force a refresh
        console.log('[Prayer Screen] Processing content update');
        if (updateId) lastUpdateId = updateId;
        forceContentRefresh();
    }
    
    // Single event handler for screen events
    let screenEventsHandler = (event: any) => {
        if (!event) return;
        
        const payload = safeJsonParse(event);
        console.log('[Prayer Screen] Screen event received:', payload?.type);
        
        // Update state with latest action info
        const action = payload.type === ScreenEventType.CONTENT_UPDATE 
            ? 'Content update: ' + (payload.data?.message || 'Data refreshed')
            : `Screen event: ${payload.type}`;
            
        sseState.lastUpdateTime = new Date().toLocaleTimeString();
        sseState.lastAction = action;
        
        if (payload.type === ScreenEventType.PAGE_RELOAD) {
            setTimeout(() => window.location.reload(), 1000);
        } 
        else if (payload.type === ScreenEventType.CONTENT_UPDATE) {
            handleContentUpdate(payload);
        }
        else if (payload.type === ScreenEventType.THEME_CHANGE) {
            console.log('[Prayer Screen] Theme change requested:', payload.data?.theme);
            if (payload.data?.theme) {
                handleThemeChange(payload.data.theme);
            }
        }
    };
    
    // Handle screen events with proper deduplication
    $effect(() => {
        // Use the event but pass it through our handler
        if ($screenEvents) {
            screenEventsHandler($screenEvents);
        }
    });
    
    // Handle notification events
    $effect(() => {
        if ($notifications) {
            const payload = safeJsonParse($notifications);
            console.log('[Prayer Screen] Notification received:', payload);
            sseState.lastUpdateTime = new Date().toLocaleTimeString();
            sseState.lastAction = `Notification: ${payload.message}`;
        }
    });
    
    // Handle system status updates
    $effect(() => {
        if ($systemStatus) {
            const payload = safeJsonParse($systemStatus);
            console.log('[Prayer Screen] System status update:', payload);
            sseState.connectionStatus = payload.status;
            sseState.lastUpdateTime = new Date().toLocaleTimeString();
            sseState.lastAction = `System status: ${payload.status}`;
        }
    });
    
    // Handle connection status updates
    $effect(() => {
        if ($status) {
            const payload = safeJsonParse($status);
            console.log('[Prayer Screen] Status update:', payload);
            if (payload && payload.status) {
                sseState.connectionStatus = payload.status;
                sseState.lastUpdateTime = new Date().toLocaleTimeString();
                sseState.lastAction = payload.message || `Status: ${payload.status}`;
            }
        }
    });
    
    // Watch for changes in data to update the prayer calculator
    $effect(() => {
        if (data?.data && prayerManager) {
            try {
                prayerManager.updateCalculator(data.data);
            } catch (err) {
                console.error('Error updating prayer calculator:', err);
            }
        }
    });
    
    onMount(async () => {
        try {
            // Initialize prayer time manager
            if (data?.data) {
                prayerManager = new PrayerSubscriptionManager();
                prayerManager.initialize(data.data);
                
                // Subscribe to prayer state changes
                const unsubscribe = prayerManager.state.subscribe(state => {
                    prayerState = state;
                });
            } else {
                throw error(500, 'Prayer time data is not available');
            }
            
            // Load the component dynamically
            const componentModule = await import(
                `$lib/themes/collections/${data.themePath}/page.svelte`
            ).catch(err => {
                throw error(404, `Failed to load theme component: ${data.themePath}`);
            });
            
            pageComponent = componentModule.default;
            
            // Schedule automatic reloads
            scheduleReloads();
        } catch (err) {
            // Let the error propagate to the error handler
            throw err;
        }
    });
    
    onDestroy(() => {
        // Clean up services
        if (prayerManager) {
            prayerManager.destroy();
        }
        
        // Clear any pending timeouts
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        
        // Clear scheduled reload timer
        if (scheduledReloadTimer) {
            clearTimeout(scheduledReloadTimer);
        }
        
        // Close the SSE connection
        connection.close();
    });
    
    // Derive the component for use in template
    const Component = $derived(pageComponent);
    
    // Create an enhanced data object with prayer information and SSE state
    const enhancedData: AppDataResult<any> = $derived({
        apiData: data?.data,
        prayerTimes: {
            currentPrayer: prayerState.currentPrayer,
            nextPrayer: prayerState.nextPrayer,
            countdownText: prayerState.countdownText,
            allPrayerTimes: prayerState.allPrayerTimes,
            calculator: prayerState.calculator
        }
    });
</script>

<svelte:head>
    <title>Prayer Times Display</title>
    <meta name="description" content="Prayer times display screen with live updates" />
</svelte:head>

<!-- Add the SSE status component -->
<SSEStatus {sseState} />

<!-- Add the internet status component -->
<InternetStatus showQrCode={data?.data.themeSettings.showQrCode || false} />

{#if Component !== Loader}
    <Component data={enhancedData} />
{:else}
    <Loader />
{/if}