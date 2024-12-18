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
        <!-- Header -->
        <div class="text-center mb-8">
            <h1 class="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
                <Palette class="w-8 h-8" />
                Theme Manager
            </h1>
            <p class="text-base-content/70">Customize your prayertimes screen appearance and manage themes</p>
        </div>

        <!-- Active Theme Card -->
        <div class="card bg-base-100 shadow-lg rounded-lg">
            <div class="card-body p-6">
                <!-- Theme Info -->
                <div class="bg-base-200 rounded-lg p-4 mb-6">
                    <div class="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h2 class="text-2xl font-bold text-primary flex items-center gap-2">
                                <PaintBucket class="w-6 h-6" />
                                {data.currentThemeName}
                            </h2>
                            <p class="text-base-content/70 mt-1 max-w-md">{data.currentThemeDescription}</p>
                        </div>
                        <div class="flex flex-col gap-2 sm:flex-row w-full">
                            <button 
                                class="btn btn-outline gap-2 w-full sm:w-auto" 
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
                            {#if data.themes.length > 1}
                                <SwitchTheme 
                                    themes={data.themes}
                                    currentThemeName={data.currentThemeName}
                                />
                            {/if}
                        </div>
                    </div>
                </div>

                <!-- Theme Controls -->
                <div class="flex flex-col gap-6">
                    <!-- Action Buttons -->
                    <div class="flex flex-wrap gap-4">
                        <a 
                            href="/theme/customize" 
                            class="btn btn-primary gap-2 flex-1"
                            data-sveltekit-reload
                        >
                            <Settings2 class="w-5 h-5" />
                            Customize Theme Settings
                        </a>

                        {#if data.supportsFileUpload}
                            <a 
                                href="/theme/media" 
                                class="btn btn-secondary gap-2 flex-1"
                                data-sveltekit-reload
                            >
                                <Image class="w-5 h-5" />
                                Manage Theme Images
                            </a>
                        {/if}
                    </div>

                    <!-- Preview Section -->
                    {#if showPreview}
                        <div class="animate-in slide-in-from-top">
                            <div class="bg-base-100 rounded-lg p-3">
                                <Preview theme="" />
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>