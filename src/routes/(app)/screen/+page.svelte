<script lang="ts">
    import { onMount } from 'svelte';
    import type { ComponentType } from 'svelte';
    import type { PageData } from './$types';
    import Placeholder from '$lib/themes/components/Placeholder.svelte';
    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();

    type NullableComponent = ComponentType | null;
    let pageComponent: NullableComponent = $state(Placeholder);

    onMount(async () => {
        const componentModule = await import(`../../../lib/themes/collections/${data.componentPath}/page.svelte`);
        pageComponent = componentModule.default;
    });
</script>

{#if pageComponent !== Placeholder}
    {@const SvelteComponent = pageComponent}
    <SvelteComponent {data} />
{:else}
    <Placeholder />
{/if}
