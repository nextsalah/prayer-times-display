<script lang="ts">
    import { navigation } from '$lib/config/navigation';
    import { ArrowRight } from "lucide-svelte";
</script>

<div class="min-h-screen bg-base-100">
    <main class="max-w-3xl mx-auto px-4 py-6 pb-16">
        <!-- Settings cards with enhanced design -->
        <div>
            <h2 class="font-medium text-lg mb-3">Settings</h2>
            <div class="grid grid-cols-1 gap-4 mb-6">
                {#each navigation.items as section}
                    <a 
                        href={section.href}
                        class="group relative bg-base-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-base-200"
                    >
                        <!-- Color accent line -->
                        <div class="absolute left-0 top-0 bottom-0 w-1.5 {section.color}"></div>
                        
                        <div class="p-4 pl-6">
                            <div class="flex items-center gap-4">
                                <div class="rounded-full p-3 {section.color} bg-opacity-20">
                                    <section.icon size={24} class="text-primar text-opacity-70" />
                                </div>
                                
                                <div class="flex-1">
                                    <div class="flex items-center justify-between">
                                        <h2 class="text-lg font-medium">
                                            {section.title}
                                        </h2>
                                        <ArrowRight 
                                            size={16} 
                                            class="text-base-content/30 group-hover:text-primary transition-all duration-300 transform group-hover:translate-x-1" 
                                        />
                                    </div>
                                    <p class="text-sm text-base-content/70 mt-1">
                                        {section.description}
                                    </p>
                                    
                                    <!-- Enhanced tag chips -->
                                    {#if section.subItems?.length}
                                        <div class="flex flex-wrap gap-2 mt-3">
                                            {#each section.subItems as item}
                                                <div class="badge badge-outline badge-soft {section.badgeColor} badge-sm text-xs font-medium">
                                                    {item}
                                                </div>
                                            {/each}
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    </a>
                {/each}
            </div>
        </div>
    </main>
</div>

<style>
    a:focus-visible {
        outline: 2px solid hsl(var(--p));
        outline-offset: 2px;
    }
</style>