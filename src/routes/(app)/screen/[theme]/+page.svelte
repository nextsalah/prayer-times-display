<!-- src/routes/(app)/screen/[theme]/+page.svelte -->
<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import Loader from '$lib/themes/components/Loader.svelte';
    import PrayerTimeCalculator, { 
        nextPrayerTimeSubscribe, 
        countdownToTextSubscribe, 
        allPrayerTimesSubscribe 
    } from '$lib/themes/logic/prayertime_calculator';
    import type { AppDataResult } from '$lib/themes/interfaces/types.js';
    import { error } from '@sveltejs/kit';
    import { sseClient, EventType, ScreenEventType } from '$lib/sse/client';
    import toast, { Toaster } from 'svelte-french-toast';
    import { invalidateAll } from '$app/navigation';

    // Define props
    let { data } = $props();
    
    // Component state
    let pageComponent = $state<typeof Loader | any>(Loader);
    let prayerCalculator = $state<PrayerTimeCalculator | null>(null);
    let nextPrayer = $state<any>(null);
    let countdownText = $state<string>('--:--:--');
    let allPrayerTimes = $state<any[]>([]);
    
    // SSE state
    let connectionStatus = $state<'online' | 'offline' | 'maintenance' | 'unknown'>('unknown');
    let lastUpdateTime = $state<string>('');
    
    // Subscription handlers
    let nextPrayerTimeUnsubscribe: () => void;
    let countdownToTextUnsubscribe: () => void;
    let allPrayerTimesUnsubscribe: () => void;
    let sseStateUnsubscribe: () => void;
    
    // SSE event unsubscribe handlers
    let sseEventUnsubscribes: Array<() => void> = [];
    
    // Setup prayer time subscriptions
    function setupSubscriptions() {
        nextPrayerTimeUnsubscribe = nextPrayerTimeSubscribe(value => {
            nextPrayer = value;
        });
        
        countdownToTextUnsubscribe = countdownToTextSubscribe(value => {
            countdownText = value;
        });
        
        allPrayerTimesUnsubscribe = allPrayerTimesSubscribe(value => {
            allPrayerTimes = value;
        });
    }
    
    // Helper function to show toast based on notification level
    function showToast(message: string, level: string = 'info') {
        
        switch (level) {
            case 'info':
                toast.success(message);
                break;
            case 'warning':
                toast(message, {
                    icon: '⚠️'
                });
                break;
            case 'error':
                toast.error(message);
                break;
            default:
                toast(message);
        }
    }
    
    // Function to update prayer calculator with new data
    function updatePrayerCalculator(newData: any) {
        if (prayerCalculator) {
            prayerCalculator.destroy();
        }
        prayerCalculator = new PrayerTimeCalculator(newData);
        setupSubscriptions();
    }
    
    // Setup SSE event handlers
    function setupSSEHandlers() {
        // Connect to SSE if not already connected
        if (!sseClient.isConnected()) {
            sseClient.connect();
        }
        
        // Subscribe to SSE state changes
        sseStateUnsubscribe = sseClient.state.subscribe(state => {
            console.log('[Prayer Screen] SSE state changed:', state);
            
            // Debug: Check the raw message to understand what's being received
            if (state.lastMessage) {
                console.log('[Prayer Screen] Raw SSE message received:', state.lastMessage);
                lastUpdateTime = new Date().toLocaleTimeString();
                
                // Direct handling of theme change from SSE state
                // This catches theme changes that might come in a different format
                if (state.lastMessage.type === 'theme_change') {
                    const theme = state.lastMessage.payload;
                    console.log('[Prayer Screen] Theme change detected in SSE message:', theme);
                    handleThemeChange(theme);
                }
            }
            
            // Handle connection status changes
            const wasConnected = connectionStatus === 'online';
            const isConnected = state.connected;
            
            connectionStatus = state.connected ? 'online' : 'offline';
            
            // Show reconnection toast if we were disconnected and now reconnected
            if (!wasConnected && isConnected) {
                 console.log('[Prayer Screen] Reconnected to SSE server');
            }
        });
        
        // Handle screen events (like page reload or theme change)
        sseEventUnsubscribes.push(
            sseClient.on(EventType.SCREEN_EVENT, async (payload) => {
                console.log('[Prayer Screen] Screen event received:', payload);
                
                if (payload.type === ScreenEventType.PAGE_RELOAD) {
                    showToast('Reloading page...', 'info');
                    setTimeout(() => window.location.reload(), 1000);
                } 
                // Standard event handling for theme change (if it comes properly formatted)
                else if (payload.type === ScreenEventType.THEME_CHANGE) {
                    console.log('[Prayer Screen] Theme change event detected:', payload);
                    
                    // Handle both possible formats
                    if (payload.data?.theme) {
                        handleThemeChange(payload.data.theme);
                    } else if (typeof payload.data === 'string') {
                        handleThemeChange(payload.data);
                    }
                }
                else if (payload.type === ScreenEventType.CONTENT_UPDATE) {
                    try {
                        await invalidateAll();
                        showToast('Content updated successfully', 'info');
                    } catch (err) {
                        console.error('Error updating content:', err);
                        showToast('Failed to update content', 'error');
                    }
                }
            })
        );
        
        // Handle direct theme change events (if they come through the notification channel)
        sseEventUnsubscribes.push(
            sseClient.on(EventType.SCREEN_EVENT, (payload) => {
                if (payload.type === ScreenEventType.THEME_CHANGE) {
                    console.log('[Prayer Screen] Direct theme change event:', payload);
                    const theme = typeof payload.data === 'string' ? payload.data : payload.data?.theme;
                    if (theme) {
                        handleThemeChange(theme);
                    }
                }
            })
        );
        
        // Handle notifications
        sseEventUnsubscribes.push(
            sseClient.on(EventType.NOTIFICATION, (payload) => {
                console.log('[Prayer Screen] Notification received:', payload);
                showToast(payload.message, payload.level);
            })
        );
        
        // Handle system status updates
        sseEventUnsubscribes.push(
            sseClient.on(EventType.SYSTEM_STATUS, (payload) => {
                console.log('[Prayer Screen] System status update:', payload);
                connectionStatus = payload.status;
                
                if (payload.status === 'maintenance') {
                    showToast(
                        payload.message || 'System maintenance in progress', 
                        'warning'
                    );
                }
            })
        );
    }
    
    // Extract theme change logic to a dedicated function
    async function handleThemeChange(theme: string) {
        console.log('[Prayer Screen] Handling theme change to:', theme);
        showToast(`Changing theme to ${theme}`, 'info');
        
        try {
            const componentModule = await import(
                `$lib/themes/collections/${theme}/page.svelte`
            ).catch(err => {
                console.error(`Failed to load theme: ${theme}`, err);
                showToast(`Failed to load theme: ${theme}`, 'error');
                return null;
            });
            
            if (componentModule) {
                console.log('[Prayer Screen] Theme component loaded successfully');
                pageComponent = componentModule.default;
            }
        } catch (err) {
            console.error('[Prayer Screen] Error loading theme component:', err);
            showToast('Error loading theme', 'error');
        }
    }
    
    // Watch for changes in data to update the prayer calculator
    $effect(() => {
        if (data?.data) {
            // Check if we need to initialize or update the prayer calculator
            if (!prayerCalculator) {
                updatePrayerCalculator(data.data);
            } else {
                try {
                    // Simple update check - if API data is available, update the calculator
                    // This avoids complex comparisons that might cause errors
                    if (data.data !== prayerCalculator.apiData) {
                        updatePrayerCalculator(data.data);
                    }
                } catch (err) {
                    console.error('Error comparing prayer calculator data:', err);
                    // If comparison fails, update anyway to be safe
                    updatePrayerCalculator(data.data);
                }
            }
        }
    });
    
    onMount(async () => {
        try {
            // Initialize prayer time calculator if we have API data
            if (data?.data) {
                prayerCalculator = new PrayerTimeCalculator(data.data);
                setupSubscriptions();
            } else {
                throw error(500, 'Prayer time data is not available');
            }
            
            // Set up SSE event handling
            setupSSEHandlers();
            
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
        // Clean up prayer time subscriptions
        if (nextPrayerTimeUnsubscribe) nextPrayerTimeUnsubscribe();
        if (countdownToTextUnsubscribe) countdownToTextUnsubscribe();
        if (allPrayerTimesUnsubscribe) allPrayerTimesUnsubscribe();
        
        // Clean up SSE subscriptions
        if (sseStateUnsubscribe) sseStateUnsubscribe();
        sseEventUnsubscribes.forEach(unsub => unsub());
        
        // Clean up the prayer calculator
        if (prayerCalculator) {
            prayerCalculator.destroy();
        }
    });
    
    // Derive the component for use in template
    const Component = $derived(pageComponent);
    
    // Create an enhanced data object with prayer information and SSE state
    const enhancedData: AppDataResult<any> = $derived({
        apiData: data?.data,
        prayerTimes: {
            nextPrayer,
            countdownText,
            allPrayerTimes,
            calculator: prayerCalculator
        },
        sseData: {
            connectionStatus,
            lastUpdateTime
        }
    });
</script>

<svelte:head>
    <title>Prayer Times Display</title>
    <meta name="description" content="Prayer times display screen with live updates" />
</svelte:head>

<!-- Include the Toaster component -->
<Toaster />

{#if Component !== Loader}
    <Component data={enhancedData} />
{:else}
    <Loader />
{/if}