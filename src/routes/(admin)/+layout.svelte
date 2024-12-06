<script>
  import 'tailwindcss/tailwind.css';
  import HeadWrapper from '$lib/components/HeadWrapper.svelte';
  import BottomNavigation from '$lib/components/general/BottomNavigation.svelte';
  import { page } from '$app/stores';

  $: isControlPanel = $page.url.pathname === '/controlpanel';
</script>

<HeadWrapper page_title={$page.data.title || ""} />
<slot />
{#if !isControlPanel}
  <BottomNavigation />
{/if}