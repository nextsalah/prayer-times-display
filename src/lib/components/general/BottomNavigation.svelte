<script lang="ts">
  import { navigation } from '$lib/config/navigation';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  $: isActive = (path: string) => $page.url.pathname === path;
</script>

<div class="btm-nav btm-nav-lg bg-base-100 shadow-lg border-t border-base-200">
  {#each navigation.items as item}
    <button
      class="flex flex-col items-center gap-1 px-4 hover:bg-base-100 transition-colors {isActive(item.href) ? 'active text-primary' : 'text-base-content'}"
      on:click={() => goto(item.href)}
    >
      <div class="indicator">
        <img 
          src={item.icon} 
          alt={item.title}
          class="h-6 w-6"
          loading="lazy"
        />
      </div>
      <span class="btm-nav-label text-sm font-medium">{item.title}</span>
    </button>
  {/each}
</div>