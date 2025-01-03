<script lang="ts">
    import { Formly, type IField } from '@ismail424/svelte-formly';
    import { onMount } from 'svelte';
    import { Settings, Palette, Brush, RefreshCcw, Wand2, Zap } from 'lucide-svelte';

    let { data } = $props();
    let formFields: IField[] = $state([]);
    let isLoaded = $state(false);
    let isSubmitting = $state(false);
    let formly = $state<Formly | null>(null);
    
    onMount(() => {
        if (data.theme.customizationForm) {
            // Filter out file type fields and map the remaining ones
            formFields = data.theme.customizationForm
                .filter(field => field.type !== 'file') // Skip file fields
                .map(field => {
                    const userValue = data.userSettings?.[field.name];
                    if (userValue != null) {
                        field.value = userValue;
                    }
                    return field;
                });
            isLoaded = true;
        }
    });

    async function handleSubmit(event: CustomEvent<Record<string, unknown>>) { 
        if (isSubmitting) {
            return;
        }

        isSubmitting = true;
        const { detail } = event;
        
        if (!detail.valid || Object.keys(detail).length <= 1) {
            return;
        }

        // Create FormData from the form values
        const formData = new FormData();
        for (const [key, value] of Object.entries(detail)) {
            if (value != null && value !== '') {
                formData.append(key, value.toString());
            }
        }

        try {
            const response = await fetch('?/save', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                window.location.reload();
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (error) {
            console.error('Failed to save theme settings:', error);
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
                <!-- Form Section -->
                <Formly 
                    bind:this={formly}
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
                            'flex',
                            'items-center',
                            'gap-2'
                        ], 
                        text: 'Apply Changes' 
                    }}
                    btnReset={{ classes: ['hidden'] }}
                />

                <div class="divider"></div>

                <!-- Custom Buttons -->
                <div class="flex flex-wrap justify-between items-center">
                    <a href="/theme" class="btn btn-ghost flex items-center gap-2">
                        Cancel
                    </a>
                    <button 
                        class="btn btn-error btn-outline flex items-center gap-2"
                        type="button"
                        onclick={handleReset}
                    >
                        <RefreshCcw class="w-4 h-4" /> Reset to Default
                    </button>
                </div>
            {/if}
        </div>
    </div>
</div>