<!-- BottomNavigation.svelte -->
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

<div class="btm-nav btm-nav-lg bg-base-200 shadow-lg border-t border-base-300">
  {#each navigation.items as item}
    <button
      class="group relative {
        isActive(item.href) 
          ? 'active text-primary' 
          : 'text-base-content/80 hover:text-primary'
      } transition-all duration-200"
      onclick={() => goto(item.href)}
    >
      <div class="flex flex-col items-center gap-1 px-2">
        <div class="indicator">
          <item.icon 
            size={isMobile ? 20 : 24} 
            class="transition-all duration-200 {
              isActive(item.href) 
                ? '' 
                : 'stroke-current group-hover:stroke-primary'
            }"
          />
        </div>
        {#if browser}
          <span class="btm-nav-label md:text-xs truncate font-medium 
            transition-all duration-200 group-hover:scale-105">
            {isMobile ? item.mobileTitle : item.title}
          </span>
        {/if}
      </div>

      <!-- Hover/Active Indicator -->
      <div class="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-primary scale-x-0 
        transition-transform duration-200"
      ></div>
    </button>
  {/each}
</div>