<script lang="ts">
    import type { IField } from '@ismail424/svelte-formly';
    import { Formly } from '@ismail424/svelte-formly';
    import { Settings, Brush } from 'lucide-svelte';
    import { onMount } from 'svelte';
    import toast from 'svelte-french-toast';
    import type { FileMetadata } from '$lib/themes/interfaces/types.js';
    let { data } = $props();
    
    let formFields: IField[] = $state([]);
    let isLoaded = $state(false);
    let isSubmitting = $state(false);
    let errors = $state<Record<string, string>>({});
    let originalValues = $state<Record<string, any>>({});

    async function initializeFields() {
        // Clone the form definition to avoid mutations
        formFields = [...data.theme.customizationForm];
        
        // Initialize with user settings and capture original values
        for (const field of formFields) {
            const userValue = data.userSettings[field.name];
            if (userValue !== undefined && userValue !== null) {
                if (field.type === 'file') {
                    try {
                        const files = [];
                        const fileDataArray = Array.isArray(userValue) ? userValue : [];
                        
                        for (const fileData of fileDataArray as FileMetadata[]) {
                            files.push({
                                name: fileData.name,
                                size: fileData.size,
                                type: fileData.type ,
                                isStoredFile: true,
                                fileId: fileData.id,
                                previewUrl: `/api/files/${fileData.id}`
                            }); 
                        }
                        
                        field.value = files;
                        originalValues[field.name] = [...files]; // Store a copy of the files array
                    } catch (error) {
                        console.error('Error setting up file field:', error);
                        field.value = [];
                        originalValues[field.name] = [];
                    }
                } else {
                    field.value = userValue;
                    originalValues[field.name] = userValue; // Store original value
                }
            } else {
                originalValues[field.name] = field.value; // Store default value
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
            toast.error("Please fix the form errors before submitting");
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
            toast.error("No valid data to save");
            return;
        }

        const formData = new FormData();
        try {
            toast.promise(
                (async () => {
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
                        // Small delay before reload to let the toast appear
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                        return result;
                    } else {
                        if (result?.errors) {
                            errors = result.errors;
                        }
                        throw new Error(result?.message || 'Failed to save settings');
                    }
                })(),
                {
                    loading: 'Saving theme settings...',
                    success: 'Theme settings saved successfully!',
                    error: (err) => err.message || 'Failed to save settings',
                },
                {
                    duration: 3000
                }
            );
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
            // Submit a form to the reset action instead of changing the URL
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '?/reset';
            document.body.appendChild(form);
            form.submit();
            toast.success("Resetting theme to defaults...");
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