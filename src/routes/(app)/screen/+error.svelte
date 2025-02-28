<script>
    import { AlertCircle } from 'lucide-svelte';
  </script>
  
  <div class="error-container" role="alert">
    <div class="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
      <div class="flex items-center gap-2">
        <AlertCircle class="h-5 w-5" />
        <h2 class="text-lg font-semibold leading-none tracking-tight">Error</h2>
      </div>
      <div class="mt-2 text-base">
        <p>Failed to load the page. Please try again later.</p>
      </div>
    </div>
  </div>
  
  <style>
    .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
    }
  
    :global(.error-container) {
      --destructive: 0 84.2% 60.2%;
      --destructive-foreground: 0 0% 98%;
    }
  </style>