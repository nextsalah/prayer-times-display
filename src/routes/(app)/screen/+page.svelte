<script lang="ts">
    import { onMount } from 'svelte';
    import type { PageData } from './$types';
    import Placeholder from '$themes/components/Placeholder.svelte';

    // Define a type for your component props
    type ComponentProps = {
        data: {
            prayerTimes: {
                today: PrayerDay;
                tomorrow: PrayerDay;
                dayAfterTomorrow: PrayerDay;
            };
            componentPath: string;
        };
    };

    // Define the prayer day type
    type PrayerDay = {
        date: Date;
        id: number;
        fajr: string;
        sunrise: string;
        dhuhr: string;
        asr: string;
        maghrib: string;
        isha: string;
    };

    let { data } = $props();

    let pageComponent = $state<typeof Placeholder | any>(Placeholder);

    onMount(async () => {
        try {
            const componentModule = await import(
                `../../../lib/themes/collections/${data.componentPath}/page.svelte`
            );
            pageComponent = componentModule.default;
        } catch (error) {
            console.error('Error loading component:', error);
            pageComponent = Placeholder;
        }
    });
</script>

{#if pageComponent !== Placeholder}
    {@const SvelteComponent = pageComponent}
    <SvelteComponent {data} />
{:else}
    <Placeholder />
{/if}