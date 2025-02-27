<script lang="ts">
    import { ChevronLeft } from "lucide-svelte";
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { fade } from 'svelte/transition';
  
    // Show back button on any page except the index
    const showBackButton = $derived($page.url.pathname !== '/prayertimes');
  
    function goBack() {
        goto('/prayertimes');
    }
    let props = $props();
</script>

{#if showBackButton}
    <button 
        on:click={goBack} 
        class="mb-4 text-base-content/50 hover:text-base-content flex items-center gap-1.5 text-sm transition-colors duration-200"
        transition:fade={{ duration: 150 }}
    >
        <ChevronLeft size={16} />
        <span>Back</span>
    </button>
{/if}

{@render props.children()}