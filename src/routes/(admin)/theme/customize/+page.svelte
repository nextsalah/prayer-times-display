<script lang="ts">
    import type { FileMetadata } from '$themes/interfaces/types.js';
    import { Formly, type IField } from '@ismail424/svelte-formly';
    import { Settings, Brush } from 'lucide-svelte';
    import { onMount } from 'svelte';

    let { data } = $props();
    let formFields: IField[] = $state([]);
    let isLoaded = $state(false);
    let isSubmitting = $state(false);

    async function initializeFields() {
        let fields = [...data.theme.customizationForm];
        for (const field of fields) {
            const userValue = data.userSettings[field.name];
            if (userValue !== undefined && userValue !== null && userValue !== 'null') {
                if (field.type === 'file') {
                    try {
                        const files = [];
                        for (const fileData of userValue as FileMetadata[]) {
                            try {
                                if (!fileData.path) continue;

                                const response = await fetch(fileData.path);
                                if (!response.ok) throw new Error(`Failed to fetch: ${fileData.path}`);

                                const blob = await response.blob();
                                files.push({
                                    name: fileData.name,
                                    size: fileData.size,
                                    type: fileData.type,
                                    url: fileData.path,
                                    isStoredFile: true,
                                    path: fileData.path,
                                    fileId: fileData.id || `${fileData.name}-${Date.now()}-${fileData.size}`
                                });
                            } catch {
                                const fallbackResponse = await fetch('/no_image_available.png');
                                const fallbackBlob = await fallbackResponse.blob();
                                files.push({
                                    name: 'no_image_available.png',
                                    type: 'image/png',
                                    url: '/no_image_available.png',
                                    isStoredFile: true,
                                    path: '/no_image_available.png',
                                    fileId: `fallback-${Date.now()}`
                                });
                            }
                        }
                        field.value = files;
                    } catch (error) {
                        field.value = [];
                    }
                } else {
                    field.value = userValue;
                }
            }
        }
        formFields = fields;
        isLoaded = true;
    }

    onMount(() => {
        if (data.theme?.customizationForm) {
            initializeFields();
        } else {
            isLoaded = true;
        }
    });

    async function handleSubmit(event: CustomEvent<Record<string, unknown>>) { 
        if (isSubmitting) return;
        isSubmitting = true;
        
        const { detail } = event;
        if (!detail.valid) {
            isSubmitting = false;
            return;
        }
        if (Object.keys(detail).length <= 1) {
            isSubmitting = false;
            return;
        }

        const filteredDetail = Object.fromEntries(
            Object.entries(detail).filter(([key, value]) => 
                key !== 'touched' && key !== 'valid' && value !== undefined && value !== null
            )
        );

        if (Object.keys(filteredDetail).length === 0) {
            isSubmitting = false;
            return;
        }

        const formData = new FormData();
        try {
            for (const [key, value] of Object.entries(filteredDetail)) {
                if (Array.isArray(value)) {
                    // Handle file arrays
                    value.forEach((item: any) => {
                        if (item.blob) {
                            // This is a new file with a blob
                            formData.append(key, item.blob, item.name);
                        } else if (!item.isStoredFile && item instanceof File) {
                            // This is a direct File object
                            formData.append(key, item, item.name);
                        }
                        // Skip stored files as they don't need to be uploaded again
                    });
                } else if (value instanceof File) {
                    // Handle single file
                    formData.append(key, value, value.name);
                } else {
                    // Handle non-file values
                    formData.append(key, String(value));
                }
            }

            const response = await fetch('?/save', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                window.location.reload();
            } else {
                const errorResponse = await response.json().catch(() => null);
                throw new Error(errorResponse?.message || 'Failed to save settings');
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            // You might want to show an error message to the user here
        } finally {
            isSubmitting = false;
        }
    }

    function handleReset() {
        if (confirm('Are you sure you want to restore the default theme? All custom settings will be reset.')) {
            window.location.href = '?reset=true';
        }
    }
</script>

<div class="container mx-auto max-w-3xl">
    <div class="card bg-base-200 shadow-lg">
        <div class="card-body">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
                <h2 class="card-title flex items-center gap-3">
                    <Settings class="w-6 h-6" />
                    <span>Theme Customization</span>
                    <Brush class="w-5 h-5 text-primary" />
                </h2>
                <a href="/theme" class="btn btn-ghost btn-sm">
                    Back
                </a>
            </div>
            {#if isLoaded}
                <Formly 
                    fields={formFields}
                    form_name="theme-settings"
                    on:submit={handleSubmit}
                    btnSubmit={{ 
                        classes: [
                            'btn', 
                            'btn-primary',
                            'w-full', 
                            'mt-4', 
                            'mb-2',
                        ], 
                        text: isSubmitting ? 'Saving Changes...' : 'Apply Changes'
                    }}
                    btnReset={{ classes: ['hidden'] }}
                />

                <div class="divider"></div>

                <!-- Action Buttons -->
                <div class="flex flex-wrap justify-between items-center">
                    <a href="/theme" class="btn btn-ghost">
                        Cancel
                    </a>
                    <button 
                        class="btn btn-error btn-outline"
                        type="button"
                        onclick={handleReset}
                        disabled={isSubmitting}
                    >
                        Reset to Default
                    </button>
                </div>
            {:else}
                <div class="loading loading-lg"></div>
            {/if}
        </div>
    </div>
</div>