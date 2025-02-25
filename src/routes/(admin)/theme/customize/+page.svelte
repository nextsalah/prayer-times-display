<script lang="ts">
    import type { IField } from '@ismail424/svelte-formly';
    import { Formly } from '@ismail424/svelte-formly';
    import { Settings, Brush } from 'lucide-svelte';
    import { onMount } from 'svelte';
    import type { FileMetadata } from '$themes/interfaces/types';

    let { data } = $props();
    
    let formFields: IField[] = $state([]);
    let isLoaded = $state(false);
    let isSubmitting = $state(false);
    let errors = $state<Record<string, string>>({});

    async function initializeFields() {
        // Clone the form definition to avoid mutations
        formFields = [...data.theme.customizationForm];
        
        // Initialize with user settings
        for (const field of formFields) {
            const userValue = data.userSettings[field.name];
            if (userValue !== undefined && userValue !== null) {
                if (field.type === 'file') {
                    try {
                        // Process file data
                        const files = [];
                        // Ensure userValue is an array of FileMetadata
                        const fileDataArray = Array.isArray(userValue) ? userValue : [];
                        for (const fileData of fileDataArray as FileMetadata[]) {
                            try {
                                if (!fileData.path) continue;

                                const response = await fetch(fileData.path);
                                if (!response.ok) throw new Error(`Failed to fetch: ${fileData.path}`);

                                files.push({
                                    name: fileData.name,
                                    size: fileData.size,
                                    type: fileData.type,
                                    url: fileData.path,
                                    isStoredFile: true,
                                    path: fileData.path,
                                    fileId: fileData.id || `${fileData.name}-${Date.now()}-${fileData.size}`
                                });
                            } catch (error) {
                                // Fallback image handling stays the same
                                // ...
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
        errors = {};
        
        const { detail } = event;
        if (!detail.valid) {
            isSubmitting = false;
            return;
        }
        
        // Remove special fields
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
            // Process form data
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

            const result = await response.json().catch(() => null);
            
            if (response.ok) {
                window.location.reload();
            } else {
                if (result?.errors) {
                    errors = result.errors;
                } else {
                    throw new Error(result?.message || 'Failed to save settings');
                }
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            // Show user-friendly error
            errors.general = error instanceof Error ? error.message : 'An unknown error occurred';
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
            
            {#if errors.general}
                <div class="alert alert-error mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{errors.general}</span>
                </div>
            {/if}
            
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
                <div class="flex justify-center p-10">
                    <span class="loading loading-spinner loading-lg"></span>
                </div>
            {/if}
        </div>
    </div>
</div>