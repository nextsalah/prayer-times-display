<script lang="ts">
  import { navigation } from '$lib/config/navigation';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  let isMobile = $state(false);

  onMount(() => {
    const checkMobile = () => {
      isMobile = window.innerWidth < 768;
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  });

  let isActive = $derived((path: string) => $page.url.pathname === path);
</script>

<div class="btm-nav btm-nav-lg bg-base-100 shadow-lg border-t border-base-200">
  {#each navigation.items as item}
    <button
      class="flex flex-col items-center gap-1 px-2 hover:bg-base-200 transition-colors {
        isActive(item.href) ? 'active text-primary' : 'text-base-content'
      }"
      onclick={() => goto(item.href)}
    >
      <div class="indicator">
        <item.icon 
          size={isMobile ? 20 : 24} 
          class="transition-all duration-200"
        />
      </div>
      {#if browser}
        <span class="btm-nav-label  md:text-xs truncate font-medium">
          { 
            isMobile 
              ? item.mobileTitle 
              : item.title
          }
        </span>
      {/if}
    </button>
  {/each}
</div>