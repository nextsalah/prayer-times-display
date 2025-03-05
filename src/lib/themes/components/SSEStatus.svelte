<script lang="ts">
    import { onDestroy } from 'svelte';
    import { fade } from 'svelte/transition';
    
    // Props
    let { sseState } = $props();
    
    // Track visibility state and timeout
    let showActionText = $state(false);
    let actionTimeout: ReturnType<typeof setTimeout> | null = null;
    
    // Determine status color
    function getStatusColor(status: string): string {
        switch (status) {
            case 'online': return 'bg-green-500';
            case 'offline': return 'bg-red-500';
            case 'maintenance': return 'bg-orange-500';
            default: return 'bg-gray-500';
        }
    }
    
    // Determine if we should show text based on the last action
    function shouldShowText(action: string): boolean {
        return action.includes('reload') || 
               action.includes('update') || 
               sseState.connectionStatus !== 'online';
    }
    
    // Watch for changes to lastAction
    $effect(() => {
        if (sseState.lastAction) {
            // Clear any existing timeout
            if (actionTimeout) clearTimeout(actionTimeout);
            
            // Show the text
            showActionText = true;
            
            // Hide after 3 seconds
            actionTimeout = setTimeout(() => {
                showActionText = false;
            }, 3000);
        }
    });
    
    // Clean up timeout when component is destroyed
    onDestroy(() => {
        if (actionTimeout) clearTimeout(actionTimeout);
    });
</script>

<div class="fixed top-1 left-1 z-50 flex items-center">
    <div class={`w-2 h-2 rounded-full ${getStatusColor(sseState.connectionStatus)}`}></div>
    
    {#if sseState.lastAction && showActionText && shouldShowText(sseState.lastAction)}
        <span 
            transition:fade={{ duration: 150 }}
            class="ml-2 text-xs font-sans text-white bg-black/70 px-2 rounded">
            {sseState.lastAction}
        </span>
    {/if}
</div>