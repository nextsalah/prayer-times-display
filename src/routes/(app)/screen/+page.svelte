<script lang="ts">
    import { onMount } from 'svelte';
    import type { ComponentType } from 'svelte';
    import type { PageData } from './$types';
    import Placeholder from '$lib/themes/components/Placeholder.svelte';
    export let data: PageData;

    type NullableComponent = ComponentType | null;
    let pageComponent: NullableComponent = Placeholder;

    onMount(async () => {
        const componentModule = await import(`../../../lib/themes/collections/${data.componentPath}/page.svelte`);
        pageComponent = componentModule.default;
    });
</script>

{#if pageComponent !== Placeholder}
    <svelte:component this={pageComponent} {data} />
{:else}
    <Placeholder />
{/if}
