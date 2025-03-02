<script lang="ts">
  import { page } from '$app/stores';
  import { AlertCircle, RefreshCw } from 'lucide-svelte';
  import { onMount } from 'svelte';

  // Extract error details from the page store
  $: error = $page.error;
  $: status = $page.status;

  // Define error message based on status code
  $: errorMessage = getErrorMessage(status, error?.message);

  // refresh timer until it will refresh the page
  let refreshTimer: ReturnType<typeof setTimeout>;
  let secondsLeft: number = 20;

  // Get helpful message based on error type
  function getErrorMessage(status: number, message?: string): string {
    switch(status) {
      case 404:
        return message || 'The requested theme could not be found.';
      case 500:
        return message || 'A server error occurred. Please try again later.';
      default:
        return message || 'An unexpected error occurred.';
    }
  }
  
  // Determine what action to suggest based on error
  $: actionSuggestion = status === 404 
    ? 'Please check the theme name and try again.'
    : 'It will automatically refresh in 10 seconds.';

  // Refresh the page
  function refreshPage() {
    window.location.reload();
  }
  
  // Start a timer to refresh the page after 20 seconds
  onMount(() => {
    refreshTimer = setTimeout(refreshPage, 20000);
    
    // Update seconds counter
    const countdownInterval = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) clearInterval(countdownInterval);
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
      
      <div class="card-actions justify-center mt-2">
        <button class="btn btn-primary btn-sm" on:click={refreshPage}>
          <RefreshCw class="w-4 h-4 mr-2" />
          Refreshing in ({secondsLeft}s)
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