<script lang="ts">
  import HeadWrapper from '$lib/components/HeadWrapper.svelte';
  import BottomNavigation from '$lib/components/general/BottomNavigation.svelte';
  import Navbar from '$lib/components/general/Navbar.svelte';
  import { page } from '$app/state';
  import { fade } from 'svelte/transition';

  let { children } = $props();

  // Exclude pages from showing bottom navigation
  const excludeBottomNav = ['/controlpanel'];
  let shouldShowBottomNav = $derived(!excludeBottomNav.includes(page.url.pathname));
</script>

<HeadWrapper page_title={page.data.title} />

<div class="min-h-screen flex flex-col bg-gradient-to-b from-base-200 to-base-300">
  <!-- Header -->
  <header class="fixed top-0 left-0 right-0 z-50">
    <nav class="bg-base-100/95 backdrop-blur-sm border-b border-base-300/50"> <!-- Semi-transparent nav -->
      <Navbar />
    </nav>
  </header>

  <!-- Main Content -->
  <main 
    class="flex-1 container mx-auto px-4 max-w-7xl mt-16 mb-24 md:mb-16"
    in:fade={{ duration: 150 }}
  >
    <div class="py-6">
      {@render children()}
    </div>
  </main>

  <!-- Bottom Navigation -->
  {#if shouldShowBottomNav}
    <div class="fixed bottom-0 left-0 right-0 z-50">
      <div class="bg-base-100/95 backdrop-blur-sm border-t border-base-300/50"> <!-- Matching bottom nav -->
        <BottomNavigation />
      </div>
    </div>
  {/if}
</div>