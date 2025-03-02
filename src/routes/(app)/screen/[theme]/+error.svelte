<script>
  import { AlertCircle } from 'lucide-svelte';
</script>

<div class="min-h-screen flex items-center justify-center p-8 bg-base-100" role="alert">
  <div class="card w-96 bg-error/10 shadow-xl animate-fade-in-down">
    <div class="card-body items-center text-center">
      <div class="w-16 h-16 text-error animate-pulse">
        <AlertCircle class="w-full h-full" />
      </div>
      <h2 class="card-title text-error mt-4">Error</h2>
      <p class="text-base-content">Failed to load the page. Please try again later.</p>
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
</style>