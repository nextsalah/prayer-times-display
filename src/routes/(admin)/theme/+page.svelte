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

<div class="p-4 rounded-lg">
    <div class="container mx-auto max-w-5xl">
        <div class="grid grid-cols-1 gap-6">
            <!-- Header with theme switcher -->
            <div class="card bg-base-100 shadow-md border border-base-200">
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

            <!-- Customize Theme Button (Clearly a button) -->
            <div class="card bg-base-100 shadow-md border border-base-200">
                <div class="card-body p-5">
                    <h2 class="card-title flex items-center gap-2 mb-4">
                        <Palette class="w-5 h-5 text-primary" />
                        Theme Customization
                    </h2>
                    
                    <a 
                        href="/theme/customize" 
                        class="btn btn-primary btn-lg w-full gap-2 justify-between"
                    >
                        <div class="flex items-center gap-2">
                            <Settings2 class="w-5 h-5" />
                            <span class="font-bold">Customize Theme</span>
                        </div>
                        <ChevronRight class="w-5 h-5 opacity-70" />
                    </a>
                    <p class="text-sm text-base-content/70 mt-2">
                        Personalize colors, fonts, and appearance settings for your dashboard
                    </p>
                </div>
            </div>

            <!-- Main content area -->
            <div class="grid grid-cols-1 gap-6">
                <!-- System Controls Card -->
                <div class="card bg-base-100 shadow-md border border-base-200">
                    <div class="card-body p-5">
                        <h2 class="card-title flex items-center gap-2 text-lg">
                            <RefreshCw class="w-5 h-5 text-primary" />
                            System Controls
                        </h2>
                        <div class="mt-3">
                            <button 
                                class="btn btn-outline md:btn-wide" 
                                onclick={reloadAllScreens}
                            >
                                <RefreshCw class="w-4 h-4 mr-2" />
                                Refresh All Screens
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Global Settings Card -->
                <div class="card bg-base-100 shadow-md border border-base-200">
                    <div class="card-body p-5">
                        <h2 class="card-title flex items-center gap-2 text-lg">
                            <Settings2 class="w-5 h-5 text-primary" />
                            General Settings
                        </h2>
                        <div class="mt-4 space-y-4">
                            <!-- QR Code Setting -->
                            <label class="cursor-pointer flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors border border-base-300">
                                <div class="flex items-center gap-2">
                                    <QrCode class="w-5 h-5 text-primary" />
                                    <span class="label-text font-medium">Show QR Code on Login Page</span>
                                </div>
                                <input 
                                    type="checkbox" 
                                    class={`toggle ${qrCodeEnabled ? 'toggle-success' : 'toggle-error'}`}
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

                <!-- Preview Card (De-emphasized) -->
                <div class="card bg-base-100 shadow-sm border border-base-200">
                    <div class="card-body p-5">
                        <div class="flex justify-between items-center">
                            <h2 class="card-title text-lg flex items-center gap-2">
                                <Maximize2 class="w-5 h-5 text-base-content/70" />
                                Theme Preview
                            </h2>
                            <button 
                                class="btn btn-sm btn-ghost" 
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
                            <div class="animate-in fade-in duration-300 mt-4">
                                <div class="bg-base-200 rounded-lg p-4">
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