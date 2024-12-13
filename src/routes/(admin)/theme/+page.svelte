<script lang="ts">
    import { Formly, type IField } from '@ismail424/svelte-formly';
    import { onMount } from 'svelte';

    let { data } = $props();

    let selectedTheme = $state('');
    let fields: IField[] = $state([]);
    let isLoaded = $state(false);
    
    onMount(async () => {
        if (data.themeTemplate) {
            fields = data.themeTemplate.map(field => {
                if (data.customSettings && field.name in data.customSettings) {
                    if (field.type === 'file') {
                        loadFiles(field, data.customSettings[field.name]);
                    } else {
                        field.value = data.customSettings[field.name];
                    }
                }
                return field;
            });
        }
        isLoaded = true;
    });

    async function loadFiles(field: IField, files: any[]) {
        try {
            const loadedFiles = await Promise.all(files.map(async (file) => {
                const response = await fetch(file.url);
                const blob = await response.blob();
                return new File([blob], file.name, { type: file.type });
            }));
            field.value = loadedFiles;
        } catch (error) {
            console.error('Failed to load files:', error);
        }
    }

    async function handleSubmit({ detail }: any) {
        if (!detail.valid || Object.keys(detail).length <= 1) {
            return;
        }

        const formData = new FormData();
        for (const [key, value] of Object.entries(detail)) {
            if (Array.isArray(value)) {
                value.forEach((file: File) => formData.append(key, file));
            } else {
                formData.append(key, value as string);
            }
        }

        const response = await fetch('/theme?/save', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            window.location.reload();
        }
    }

    async function handleThemeSelect(event: SubmitEvent) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const response = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form)
        });

        if (response.ok) {
            window.location.reload();
        }
    }
</script>

<div class="container mx-auto p-4 max-w-4xl">
    <div class="card bg-base-300 shadow-xl">
        <div class="card-body">
            <!-- Header -->
            <h2 class="card-title text-2xl mb-6">Theme Customization</h2>

            <!-- Theme Selection Section -->
            <div class="bg-base-200 rounded-box p-6 mb-8">
                <div class="flex items-center gap-2 mb-4">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    <h3 class="text-lg font-semibold">Theme Selection</h3>
                </div>

                <div class="stats shadow mb-4 w-full">
                    <div class="stat">
                        <div class="stat-title">Current Theme</div>
                        <div class="stat-value text-primary text-2xl">
                            {data.themes.find(t => t.name === data.currentThemeName)?.name}
                        </div>
                    </div>
                </div>

                {#if data.themes.length > 1}
                    <form 
                        method="POST"
                        action="/theme?/select"
                        class="flex flex-col sm:flex-row gap-4"
                        onsubmit={handleThemeSelect}
                    >
                        <div class="flex-1">
                            <select 
                                name="theme_folder"
                                class="select select-bordered w-full"
                                bind:value={selectedTheme}
                                required 
                            >
                                <option value="">Select a theme...</option>
                                {#each data.themes.filter(t => t.name !== data.currentThemeName) as theme}
                                    <option value={theme.value}>{theme.name}</option>
                                {/each}
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Apply Theme
                        </button>
                    </form>
                {/if}
            </div>

            <!-- Theme Settings Section -->
            <div class="divider"></div>
            
            <div class="mb-4">
                <div class="flex items-center gap-2 mb-6">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <h3 class="text-lg font-semibold">Theme Settings</h3>
                </div>

                {#if isLoaded}
                    <div class="bg-base-200 rounded-box p-6">
                        <Formly 
                            {fields} 
                            form_name="theme-settings" 
                            on:submit={handleSubmit}
                            btnSubmit={{
                                text: 'Save Changes',
                                classes: ['btn', 'btn-primary', 'gap-2']
                            }}
                        />

                        <div class="divider"></div>

                        <div class="flex justify-end">
                            <button 
                                class="btn btn-error gap-2"
                                onclick={() => window.location.href='/theme?reset=true'}
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Reset to Defaults
                            </button>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    /* Custom styles for Formly integration with DaisyUI */
    :global(.formly-form input:not([type="file"])) {
        @apply input input-bordered w-full;
    }
    
    :global(.formly-form select) {
        @apply select select-bordered w-full;
    }
    
    :global(.formly-form textarea) {
        @apply textarea textarea-bordered w-full;
    }

    :global(.formly-form label) {
        @apply label label-text;
    }

    :global(.invalid-feedback) {
        @apply text-error text-sm mt-1;
    }
</style>