<script lang="ts">
    import { Clock, RefreshCw } from 'lucide-svelte';

    const sections = [
        {
            icon: Clock,
            title: 'Time & Date Settings',
            description: 'Configure system time, date formats and timezone settings',
            href: '/system/time'
        },
        {
            icon: RefreshCw,
            title: 'Version & Updates',
            description: 'Manage system updates, versions and security settings',
            href: '/system/version'
        }
    ];
</script>

<div class="grid md:grid-cols-2 gap-4">
    {#each sections as section}
        <a 
            href={section.href}
            class="card bg-base-100 hover:bg-base-200 transition-colors border border-base-300"
        >
            <div class="card-body">
                <h2 class="card-title">
                    <svelte:component this={section.icon} class="h-6 w-6" />
                    {section.title}
                </h2>
                <p class="text-base-content/70">{section.description}</p>
            </div>
        </a>
    {/each}
</div>