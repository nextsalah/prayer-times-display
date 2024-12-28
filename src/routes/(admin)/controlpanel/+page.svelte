<!-- NavigationMenu.svelte -->
<script lang="ts">
    import { Motion } from "svelte-motion";
    import { navigation } from '$lib/config/navigation';
    import { ChevronRight } from "lucide-svelte";
    import { browser } from '$app/environment';

    // Check if we're on mobile
    let isMobile = browser ? window.innerWidth < 768 : false;

    // Different variants for mobile and desktop
    const cardVariants = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        hover: isMobile ? {
            // Subtle animation for mobile
            scale: 0.99,
            transition: { duration: 0.1 }
        } : {
            // More pronounced for desktop
            scale: 1.02,
            transition: { duration: 0.2 }
        },
        tap: isMobile ? {
            // Very subtle for mobile
            scale: 0.98,
            transition: { duration: 0.1 }
        } : {
            scale: 0.98
        }
    };

    // Update on window resize
    if (browser) {
        window.addEventListener('resize', () => {
            isMobile = window.innerWidth < 768;
        });
    }
</script>

<div class="p-4 max-w-2xl mx-auto">
    <div class="grid gap-3">
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
                    href="/{section.slug}"
                    class="block bg-base-200/90 hover:bg-base-300 transition-colors duration-150 
                           rounded-xl overflow-hidden border border-base-300/50 
                           active:translate-y-[1px] md:active:translate-y-[2px]"
                    use:motion
                >
                    <div class="p-4 flex items-center gap-4">
                        <!-- Icon with stronger background -->
                        <div class="p-3 rounded-xl {section.color} bg-opacity-25">
                            <svelte:component 
                                this={section.icon} 
                                size={26}
                                class="text-base-content"
                            />
                        </div>

                        <!-- Content with stronger contrast text -->
                        <div class="flex-1 min-w-0">
                            <div class="font-semibold text-base-content/90 text-lg">
                                {section.title}
                            </div>
                            <div class="text-sm text-base-content/70 mt-0.5">
                                {section.description}
                            </div>
                        </div>

                        <!-- Chevron with better visibility -->
                        <ChevronRight 
                            size={20}
                            class="text-base-content/70" 
                        />
                    </div>
                </a>
            </Motion>
        {/each}
    </div>
</div>

<style>
    /* Enhanced focus visibility */
    a:focus-visible {
        outline: 2px solid hsl(var(--p));
        outline-offset: 2px;
    }

    /* Conditional shadows based on device capability */
    @media (hover: hover) {
        a {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        a:hover {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
    }

    /* Remove transition delay on mobile */
    @media (max-width: 768px) {
        a {
            transition: none;
        }
    }
</style>