<script lang="ts">
    import { onMount } from 'svelte';
    import type { PageData } from './$types';
    import Placeholder from '$themes/components/Placeholder.svelte';
    import PrayerTimeCalculator from '$themes/logic/prayertime_calculator';

    let { data } = $props();
    let pageComponent = $state<typeof Placeholder | any>(Placeholder);
    let calculator = $state<PrayerTimeCalculator | null>(null);

    onMount(async () => {
        // Initialize prayer time calculator
        calculator = new PrayerTimeCalculator(data.apiData);

        try {
            const componentModule = await import(
                `../../../../themes/collections/${data.componentPath}/page.svelte`
            );
            pageComponent = componentModule.default;
        } catch (error) {
            console.error('Error loading component:', error);
            pageComponent = Placeholder;
        }
    });
</script>

<svelte:head>
    <title>Prayer Times Display</title>
    <meta name="description" content="Prayer times display screen" />
</svelte:head>

{#if pageComponent !== Placeholder}
    {@const SvelteComponent = pageComponent}
    <SvelteComponent {data} calculator={calculator} />
{:else}
    <Placeholder />
{/if}