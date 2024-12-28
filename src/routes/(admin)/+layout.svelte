<!-- +layout.svelte -->
<script lang="ts">
  import HeadWrapper from '$lib/components/HeadWrapper.svelte';
  import Navbar from '$lib/components/general/Navbar.svelte';
  import Breadcrumbs from '$lib/components/general/Breadcrumbs.svelte';
  import { page } from '$app/state';
  import { fade } from 'svelte/transition';
  import { browser } from '$app/environment';

  let { children } = $props();
  let scrolled = $state(false);
  
  if (browser) {
    window.addEventListener('scroll', () => {
      scrolled = window.scrollY > 20;
    });
  }
</script>

<HeadWrapper page_title={page.data.title} />

<div class="flex flex-col">
  <!-- Header -->
  <header 
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 shadow-sm border-b border-base-200
      {scrolled ? 'bg-base-100/95 shadow-md' : 'bg-transparent'}"
  >
    <Navbar />
    <div class="bg-base-100/95 px-4 mt-16">
      <div class="container mx-auto">
        <Breadcrumbs />
      </div>
    </div>
  </header>

  <!-- Adjusted main content margin to account for navbar + breadcrumbs -->
  <main 
    class="flex-1 container mx-auto px-4 max-w-7xl mt-24 mb-24 md:mb-16 relative"
    in:fade={{ duration: 150 }}
  >
    <div class="py-6">
      {@render children()}
    </div>
  </main>
</div>