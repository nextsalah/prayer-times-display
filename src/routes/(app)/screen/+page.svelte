<script lang="ts">
    import { onMount } from 'svelte';
    import type { ComponentType } from 'svelte';
    import { error } from '@sveltejs/kit';
    import type { PageData } from './$types';
    import Placeholder from '$lib/themes/components/Placeholder.svelte';

    export let data: PageData;

    let pageComponent: ComponentType | null = null;

    onMount(async () => {
        try {
            // Dynamically import the page component
            const { default: component } = await import(`../../../lib/themes/collections/${data.componentPath}/page.svelte`);
            pageComponent = component;
        } catch (err) {
            error(404, { message: (err as Error).message || 'Page not found' });
        }
    });
</script>

{#if pageComponent}
    <svelte:component this={pageComponent} {data} />
{:else}
    <Placeholder />
{/if}
