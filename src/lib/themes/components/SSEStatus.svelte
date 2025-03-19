<script lang="ts">
    import { onDestroy } from 'svelte';
    import { fade } from 'svelte/transition';
    
    // Define proper type for SSE state
    interface SSEState {
        connectionStatus: 'unknown' | 'connected' | 'disconnected' | 'error';
        lastUpdateTime: string;
        lastAction: string;
    }
    
    // Props with proper typing
    let { sseState } = $props<{ sseState: SSEState }>();
    
    // Track visibility state and timeout
    let showActionText = $state(false);
    let actionTimeout: ReturnType<typeof setTimeout> | null = null;
    
    // Determine status color based on actual status values
    function getStatusColor(status: SSEState['connectionStatus']): string {
        switch (status) {
            case 'connected': return 'bg-green-500';
            case 'disconnected': return 'bg-red-500';
            case 'error': return 'bg-orange-500';
            case 'unknown':
            default: return 'bg-gray-500';
        }
    }
    
    // Determine if we should show text based on the last action
    function shouldShowText(action: string): boolean {
        return action.includes('reload') || 
               action.includes('update') || 
               sseState.connectionStatus !== 'connected';
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

<div class="sse-status-container">
    <div class={`status-circle ${getStatusColor(sseState.connectionStatus)}`}></div>
    
    {#if sseState.lastAction && showActionText && shouldShowText(sseState.lastAction)}
        <span 
            transition:fade={{ duration: 150 }}
            class="status-text">
            {sseState.lastAction}
        </span>
    {/if}
</div>

<style>
    .sse-status-container {
        position: fixed;
        top: 0.5vh;
        left: 0.5vw;
        z-index: 50;
        display: flex;
        align-items: center;
    }
    
    .status-circle {
        width: 1vw;
        height: 1vw;
        border-radius: 50%;
    }
    
    .status-text {
        margin-left: 0.5vw;
        font-size: 1.5vw;
        color: white;
        background-color: rgba(0, 0, 0, 0.7);
        padding: 0.2vh 0.6vw;
        border-radius: 0.3vw;
    }
    
    /* Responsive adjustments for different orientations */
    @media (orientation: landscape) {
        .status-circle {
            width: 0.8vh;
            height: 0.8vh;
        }
        
        .status-text {
            margin-left: 0.5vh;
            font-size: 1.2vh;
            padding: 0.2vh 0.6vh;
            border-radius: 0.3vh;
        }
    }
    
</style>