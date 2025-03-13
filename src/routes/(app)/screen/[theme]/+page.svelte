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
    
    // Define props
    let { data } = $props();
    
    // Component state
    let pageComponent = $state<typeof Loader | any>(Loader);
    
    // Services
    let prayerManager = $state<PrayerSubscriptionManager | null>(null);
    
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
            // Reconnect after 2 seconds if disconnected
            setTimeout(() => connect(), 2000);
        },
        error(err) {
            console.error('[Prayer Screen] SSE connection error:', err);
            sseState.connectionStatus = 'error';
            sseState.lastAction = 'Connection error';
        }
    });
    
    // Subscribe to specific event types
    const screenEvents = connection.select(EventType.SCREEN_EVENT);
    const notifications = connection.select(EventType.NOTIFICATION);
    const systemStatus = connection.select(EventType.SYSTEM_STATUS);
    const status = connection.select(EventType.STATUS);
    
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
    }>({
        connectionStatus: 'unknown',
        lastUpdateTime: '',
        lastAction: ''
    });

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
    
    // Handle screen events (theme changes, page reloads, etc.)
    $effect(() => {
        if ($screenEvents) {
            const payload = safeJsonParse($screenEvents);
            console.log('[Prayer Screen] Screen event received:', payload);
            
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
                console.log('[Prayer Screen] Refreshing data due to content update');
                invalidateAll(); // This should refresh the data
            }
            else if (payload.type === ScreenEventType.THEME_CHANGE) {
                console.log('[Prayer Screen] Theme change requested:', payload.data?.theme);
                if (payload.data?.theme) {
                    handleThemeChange(payload.data.theme);
                }
            }
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

{#if Component !== Loader}
    <Component data={enhancedData} />
{:else}
    <Loader />
{/if}