<!-- src/routes/(app)/screen/[theme]/+error.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { AlertCircle, RefreshCw, Home } from 'lucide-svelte';
  import { onMount } from 'svelte';

  // Extract error details from the page store
  $: error = $page.error;
  $: status = $page.status;

  // Define error message based on status code
  $: errorMessage = getErrorMessage(status, error?.message);

  // refresh timer until it will refresh the page
  let refreshTimer: ReturnType<typeof setTimeout>;
  let secondsLeft = 20;
  let autoRefresh = true;

  // Get detailed message based on error type
  function getErrorMessage(status: number, message?: string): string {
    switch(status) {
      case 404:
        if (message?.includes('Theme')) {
          return message;
        }
        return 'The requested theme could not be found.';
      case 500:
        if (message?.includes('Failed to load')) {
          return message;
        }
        return 'A server error occurred while loading the prayer times data.';
      default:
        return message || 'An unexpected error occurred.';
    }
  }
  
  // Determine what action to suggest based on error
  $: actionSuggestion = status === 404 
    ? 'Please check the theme name and try again.'
    : 'Try refreshing the page or return to the dashboard.';

  // Refresh the page
  function refreshPage() {
    window.location.reload();
  }
  
  // Go to home page
  function goToHome() {
    window.location.href = '/';
  }
  
  // Toggle auto refresh
  function toggleAutoRefresh() {
    autoRefresh = !autoRefresh;
    if (autoRefresh) {
      refreshTimer = setTimeout(refreshPage, secondsLeft * 1000);
    } else {
      clearTimeout(refreshTimer);
    }
  }
  
  // Start a timer to refresh the page after 20 seconds
  onMount(() => {
    if (autoRefresh) {
      refreshTimer = setTimeout(refreshPage, 20000);
    }
    
    // Update seconds counter
    const countdownInterval = setInterval(() => {
      if (autoRefresh) {
        secondsLeft -= 1;
        if (secondsLeft <= 0) {
          clearInterval(countdownInterval);
        }
      }
    }, 1000);

    return () => {
      clearTimeout(refreshTimer);
      clearInterval(countdownInterval);
    };
  });
</script>

<div class="min-h-screen flex items-center justify-center p-8 bg-base-100" role="alert">
  <div class="card w-96 bg-error/10 shadow-xl animate-fade-in-down">
    <div class="card-body items-center text-center">
      <div class="w-16 h-16 text-error animate-pulse">
        <AlertCircle class="w-full h-full" />
      </div>
      <h2 class="card-title text-error mt-4">Error {status}</h2>
      <p class="text-base-content mb-2">{errorMessage}</p>
      <p class="text-sm text-base-content/70 mb-4">{actionSuggestion}</p>
      
      <div class="card-actions justify-center gap-2 mt-2">
        <button class="btn btn-primary btn-sm" on:click={refreshPage}>
          <RefreshCw class="w-4 h-4 mr-2" />
          {autoRefresh ? `Refreshing in (${secondsLeft}s)` : 'Refresh Now'}
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  @keyframes fade-in-down {
    from {
      transform: translateY(-1rem);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  :global(.animate-fade-in-down) {
    animation: fade-in-down 0.3s ease-out;
  }

  :global(.animate-pulse) {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
</style>