<script lang="ts">
    import { onMount } from 'svelte';
    import type { SvelteComponent } from 'svelte';
    import type { PageData } from './$types';
    import Placeholder from '$lib/themes/components/Placeholder.svelte';
  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

    let pageComponent: new (...args: any[]) => SvelteComponent = $state(Placeholder);
    onMount(async () => {
        // Load the page component from the theme
        const componentModule = await import(`../../../lib/themes/themes-collections/${data.componentPath}/page.svelte`);
        pageComponent = componentModule.default;
     
    });

  const SvelteComponent_1 = $derived(pageComponent);
</script>
  

<SvelteComponent_1 data={data} />