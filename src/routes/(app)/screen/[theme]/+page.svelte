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

    // Define props
    let { data } = $props();
    
    // Component state
    let pageComponent = $state<typeof Loader | any>(Loader);
    let prayerCalculator = $state<PrayerTimeCalculator | null>(null);
    let nextPrayer = $state<any>(null);
    let countdownText = $state<string>('--:--:--');
    let allPrayerTimes = $state<any[]>([]);
    
    // Subscription handlers
    let nextPrayerTimeUnsubscribe: () => void;
    let countdownToTextUnsubscribe: () => void;
    let allPrayerTimesUnsubscribe: () => void;
    
    // Setup subscriptions
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
    
    onMount(async () => {
        try {
            // Initialize prayer time calculator if we have API data
            if (data?.data) {
                prayerCalculator = new PrayerTimeCalculator(data.data);
                setupSubscriptions();
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
        // Clean up subscriptions
        if (nextPrayerTimeUnsubscribe) nextPrayerTimeUnsubscribe();
        if (countdownToTextUnsubscribe) countdownToTextUnsubscribe();
        if (allPrayerTimesUnsubscribe) allPrayerTimesUnsubscribe();
        
        // Clean up the prayer calculator
        if (prayerCalculator) {
            prayerCalculator.destroy();
        }
    });
    
    // Derive the component for use in template
    const Component = $derived(pageComponent);
    
    // Create an enhanced data object with prayer information
    const enhancedData: AppDataResult<any> = $derived({
        apiData: data?.data,
        prayerTimes: {
            nextPrayer,
            countdownText,
            allPrayerTimes,
            calculator: prayerCalculator
        }
    });
</script>

<svelte:head>
    <title>Prayer Times Display</title>
    <meta name="description" content="Prayer times display screen with live updates" />
</svelte:head>

{#if Component !== Loader}
    <Component data={enhancedData} />
{:else}
    <Loader />
{/if}