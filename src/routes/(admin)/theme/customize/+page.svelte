<script lang="ts">
    import { Formly, type IField } from '@ismail424/svelte-formly';
    import { onMount } from 'svelte';

    let { data } = $props();
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
</script>

<div class="container mx-auto max-w-3xl">
    <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
            <div class="flex items-center justify-between mb-6">
                <h2 class="card-title flex gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Customize Theme
                </h2>
                <a href="/theme" class="btn btn-ghost">
                    Back to Themes
                </a>
            </div>

            {#if isLoaded}
                <div class="bg-base-200 rounded-box p-6">
                    <Formly 
                        {fields} 
                        form_name="theme-settings" 
                        on:submit={handleSubmit}
                        btnSubmit={{
                            text: 'Save Changes',
                            classes: ['btn', 'btn-primary', 'w-full', 'sm:w-auto']
                        }}
                    />
                </div>

                <div class="divider"></div>

                <div class="flex justify-between">
                    <a href="/theme" class="btn btn-ghost">
                        Cancel
                    </a>
                    <button 
                        class="btn btn-error"
                        onclick={() => window.location.href='/theme?reset=true'}
                    >
                        Reset to Defaults
                    </button>
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
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