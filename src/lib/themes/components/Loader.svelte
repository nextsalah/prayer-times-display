<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  let reloadInterval: ReturnType<typeof setInterval> | null = null;
  
  onMount(() => {
    // Refresh the page every 30 seconds, but only when this component is mounted
    reloadInterval = setInterval(() => {
      window.location.reload();
    }, 30000);
    
    // Return the cleanup function for onMount (alternative to onDestroy)
    return () => {
      if (reloadInterval) {
        clearInterval(reloadInterval);
        reloadInterval = null;
      }
    };
  });

  // As a backup, also clear the interval when the component is destroyed
  onDestroy(() => {
    if (reloadInterval) {
      clearInterval(reloadInterval);
      reloadInterval = null;
    }
  });
</script>

<div class="min-h-screen flex flex-col items-center justify-center bg-base-100 p-4 pb-8">
  <span class="custom-spinner text-primary mb-spinner"></span>
  <p class="loading-text font-bold leading-relaxed pb-text">
    Loading<span class="dots"><span>.</span><span>.</span><span>.</span></span>
  </p>
  <p class="text-center text-base-content/70 message-text">
     Content is loading. Please wait a moment.
  </p>
</div>

<style>
  .custom-spinner {
    width: 12vh;
    height: 12vh;
    border: 1.6vh solid rgba(var(--p), 0.2);
    border-radius: 50%;
    border-top: 1.6vh solid hsl(var(--p));
    animation: spin 1s linear infinite;
  }

  .mb-spinner {
    margin-bottom: 3vh;
  }

  .loading-text {
    font-size: 6vw;
  }

  .pb-text {
    padding-bottom: 0.2vh;
  }

  .message-text {
    font-size: 3vw;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .dots span {
    opacity: 0;
    animation: dots 1.5s infinite;
  }
  
  .dots span:nth-child(1) {
    animation-delay: 0s;
  }
  
  .dots span:nth-child(2) {
    animation-delay: 0.5s;
  }
  
  .dots span:nth-child(3) {
    animation-delay: 1s;
  }
  
  @keyframes dots {
    0% { opacity: 0; }
    50% { opacity: 1; }
    100% { opacity: 0; }
  }

  /* Add responsive adjustments for different screen orientations */
  @media (orientation: landscape) {
    .loading-text {
      font-size: 4vh;
    }
    
    .message-text {
      font-size: 2vh;
    }
  }
</style>