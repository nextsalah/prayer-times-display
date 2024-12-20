<!-- src/routes/+error.svelte -->
<script>
    import { page } from '$app/stores';
</script>

<div class="min-h-screen bg-base-300 flex items-center justify-center p-4">
    <div class="max-w-4xl w-full flex flex-col-reverse md:flex-row items-center justify-center gap-8">
        <!-- Error Content -->
        <div class="text-center md:text-left space-y-6 w-full md:w-1/2">
            <div class="space-y-2">
                <h1 class="text-5xl md:text-7xl font-bold text-primary">
                    {$page.status}
                </h1>
                <p class="text-xl md:text-2xl text-base-content/80">
                    {$page.error?.message || 'Page not found'}
                </p>
            </div>
            
            <div class="flex flex-wrap gap-4 justify-center md:justify-start">
                <a href="/" class="btn btn-primary">
                    Return Home
                </a>
                <button 
                    onclick={() => window.history.back()} 
                    class="btn btn-outline"
                >
                    Go Back
                </button>
            </div>
        </div>

        <!-- Animated SVG -->
        <div class="w-full md:w-1/2 relative">
            <svg 
                viewBox="0 0 837 1045" 
                class="w-full h-auto max-w-md mx-auto" 
                xmlns="http://www.w3.org/2000/svg"
            >
                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <path d="M353,9 L626.664028,170 L626.664028,487 L353,642 L79.3359724,487 L79.3359724,170 L353,9 Z" 
                        class="stroke-primary animate-float" stroke-width="6" />
                    <path d="M78.5,529 L147,569.186414 L147,648.311216 L78.5,687 L10,648.311216 L10,569.186414 L78.5,529 Z" 
                        class="stroke-error animate-float-delay-2" stroke-width="6" />
                    <path d="M773,186 L827,217.538705 L827,279.636651 L773,310 L719,279.636651 L719,217.538705 L773,186 Z" 
                        class="stroke-secondary animate-float-delay-4" stroke-width="6" />
                    <path d="M639,529 L773,607.846761 L773,763.091627 L639,839 L505,763.091627 L505,607.846761 L639,529 Z" 
                        class="stroke-accent animate-float-delay-6" stroke-width="6" />
                    <path d="M281,801 L383,861.025276 L383,979.21169 L281,1037 L179,979.21169 L179,861.025276 L281,801 Z" 
                        class="stroke-success animate-float-delay-8" stroke-width="6" />
                </g>
            </svg>
        </div>
    </div>
</div>

<style lang="postcss">
    @keyframes float {
        100% {
            transform: translateY(20px);
        }
    }

    .animate-float {
        animation: float 1s infinite ease-in-out alternate;
    }

    .animate-float-delay-2 {
        animation: float 1s infinite ease-in-out alternate;
        animation-delay: 0.2s;
    }

    .animate-float-delay-4 {
        animation: float 1s infinite ease-in-out alternate;
        animation-delay: 0.4s;
    }

    .animate-float-delay-6 {
        animation: float 1s infinite ease-in-out alternate;
        animation-delay: 0.6s;
    }

    .animate-float-delay-8 {
        animation: float 1s infinite ease-in-out alternate;
        animation-delay: 0.8s;
    }
</style>