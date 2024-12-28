<!-- Breadcrumbs.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  interface Breadcrumb {
    href: string;
    title: string;
  }

  let breadcrumbs: Breadcrumb[] = $state([]);
  let mounted = $state(false);

  // Function to navigate without reload
  function navigate(href: string) {
    goto(href, { 
      replaceState: false,
      noScroll: true,
      keepFocus: true
    });
  }

  onMount(() => {
    mounted = true;
    return () => {
      mounted = false;
    };
  });
  
  $effect(() => {
    if (!mounted) return;
    
    const path = $page.url.pathname;
    const segments = path.split('/').filter(Boolean);
    
    breadcrumbs = segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      const title = segment.charAt(0).toUpperCase() + segment.slice(1);
      return { href, title };
    });
  });
</script>

{#if mounted}
  <nav class="text-sm breadcrumbs p-2" aria-label="Breadcrumb navigation">
    <ul class="flex flex-wrap items-center gap-2">
      <li>
        <button 
          class="hover:text-primary transition-colors px-1"
          onclick={() => navigate('/controlpanel')}
          aria-label="Home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
      </li>
      {#each breadcrumbs as { href, title }, i}
        <li class="flex items-center">
          <button 
            class="hover:text-primary transition-colors px-1 {
              i === breadcrumbs.length - 1 ? 'text-primary font-medium' : ''
            }"
            onclick={() => navigate(href)}
          >
            {title}
          </button>
        </li>
      {/each}
    </ul>
  </nav>
{/if}