<script lang="ts">
  import { navigation } from '$lib/config/navigation';
  import { page } from '$app/stores';
  import {goto} from '$app/navigation';
</script>

<div class="btm-nav">
  {#each navigation.items as nav_item}
    <button class="text-primary" class:active={ $page.data.title === nav_item.title }
      onclick={() => goto(nav_item.href)}
    >
      <img src={nav_item.icon} alt={nav_item.title} class="h-5 w-5" />
    <span class="btm-nav-label">{nav_item.title}</span>  
    </button>
  {/each}
</div>
  
