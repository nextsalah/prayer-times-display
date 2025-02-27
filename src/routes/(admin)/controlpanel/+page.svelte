<!-- Control Panel Dashboard -->
<script lang="ts">
    import { navigation } from '$lib/config/navigation';
    import { Monitor, ArrowRight, RefreshCw, Palette, MoreHorizontal, Calendar, Clock, CheckCircle } from "lucide-svelte";
    import { browser } from '$app/environment';

    let isMobile = $state(browser ? window.innerWidth < 768 : false);
    let showActions = $state(false);

    function toggleActions() {
        showActions = !showActions;
    }

    if (browser) {
        window.addEventListener('resize', () => {
            isMobile = window.innerWidth < 768;
        });
    }
</script>

<div class="min-h-screen bg-base-100">
    <!-- Preview section with minimal design -->
    <div class="bg-base-200 pt-8 pb-10 px-4">
        <div class="max-w-3xl mx-auto">
            <div class="flex justify-between items-center mb-6">
                <h1 class="text-xl md:text-2xl font-bold">Control Panel</h1>
                
                <!-- Fixed dropdown menu for actions - positioned with better z-index -->
                <div class="dropdown dropdown-end z-30">
                    <button class="btn btn-sm btn-ghost">
                        <MoreHorizontal size={20} />
                    </button>
                    <ul class="dropdown-content z-30 menu p-2 shadow bg-base-100 rounded-box w-52">
                        <li>
                            <a href="/screen" target="_blank" rel="noopener" class="flex items-center gap-2">
                                <Monitor size={16} />
                                <span>Open Display</span>
                            </a>
                        </li>
                        <li>
                            <a href="/theme" class="flex items-center gap-2">
                                <Palette size={16} />
                                <span>Change Theme</span>
                            </a>
                        </li>
                        <li>
                            <button class="flex items-center gap-2">
                                <RefreshCw size={16} />
                                <span>Refresh Data</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
            
              <!-- Screen preview with subtle dual-color backlight glow effect -->
            <div class="max-w-lg mx-auto mb-6 relative">
              <!-- Primary color backlight (left side) -->
              <div class="absolute -top-1 -left-1 w-2/3 h-full bg-primary/40 blur-lg"></div>
              <!-- Secondary color backlight (right side) - using blue tone -->
              <div class="absolute -bottom-1 -right-1 w-2/3 h-full bg-blue-500/40 blur-lg"></div>
              
              <div class="aspect-[16/9] rounded-lg shadow-lg relative overflow-hidden border border-base-300 bg-neutral-950">
                  <!-- Actual content area with scaled iframe -->
                  <div class="absolute inset-0 overflow-hidden rounded-lg bg-base-100 z-10">
                      <iframe 
                          src="/screen" 
                          title="Prayer Times Display" 
                          class="w-full h-full border-0 scale-[0.6] origin-top-left"
                          style="width: 166.7%; height: 166.7%; overflow: hidden;"
                          scrolling="no"
                      ></iframe>
                  </div>
              </div>
          </div>
            
            
            <!-- Simplified status indicator -->
            <div class="max-w-lg mx-auto bg-base-100 rounded-lg shadow-md border border-base-200 p-4">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                        <div class="badge badge-lg badge-success gap-1">
                            <CheckCircle size={12} />
                            Active
                        </div>
                    </div>
                    
                    <div class="flex gap-2">
                        <button class="btn btn-sm btn-ghost btn-circle" title="Refresh">
                            <RefreshCw size={16} />
                        </button>
                        <a href="/theme" class="btn btn-sm btn-ghost btn-circle" title="Change Theme">
                            <Palette size={16} />
                        </a>
                    </div>
                </div>
                
                <!-- Current settings with icons - simplified -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="flex flex-col items-center gap-1 p-2 rounded-lg bg-base-200/50">
                        <Palette size={16} class="text-primary" />
                        <div class="text-[10px] text-base-content/70">Theme</div>
                        <div class="font-medium text-xs">Light Green</div>
                    </div>
                    <div class="flex flex-col items-center gap-1 p-2 rounded-lg bg-base-200/50">
                        <Calendar size={16} class="text-primary" />
                        <div class="text-[10px] text-base-content/70">Prayer Source</div>
                        <div class="font-medium text-xs">Muslim Pro</div>
                    </div>
                    <div class="flex flex-col items-center gap-1 p-2 rounded-lg bg-base-200/50">
                        <!-- Using inline SVG for Globe -->
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                        <div class="text-[10px] text-base-content/70">Language</div>
                        <div class="font-medium text-xs">English</div>
                    </div>
                    <div class="flex flex-col items-center gap-1 p-2 rounded-lg bg-base-200/50">
                        <Monitor size={16} class="text-primary" />
                        <div class="text-[10px] text-base-content/70">Orientation</div>
                        <div class="font-medium text-xs">Portrait</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
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
                                                <div class="badge {section.color.replace('bg-', 'badge-')} badge-sm text-xs font-medium">
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

    /* Hide scrollbars on iframe */
    iframe {
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none;  /* IE and Edge */
    }
    iframe::-webkit-scrollbar {
        display: none; /* Chrome, Safari and Opera */
    }
</style>