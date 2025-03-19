<script lang="ts">
    import Preview from '$lib/components/Preview.svelte';
    import SwitchTheme from '$lib/components/SwitchTheme.svelte';
    import { 
        PaintBucket, 
        Settings2, 
        Maximize2, 
        Minimize2,
        QrCode,
        RefreshCw,
        EyeOff,
        Palette,
        ChevronRight
    } from 'lucide-svelte';
    import toast from 'svelte-french-toast';
    import { sseBroadcaster } from '$lib/sse/broadcaster';

    let { data } = $props();
    let showPreview = $state(true);
    let qrCodeEnabled = $state(data.settings.qrCodeEnabled);

    function reloadAllScreens() {
        sseBroadcaster.reloadAllScreens();
        toast.success("All screens refreshed", {
            position: "bottom-center"
        });
    }
</script>

<div class="p-4 rounded-lg bg-base-200/30">
    <div class="container mx-auto max-w-5xl">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Column 1: Main controls -->
            <div class="md:col-span-2 grid grid-cols-1 gap-6">
                <!-- Header with theme switcher -->
                <div class="card bg-base-100 shadow-xl border border-base-200">
                    <div class="card-body p-6">
                        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div class="flex items-center gap-3">
                                <div class="bg-primary/10 p-2 rounded-full">
                                    <PaintBucket class="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h1 class="text-2xl font-bold">{data.currentTheme.name}</h1>
                                    <p class="text-sm text-base-content/70">{data.currentTheme.description}</p>
                                </div>
                            </div>
                            
                            {#if data.availableThemes.length > 1}
                                <div class="flex-shrink-0">
                                    <SwitchTheme 
                                        themes={data.availableThemes}
                                        currentThemeName={data.currentTheme.name}
                                    />
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>

                <!-- Customize Theme Button (Enhanced) -->
                <div class="card bg-gradient-to-br from-primary/5 to-secondary/5 shadow-xl border-2 border-primary/20 relative overflow-hidden">
                    <div class="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-primary/10 blur-2xl"></div>
                    <div class="card-body p-6 relative z-10">
                        <h2 class="card-title flex items-center gap-3 mb-2">
                            <div class="bg-primary/20 p-1.5 rounded-lg">
                                <Palette class="w-6 h-6 text-primary" />
                            </div>
                            <span class="text-xl font-bold">Theme Customization</span>
                        </h2>
                        
                        <p class="text-base-content/80 mb-4">
                            Personalize colors, fonts, and appearance settings for your dashboard
                        </p>
                        
                        <a 
                            href="/theme/customize" 
                            class="btn btn-primary btn-lg w-full gap-3 justify-between shadow-md hover:shadow-lg transition-all hover:translate-y-[-2px] hover:scale-[1.01] duration-300"
                        >
                            <div class="flex items-center gap-2">
                                <Settings2 class="w-5 h-5" />
                                <span class="font-bold text-lg">Customize Theme</span>
                            </div>
                            <ChevronRight class="w-5 h-5" />
                        </a>
                        
                        <div class="mt-2 flex items-center justify-center">
                            <span class="badge badge-primary badge-outline py-3">Most Used Feature</span>
                        </div>
                    </div>
                </div>

                <!-- System Controls Card -->
                <div class="card bg-base-100 shadow-lg border border-base-200 hover:shadow-xl transition-shadow">
                    <div class="card-body p-5">
                        <h2 class="card-title flex items-center gap-2 text-lg mb-3">
                            <div class="bg-info/10 p-1.5 rounded-lg">
                                <RefreshCw class="w-5 h-5 text-info" />
                            </div>
                            System Controls
                        </h2>
                        <div class="mt-2">
                            <button 
                                class="btn btn-outline btn-info md:btn-wide hover:scale-[1.02] transition-transform" 
                                onclick={reloadAllScreens}
                            >
                                <RefreshCw class="w-4 h-4 mr-2" />
                                Refresh All Screens
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Column 2: Secondary controls and preview -->
            <div class="grid grid-cols-1 gap-6">
                <!-- Global Settings Card -->
                <div class="card bg-base-100 shadow-lg border border-base-200 hover:shadow-xl transition-shadow">
                    <div class="card-body p-5">
                        <h2 class="card-title flex items-center gap-2 text-lg mb-3">
                            <div class="bg-accent/10 p-1.5 rounded-lg">
                                <Settings2 class="w-5 h-5 text-accent" />
                            </div>
                            General Settings
                        </h2>
                        <div class="mt-2 space-y-4">
                            <!-- QR Code Setting -->
                            <label class="cursor-pointer flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors border border-base-300">
                                <div class="flex items-center gap-2">
                                    <QrCode class="w-5 h-5  {qrCodeEnabled ? 'text-primary' : 'text-base-content/70'}" />
                                    <span class="label-text font-medium {qrCodeEnabled ? 'text-primary' : 'text-base-content/70'}">Show QR Code on Login Page</span>
                                </div>
                                <input 
                                    type="checkbox" 
                                    class={`toggle ${qrCodeEnabled ? 'toggle-primary' : 'toggle-secondary'}`}
                                    checked={qrCodeEnabled}
                                    onchange={async (e) => {
                                        qrCodeEnabled = e.currentTarget.checked;
                                        try {
                                            await fetch('?/toggleQrCode', {
                                                method: 'POST',
                                                body: new URLSearchParams({
                                                    qrCodeEnabled: e.currentTarget.checked.toString()
                                                })
                                            });
                                            toast.success("QR Code setting updated", {
                                                position: "bottom-center"
                                            });
                                        } catch (error) {
                                            toast.error("Failed to update QR Code setting");
                                        }
                                    }}
                                />
                            </label>

                            <!-- Anti-Distraction Setting (Coming Soon) -->
                            <div class="flex items-center justify-between gap-3 p-3 rounded-lg bg-base-200/50 border border-base-300">
                                <div class="flex items-center gap-2">
                                    <EyeOff class="w-5 h-5 text-base-content/70" />
                                    <div>
                                        <span class="label-text font-medium">Anti-Distraction Mode</span>
                                        <span class="ml-2 badge badge-sm">Coming Soon</span>
                                    </div>
                                </div>
                                <input 
                                    type="checkbox" 
                                    class="toggle toggle-neutral opacity-50"
                                    disabled
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Preview Card (Improved) -->
                <div class="card bg-base-100 shadow-md border border-base-200 hover:shadow-lg transition-shadow">
                    <div class="card-body p-5">
                        <div class="flex justify-between items-center mb-2">
                            <h2 class="card-title text-lg flex items-center gap-2">
                                <div class="bg-secondary/10 p-1.5 rounded-lg">
                                    <Maximize2 class="w-5 h-5 text-secondary" />
                                </div>
                                Theme Preview
                            </h2>
                            <button 
                                class="btn btn-sm btn-ghost hover:bg-base-200" 
                                onclick={() => showPreview = !showPreview}
                            >
                                {#if showPreview}
                                    <Minimize2 class="w-4 h-4" />
                                    <span class="ml-1">Hide</span>
                                {:else}
                                    <Maximize2 class="w-4 h-4" />
                                    <span class="ml-1">Show</span>
                                {/if}
                            </button>
                        </div>
                        
                        {#if showPreview}
                            <div class="animate-in fade-in duration-300 mt-2">
                                <div class="bg-base-200 rounded-lg p-4 shadow-inner">
                                    <Preview theme={data.currentTheme.value} />
                                </div>
                            </div>
                        {:else}
                            <div class="flex flex-col items-center justify-center py-6 text-center text-base-content/50">
                                <p class="text-sm">Click "Show" to preview the current theme appearance</p>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>