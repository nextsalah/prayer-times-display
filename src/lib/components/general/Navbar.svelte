<!-- Navbar.svelte -->
<script lang="ts">
  import { navigation } from '$lib/config/navigation';
  import { goto } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';
  import NextSalahLogo from "$lib/assets/imgs/nextsalah-logo.png";
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  
  let isDarkMode = $state(false);
  let isMenuOpen = $state(false);
  let showScrollTop = $state(false);
  
  let isActive = $derived((path: string) => page.url.pathname === path);

  // Scroll to top handling
  function handleScroll() {
    showScrollTop = window.scrollY > window.innerHeight / 2;
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Theme toggle with localStorage persistence
  function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dim' : 'nord');
    localStorage.setItem('theme', isDarkMode ? 'dim' : 'nord');
  }

  // Initialize theme
  onMount(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      isDarkMode = savedTheme === 'dim';
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      isDarkMode = prefersDark;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dim' : 'nord');
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });
</script>

<nav class="fixed top-0 left-0 right-0 z-50">
  <div class="navbar bg-base-100/95 backdrop-blur-sm h-14">
    <!-- Logo Section -->
    <div class="flex-1">
      <button 
        class="btn btn-ghost gap-2" 
        onclick={() => goto('/controlpanel')}
      >
        <img src={NextSalahLogo} alt="NextSalah" class="h-8 w-8 md:h-10 md:w-10" />
        <span class="font-bold text-base md:text-xl">NextSalah</span>
      </button>
    </div>

    <!-- Desktop Navigation -->
    <div class="hidden md:flex gap-2 mr-4">
      {#each navigation.items as item}
        <button
          class="btn btn-ghost gap-2 {
            isActive(item.href) ? 'bg-base-200 text-primary' : ''
          }"
          onclick={() => goto(item.href)}
        >
          <item.icon size={20} />
          <span>{item.title}</span>
        </button>
      {/each}
    </div>

    <div class="flex-none">
      <!-- Theme Toggle -->
      <button 
        class="btn btn-ghost btn-circle"
        onclick={toggleTheme}
        aria-label="Toggle theme"
      >
        {#if isDarkMode}
          <svg class="h-6 w-6 fill-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
          </svg>
        {:else}
          <svg class="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
          </svg>
        {/if}
      </button>

      <!-- Mobile Menu Button (only visible on mobile) -->
      <button 
        class="btn btn-ghost btn-circle ml-2 md:hidden"
        onclick={() => isMenuOpen = !isMenuOpen}
        aria-label="Menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>
    </div>
  </div>
</nav>

{#if isMenuOpen}
  <div 
    class="fixed inset-0 z-40 md:hidden"
    transition:fade={{ duration: 200 }}
    onclick={(event) => { 
      if (event.target === event.currentTarget) isMenuOpen = false; 
    }}
  >
    <div class="absolute inset-0 bg-black/50"></div>
    
    <div 
      class="absolute right-0 top-0 h-full w-[85vw] max-w-sm bg-base-100"
      transition:fly={{ x: 300, duration: 300, opacity: 1 }}
    >
      <div class="flex flex-col h-full">
        <div class="p-4 flex justify-between items-center">
          <span class="text-lg font-semibold">Menu</span>
          <button 
            class="btn btn-ghost btn-sm btn-circle"
            onclick={() => isMenuOpen = false}
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto">
          <div class="p-4 space-y-2">
            {#each navigation.items as item}
              <button
                class="w-full btn btn-ghost justify-start gap-3 {
                  isActive(item.href) 
                    ? 'bg-primary/10 text-primary hover:bg-primary/20' 
                    : 'hover:bg-base-200'
                }"
                onclick={() => {
                  goto(item.href);
                  isMenuOpen = false;
                }}
              >
                <item.icon size={20} />
                <span>{item.title}</span>
              </button>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Scroll to Top Button -->
{#if showScrollTop}
  <button
    class="fixed bottom-6 right-6 btn btn-circle btn-primary shadow-lg"
    onclick={scrollToTop}
    transition:fade
    aria-label="Scroll to top"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  </button>
{/if}

<style>
  .overflow-y-auto {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .overflow-y-auto::-webkit-scrollbar {
    display: none;
  }
</style>