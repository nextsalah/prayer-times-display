<script lang="ts">
    import { Sunrise, Clock, ChevronRight } from "lucide-svelte";
    import { Motion } from "svelte-motion";
    import { browser } from '$app/environment';

    let isMobile = browser ? window.innerWidth < 768 : false;

    const cards = [
        {
            title: "Prayer Times Source",
            description: "Configure the source for fetching prayer times",
            icon: Sunrise, // Changed from Globe to Sunrise
            color: "bg-primary",
            href: "/prayertimes/sources",
            items: ["Primary Source", "API Key", "Update Interval"]
        },
        {
            title: "Prayer Detail Settings",
            description: "Set detailed configurations including iqamah times",
            icon: Clock,
            color: "bg-secondary",
            href: "/prayertimes/config/fajr",
            items: ["Iqamah Time", "Prayer Adjustments", "Notification Options"]
        },
    ];

    const cardVariants = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        hover: {
            scale: 1.02,
            transition: { duration: 0.2 }
        },
        tap: {
            scale: 0.98,
            transition: { duration: 0.1 }
        }
    };

    if (browser) {
        window.addEventListener('resize', () => {
            isMobile = window.innerWidth < 768;
        });
    }
</script>

<div class="container mx-auto p-4 max-w-4xl">
    <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
            <h2 class="card-title mb-4 flex items-center gap-2">
                <Sunrise class="h-6 w-6" /> <!-- Updated header icon to Sunrise -->
                Prayer Settings
            </h2>
            <p class="text-base-content/70 mb-6">
                Configure prayer time sources and detailed prayer settings
            </p>

            <div class="grid gap-4 mt-4">
                {#each cards as card, i}
                    <Motion
                        variants={cardVariants}
                        initial="initial"
                        animate="animate"
                        whileHover="hover"
                        whileTap="tap"
                        transition={{ delay: i * 0.05 }}
                        let:motion
                    >
                        <a 
                            href={card.href} 
                            class="group block bg-base-200 hover:bg-base-300 rounded-lg transition-colors duration-200"
                            use:motion
                        >
                            <div class="p-4 flex items-start gap-4">
                                <div class="p-2.5 rounded-lg {card.color} bg-opacity-25 shrink-0">
                                    <svelte:component 
                                        this={card.icon} 
                                        size={isMobile ? 20 : 24}
                                        class="text-base-content"
                                    />
                                </div>
                                
                                <div class="flex-1">
                                    <div class="flex items-center justify-between">
                                        <h3 class="font-medium text-base-content">{card.title}</h3>
                                        <ChevronRight 
                                            size={18}
                                            class="text-base-content/60 group-hover:text-base-content/90 transition-colors duration-200" 
                                        />
                                    </div>
                                    <p class="text-sm text-base-content/70 mt-1">{card.description}</p>
                                    
                                    {#if card.items && card.items.length > 0}
                                        <div class="mt-3">
                                            <div class="flex flex-wrap gap-1.5">
                                                {#each card.items as item}
                                                    <span class="text-xs px-2 py-1 bg-base-content/10 text-base-content/80 rounded-md">
                                                        {item}
                                                    </span>
                                                {/each}
                                            </div>
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        </a>
                    </Motion>
                {/each}
            </div>
            
            <div class="mt-6 text-center">
                <a href="/controlpanel" class="btn btn-outline btn-sm">
                    Back to Control Panel
                </a>
            </div>
        </div>
    </div>
</div>

<style>
    a:focus-visible {
        outline: 2px solid hsl(var(--p));
        outline-offset: 2px;
    }
</style>
