<script lang="ts">
    import { onMount } from 'svelte';
    import type { SvelteComponent } from 'svelte';
    import type { PageData } from './$types';
    import Placeholder from '$lib/themes/components/Placeholder.svelte';
    export let data: PageData;

    let pageComponent: new (...args: any[]) => SvelteComponent = Placeholder;
    onMount(async () => {
        // Load the page component from the theme
        const componentModule = await import(`../../../lib/themes/themes-collections/${data.componentPath}/page.svelte`);
        pageComponent = componentModule.default;
     
    });
</script>
  

<svelte:component this={pageComponent} data={data} />