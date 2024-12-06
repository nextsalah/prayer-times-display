<script>
  import 'tailwindcss/tailwind.css';
  import HeadWrapper from '$lib/components/HeadWrapper.svelte';
  import BottomNavigation from '$lib/components/general/BottomNavigation.svelte';
  import { page } from '$app/stores';
  import Navbar from '$lib/components/general/Navbar.svelte';

  $: isControlPanel = $page.url.pathname === '/controlpanel';
</script>

<!-- HeadWrapper is a component that sets the page title and meta tags. -->
<HeadWrapper page_title={$page.data.title || ""} />

<!-- Body -->
<Navbar />
<main class="container mx-auto px-4 max-w-7xl mt-16">
  <slot />
</main>
{#if !isControlPanel}
  <BottomNavigation />
{/if}