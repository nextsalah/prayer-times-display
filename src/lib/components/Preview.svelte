<script lang="ts">
    interface PreviewProps {
        theme?: string;
    }
    
    let { theme = '' }: PreviewProps = $props();

    let previewUrl = $derived(theme === '' ? '/screen' : `/screen/${theme.toLowerCase()}`);
    let previewText = $derived(theme === '' ? 'Default Theme' : theme);
</script>

<div class="space-y-4">
    <div class="text-lg font-medium">
        {previewText} preview
        <p class="text-sm text-base-content/70 mt-1">View how your theme looks in different device orientations</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <!-- Landscape Preview (16:9) -->
        <div class="w-full">
            <div class="bg-base-200 rounded-lg p-3">
                <div class="flex items-center gap-2 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span class="font-medium text-sm">Landscape View</span>
                    <span class="text-xs text-base-content/70">(16:9)</span>
                </div>

                <!-- TV Frame -->
                <div class="relative">
                    <div class="bg-neutral-900 p-1 shadow-2xl">
                        <div class="relative w-full" style:aspect-ratio="16/9">
                            <iframe 
                                src={previewUrl}
                                title="Landscape Preview"
                                class="absolute inset-0 w-full h-full "
                                style="transform: scale(0.4); transform-origin: 0 0; width: 250%; height: 250%;"
                                scrolling="no"
                            ></iframe>
                            <!-- Screen Overlay Effects -->
                            <div class="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 rounded pointer-events-none"></div>
                            <div class="absolute inset-0 " style="box-shadow: inset 0 0 30px rgba(0,0,0,0.4);"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Portrait Preview (9:16) -->
        <div class="w-full">
            <div class="bg-base-200 rounded-lg p-3">
                <div class="flex items-center gap-2 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span class="font-medium text-sm">Portrait View</span>
                    <span class="text-xs text-base-content/70">(9:16)</span>
                </div>

                <!-- TV Frame -->
                <div class="relative">
                    <div class="bg-neutral-900 p-1 shadow-2xl">
                        <div class="relative w-full" style:aspect-ratio="9/16">
                            <iframe 
                                src={`${previewUrl}?view=portrait`}
                                title="Portrait Preview"
                                class="absolute inset-0 w-full h-full"
                                style="transform: scale(0.4); transform-origin: 0 0; width: 250%; height: 250%;"
                                scrolling="no"
                            ></iframe>
                            <!-- Screen Overlay Effects -->
                            <div class="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 rounded pointer-events-none"></div>
                            <div class="absolute inset-0 rounded" style="box-shadow: inset 0 0 30px rgba(0,0,0,0.4);"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>