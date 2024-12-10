<script lang="ts">
  import 'tailwindcss/tailwind.css';
  import HeadWrapper from '$lib/components/HeadWrapper.svelte';
  import BottomNavigation from '$lib/components/general/BottomNavigation.svelte';
  import Navbar from '$lib/components/general/Navbar.svelte';
  import { page } from '$app/stores';
  import { fade } from 'svelte/transition';

  const excludeBottomNav = ['/controlpanel'];
  $: shouldShowBottomNav = !excludeBottomNav.includes($page.url.pathname);
</script>

<HeadWrapper page_title={$page.data.title || ""} />
<div class="min-h-screen flex flex-col bg-base-100"> <!-- Main background -->
  <!-- Header -->
  <header class="fixed top-0 left-0 right-0 z-50">
    <nav class="bg-base-200 border-b border-base-300"> <!-- Navbar with slight contrast -->
      <Navbar />
    </nav>
  </header>

  <!-- Main Content -->
  <main 
    class="flex-1 container mx-auto px-4 max-w-7xl mt-16 mb-24 md:mb-16"
    in:fade={{ duration: 150 }}
  >
    <div class="py-6">
      <slot />
    </div>
  </main>

  <!-- Bottom Navigation -->
  {#if shouldShowBottomNav}
    <div class="fixed bottom-0 left-0 right-0 z-50">
      <div class="bg-base-200 border-t border-base-300"> <!-- Bottom nav with same treatment as top -->
        <BottomNavigation />
      </div>
    </div>
  {/if}
</div>

<style lang="postcss">
  /* Ensure content doesn't get hidden behind fixed elements */
  main {
    min-height: calc(100vh - theme(spacing.16) - theme(spacing.24));
  }

  /* Add iOS safe area support */
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    main {
      padding-bottom: calc(theme(spacing.24) + env(safe-area-inset-bottom));
    }
  }
</style>