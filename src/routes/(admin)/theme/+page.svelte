<script lang="ts">
    import Preview from '$lib/components/Preview.svelte';
    import SwitchTheme from '$lib/components/SwitchTheme.svelte';
    import { 
        PaintBucket, 
        Settings2, 
        Image, 
        Maximize2, 
        Minimize2 
    } from 'lucide-svelte';

    let { data } = $props();
    let showPreview = $state(false);
</script>

<div class="p-4 rounded-lg">
    <div class="container mx-auto max-w-5xl">
        <div class="card bg-base-300 shadow-lg border border-base-200">
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
                <!-- Theme Actions -->
                    <div class="grid gap-4 mb-6" class:grid-cols-2={data.supportsFileUpload}>
                        <a 
                            href="/theme/customize" 
                            class="bg-base-100 hover:bg-base-200 transition-all duration-200 rounded-lg p-4 flex items-center gap-4 border border-base-200"
                            data-sveltekit-reload
                        >
                            <div class="p-2.5 rounded-lg bg-primary/10">
                                <Settings2 class="w-5 h-5 text-primary" />
                            </div>
                            <div class="text-left">
                                <div class="font-medium text-base-content">Customize Theme</div>
                                <div class="text-sm text-base-content/70">Adjust theme settings</div>
                            </div>
                        </a>

                        {#if data.supportsFileUpload}
                            <a 
                                href="/theme/media" 
                                class="bg-base-100 hover:bg-base-200 transition-all duration-200 rounded-lg p-4 flex items-center gap-4 border border-base-200"
                                data-sveltekit-reload
                            >
                                <div class="p-2.5 rounded-lg bg-base-content/10">
                                    <Image class="w-5 h-5 text-base-content" />
                                </div>
                                <div class="text-left">
                                    <div class="font-medium text-base-content">Media Library</div>
                                    <div class="text-sm text-base-content/70">Manage theme images</div>
                                </div>
                            </a>
                        {/if}
                    </div>

                <!-- Preview Controls -->
                <div class="flex flex-col sm:flex-row gap-3 items-stretch">
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