<!-- NavigationMenu.svelte -->
<script lang="ts">
    import { Motion } from "svelte-motion";
    import { navigation } from '$lib/config/navigation';
    import { ChevronRight } from "lucide-svelte";
    import { browser } from '$app/environment';

    let isMobile = browser ? window.innerWidth < 768 : false;

    const cardVariants = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        hover: {
            scale: 1.01,
            transition: { duration: 0.2 }
        },
        tap: {
            scale: 0.99,
            transition: { duration: 0.1 }
        }
    };

    if (browser) {
        window.addEventListener('resize', () => {
            isMobile = window.innerWidth < 768;
        });
    }
</script>

<div class="min-h-screen bg-base-100">
    <div class="p-4 md:p-6 max-w-4xl mx-auto">
        <!-- Header Section -->
        <header class="mb-8 text-center">
            <h1 class="text-2xl md:text-3xl font-bold text-base-content mb-2">
                Prayer Times Display
            </h1>
            <p class="text-base-content/90 max-w-xl mx-auto text-sm md:text-base">
                Configure your prayer times display settings
            </p>
        </header>

        <!-- Navigation Grid -->
        <div class="grid gap-3 md:grid-cols-2">
            {#each navigation.items as section}
                <Motion
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                    whileTap="tap"
                    let:motion
                >
                    <a
                        href={section.href}
                        class="group block bg-base-200/80 hover:bg-base-300 
                               rounded-lg border border-base-300 
                               transition-all duration-200"
                        use:motion
                    >
                        <div class="p-4">
                            <div class="flex items-start gap-3">
                                <!-- Icon with enhanced background -->
                                <div class="p-2.5 rounded-lg {section.color} bg-opacity-25 shrink-0">
                                    <svelte:component 
                                        this={section.icon} 
                                        size={24}
                                        class="text-base-content"
                                    />
                                </div>

                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center justify-between">
                                        <div class="font-medium text-base-content text-lg">
                                            {isMobile ? section.mobileTitle : section.title}
                                        </div>
                                        <ChevronRight 
                                            size={18}
                                            class="text-base-content/70 group-hover:text-base-content/90 
                                                   transition-colors duration-200" 
                                        />
                                    </div>
                                    <div class="text-sm text-base-content/80 mt-0.5">
                                        {section.description}
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Enhanced Sub-items -->
                            {#if section.subItems && section.subItems.length > 0}
                                <div class="mt-3 ml-11">
                                    <div class="flex flex-wrap gap-1.5">
                                        {#each section.subItems as subItem}
                                            <span class="text-xs px-2 py-1 
                                                       bg-base-content/15 
                                                       text-base-content 
                                                       rounded-md">
                                                {subItem}
                                            </span>
                                        {/each}
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </a>
                </Motion>
            {/each}
        </div>

        <!-- Preview Button -->
        <div class="mt-8 flex justify-center">
            <a 
                href="/screen" 
                class="btn btn-primary btn-md normal-case px-8
                       hover:scale-[1.02] active:scale-[0.98] 
                       transition-transform duration-200"
            >
                Preview Display
            </a>
        </div>
    </div>
</div>

<style>
    /* Enhanced focus visibility */
    a:focus-visible {
        outline: 2px solid hsl(var(--p));
        outline-offset: 2px;
    }
</style>