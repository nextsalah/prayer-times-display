<!-- src/routes/(app)/screen/[theme]/+page.svelte -->
<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import Loader from '$lib/themes/components/Loader.svelte';
    import type { AppDataResult } from '$lib/themes/interfaces/types.js';
    import { error } from '@sveltejs/kit';
    import toast, { Toaster } from 'svelte-french-toast';
    import '$lib/themes/styles/global.css';
    import { SSEHandler } from '$lib/services/sseHandler';
    import { PrayerSubscriptionManager } from '$lib/services/prayerSubscriptionManager';
    
    // Define props
    let { data } = $props();
    
    // Component state
    let pageComponent = $state<typeof Loader | any>(Loader);
    
    // Services
    let prayerManager = $state<PrayerSubscriptionManager | null>(null);
    let sseHandler = $state<SSEHandler | null>(null);
    
    // State stores
    let prayerState = $state<any>({
        nextPrayer: null,
        currentPrayer: null,
        countdownText: '--:--:--',
        allPrayerTimes: [],
        calculator: null
    });
    
    let sseState = $state<any>({
        connectionStatus: 'unknown',
        lastUpdateTime: ''
    });
    
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
        if (data?.data && prayerManager) {
            try {
                prayerManager.updateCalculator(data.data);
            } catch (err) {
                console.error('Error updating prayer calculator:', err);
                showToast('Error updating prayer times', 'error');
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
            
            // Initialize SSE handler
            sseHandler = new SSEHandler(showToast, handleThemeChange);
            sseHandler.initialize();
            
            // Subscribe to SSE state changes
            const sseUnsubscribe = sseHandler.state.subscribe(state => {
                sseState = state;
            });
            
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
        if (sseHandler) {
            sseHandler.destroy();
        }
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
        },
        sseData: {
            connectionStatus: sseState.connectionStatus,
            lastUpdateTime: sseState.lastUpdateTime
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