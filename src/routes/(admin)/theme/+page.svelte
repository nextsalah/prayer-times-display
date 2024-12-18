<script lang="ts">
    import Preview from '$lib/components/Preview.svelte';
    import SwitchTheme from '$lib/components/SwitchTheme.svelte';
    import { Palette, Image, MonitorSmartphone, XCircle, PaintBucket, Settings2, Maximize2, Minimize2 } from 'lucide-svelte';

    let { data } = $props();
    let showPreview = $state(false);

    function togglePreview() {
        showPreview = !showPreview;
    }
</script>

<div class="bg-base-300 p-4 rounded-lg">
    <div class="container mx-auto max-w-5xl">
        <div class="card bg-base-100 shadow-lg rounded-lg">
            <div class="card-body p-6">
                <!-- Current Theme Info -->
                <div class="bg-base-200 rounded-lg p-4 mb-6">
                    <div class="flex items-center gap-3 mb-2">
                        <PaintBucket class="w-6 h-6 text-primary" />
                        <h2 class="text-2xl font-bold">{data.currentThemeName}</h2>
                    </div>
                    <p class="text-base-content/70">{data.currentThemeDescription}</p>
                </div>

                <!-- Actions Grid -->
                <div class="grid gap-4 mb-6" class:grid-cols-2={data.supportsFileUpload}>
                    <a 
                        href="/theme/customize" 
                        class="btn btn-primary h-auto py-4 normal-case justify-start gap-4"
                        data-sveltekit-reload
                    >
                        <Settings2 class="w-5 h-5" />
                        <div class="text-left">
                            <div class="font-medium">Customize Theme</div>
                            <div class="text-xs opacity-90">Adjust theme settings</div>
                        </div>
                    </a>

                    {#if data.supportsFileUpload}
                        <a 
                            href="/theme/media" 
                            class="btn btn-secondary h-auto py-4 normal-case justify-start gap-4"
                            data-sveltekit-reload
                        >
                            <Image class="w-5 h-5" />
                            <div class="text-left">
                                <div class="font-medium">Media Library</div>
                                <div class="text-xs opacity-90">Manage theme images</div>
                            </div>
                        </a>
                    {/if}
                </div>

                <!-- Theme Controls -->
                <div class="flex flex-col sm:flex-row gap-3 items-stretch">
                    {#if data.themes.length > 1}
                        <SwitchTheme 
                            themes={data.themes}
                            currentThemeName={data.currentThemeName}
                        />
                    {/if}
                    <button 
                        class="btn btn-outline gap-2" 
                        onclick={togglePreview}
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

                <!-- Preview Section -->
                {#if showPreview}
                    <div class="animate-in slide-in-from-top mt-6">
                        <div class="bg-base-200 rounded-lg p-3">
                            <Preview theme="" />
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>