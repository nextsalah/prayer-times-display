<script>
    import { ChevronLeft } from "lucide-svelte";
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { fade } from 'svelte/transition';
    
    // Get the props
    let { children } = $props();
    
    // Using runes for reactive state
    let showBackButton = $derived(page.url.pathname !== '/prayertimes');
    
    function goBack() {
        goto('/prayertimes');
    }
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

{@render children()}