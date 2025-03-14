<script lang="ts">
    import Preview from '$lib/components/Preview.svelte';
    import SwitchTheme from '$lib/components/SwitchTheme.svelte';
    import { 
        PaintBucket, 
        Settings2, 
        Maximize2, 
        Minimize2,
        QrCode
    } from 'lucide-svelte';
    import toast from 'svelte-french-toast';

    let { data } = $props();
    let showPreview = $state(false);
    let qrCodeEnabled = $state(data.settings.qrCodeEnabled);
</script>

<div class="p-4 rounded-lg">
    <div class="container mx-auto max-w-5xl">
        <div class="card bg-base-100 shadow-lg border border-base-200">
            <div class="card-body p-6">
                <!-- Theme Information -->
                <div class="bg-base-100 rounded-lg p-4 mb-6">
                    <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div class="flex flex-col gap-4 w-full sm:w-auto">
                            <div class="flex items-center gap-3">
                                <PaintBucket class="w-6 h-6 text-primary" />
                                <h2 class="text-2xl font-bold">
                                    {data.currentTheme.name}
                                </h2>
                            </div>
                            <p class="text-base-content/70">
                                {data.currentTheme.description}
                            </p>
                        </div>
                        
                        {#if data.availableThemes.length > 1}
                            <div class="flex-shrink-0 w-full sm:w-auto">
                                <SwitchTheme 
                                    themes={data.availableThemes}
                                    currentThemeName={data.currentTheme.name}
                                />
                            </div>
                        {/if}
                    </div>
                </div>

                <!-- QR Code Setting -->
                <div class="bg-base-200 rounded-lg p-4 mb-4">
                    <div class="flex items-center gap-3">
                        <QrCode class="w-5 h-5 text-primary" />
                        <h3 class="font-medium">QR Code Settings</h3>
                    </div>
                    
                    <div class="mt-3">
                        <div class="flex items-center">
                            <label class="cursor-pointer flex items-center gap-3">
                                <input 
                                    type="checkbox" 
                                    class="toggle toggle-primary" 
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
                                <span>Show QR Code on Login Page</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Theme Actions -->
                <div class="flex flex-col sm:flex-row gap-3 items-stretch">
                    <a 
                        href="/theme/customize" 
                        class="btn btn-primary gap-2"
                    >
                        <Settings2 class="w-4 h-4" />
                        Customize Theme
                    </a>

                    <button 
                        class="btn btn-outline gap-2" 
                        onclick={() => showPreview = !showPreview}
                        class:btn-primary={showPreview}
                    >
                        {#if showPreview}
                            <Minimize2 class="w-4 h-4" />
                            Hide Preview
                        {:else}
                            <Maximize2 class="w-4 h-4" />
                            Show Preview
                        {/if}
                    </button>
                </div>

                <!-- Theme Preview -->
                {#if showPreview}
                    <div class="animate-in slide-in-from-top mt-6">
                        <div class="bg-base-200 rounded-lg p-3">
                            <Preview theme={data.currentTheme.value} />
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>