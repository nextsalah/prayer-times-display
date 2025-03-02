<script lang="ts">
    import { onMount } from 'svelte';
    import Loader from '$themes/components/Loader.svelte';
    import PrayerTimeCalculator from '$themes/logic/prayertime_calculator';

    let { data } = $props();
    let pageComponent = $state<typeof Loader | any>(Loader);
    let calculator = $state<PrayerTimeCalculator | null>(null);

    onMount(async () => {
        // Initialize prayer time calculator
        calculator = new PrayerTimeCalculator(data);
        try {
            const componentModule = await import(
                `../../../../../themes/collections/${data.componentPath}/page.svelte`
            );
            pageComponent = componentModule.default;
        } catch (error) {
            console.error('Error loading component:', error);
            pageComponent = Loader;
        }
    });

    const SvelteComponent = $derived(pageComponent);
</script>

<svelte:head>
    <title>Prayer Times Display</title>
    <meta name="description" content="Prayer times display screen" />
</svelte:head>

{#if pageComponent !== Loader}
    {@const SvelteComponent = pageComponent}
    <SvelteComponent {data} {calculator} />
{:else}
    <Loader />
{/if}