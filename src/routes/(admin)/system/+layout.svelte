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

<div class="container mx-auto p-4 max-w-4xl">
    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <!-- Tab Navigation -->
            <div class="tabs tabs-bordered">
                {#each tabs as tab}
                    <a 
                        href={tab.href}
                        class="tab tab-lg gap-2 {$page.url.pathname.includes(tab.id) ? 'tab-active' : ''}"
                    >
                        <svelte:component this={tab.icon} class="h-5 w-5" />
                        {tab.label}
                    </a>
                {/each}
            </div>

            <!-- Tab Content -->
            <div class="pt-6">
                <slot />
            </div>
        </div>
    </div>
</div>