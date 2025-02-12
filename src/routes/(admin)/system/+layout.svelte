<script lang="ts">
    import { page } from '$app/stores';
    import { Clock, RefreshCw } from 'lucide-svelte';
    
    const tabs = [
        {
            icon: Clock,
            label: 'Time & Date',
            href: '/system/time',
            id: 'time'
        },
        {
            icon: RefreshCw,
            label: 'Version & Updates',
            href: '/system/version',
            id: 'version'
        }
    ];
</script>

<div class="container mx-auto px-2 sm:px-6 py-4 sm:py-6 max-w-4xl">
    <div class="bg-base-100 rounded-xl shadow-xl">
        <div class="flex flex-col sm:flex-row">
            {#each tabs as tab}
                <a 
                    href={tab.href}
                    data-sveltekit-preload-data
                    class="
                        flex-1 flex items-center justify-center gap-3
                        px-6 py-6 sm:py-8
                        text-lg font-medium
                        border-b sm:border-b-4 border-transparent
                        {$page.url.pathname.includes(tab.id) 
                            ? 'bg-base-200 text-primary border-primary' 
                            : 'text-base-content/80 hover:bg-base-200 hover:text-primary hover:border-base-300'}
                        transition-all duration-200
                    "
                >
                    <svelte:component this={tab.icon} class="h-6 w-6 sm:h-7 sm:w-7" />
                    <span>{tab.label}</span>
                </a>
            {/each}
        </div>

        <div class="p-4 sm:p-8">
            <slot />
        </div>
    </div>
</div>