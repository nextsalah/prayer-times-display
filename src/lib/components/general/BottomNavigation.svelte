<!-- Mobile Bottom Navigation -->
<script lang="ts">
    import { page } from '$app/stores';
    import { navigation } from '$lib/config/navigation';
    import { browser } from '$app/environment';
    import { Motion } from 'svelte-motion';
    
    export let showOnHomePage = false; // Option to show on home/control panel

    let isMobile = browser ? window.innerWidth < 768 : false;
    
    const navVariants = {
        hidden: { y: 100, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30
            }
        },
        exit: { y: 100, opacity: 0 }
    };
    
    // Check if we should show the navigation
    $: isHomePage = $page.url.pathname === '/controlpanel';
    $: showNav = !isHomePage || (isHomePage && showOnHomePage);
    
    // Find the active item
    $: activeSlug = navigation.items.find(item => 
        $page.url.pathname.includes(item.slug)
    )?.slug || '';
    
    if (browser) {
        window.addEventListener('resize', () => {
            isMobile = window.innerWidth < 768;
        });
    }
</script>

{#if showNav}
    <Motion 
        variants={navVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        let:motion
    >
        <div 
            class="fixed bottom-0 left-0 right-0 bg-base-100 shadow-lg border-t border-base-300 z-50"
            use:motion
        >
            <div class="max-w-md mx-auto px-1">
                <nav class="flex justify-between items-stretch">
                    {#each navigation.items as item}
                        <a
                            href={item.href}
                            class="flex flex-col items-center justify-center py-3 px-1 flex-1 transition-colors {activeSlug === item.slug ? 'text-primary' : 'text-base-content/60'}"
                            aria-current={activeSlug === item.slug ? 'page' : undefined}
                        >
                            <div 
                                class="rounded-full p-1.5 mb-1 {activeSlug === item.slug ? 'bg-primary/10' : ''}"
                            >
                                <svelte:component 
                                    this={item.icon} 
                                    size={isMobile ? 20 : 22}
                                    class={activeSlug === item.slug ? 'text-primary' : 'text-base-content/60'}
                                />
                            </div>
                            <span class="text-xs text-center w-full truncate px-1">
                                { item.title}
                            </span>
                        </a>
                    {/each}
                </nav>
            </div>
        </div>
    </Motion>
{/if}

<style>
    /* Ensure consistent height for navigation items */
    nav a {
        min-height: 64px;
    }
    
    /* Force text centering */
    nav a span {
        display: block;
        text-align: center;
        line-height: 1.2;
    }
</style>