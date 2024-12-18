<script lang="ts">
    import Preview from '$lib/components/Preview.svelte';

    let { data } = $props();
    let selectedTheme = $state('');
    let selectedThemeData = $state<typeof data.themes[0] | null>(null);

    function handleThemeChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        selectedTheme = select.value;
        selectedThemeData = data.themes.find(t => t.name === selectedTheme) || null;
    }

    async function handleThemeSubmit(event: SubmitEvent) {
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

<div class="container mx-auto max-w-6xl p-4">
    <!-- Header Section -->
    <div class="mb-6">
        <h1 class="text-2xl font-bold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            Theme Manager
        </h1>
    </div>

    <!-- Current Theme Card -->
    <div class="card bg-base-300 shadow-xl">
        <div class="card-body p-6">
            <!-- Theme Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 class="text-2xl font-bold text-primary">{data.currentThemeName}</h2>
                    <p class="text-base-content/70 mt-1">{data.currentThemeDescription}</p>
                </div>
                {#if data.themes.length > 1}
                    <label for="change_theme_modal" class="btn btn-outline no-animation">
                        Switch Theme
                    </label>
                {/if}
            </div>

            <div class="grid lg:grid-cols-2 gap-8">
                <!-- Left: Actions -->
                <div class="space-y-4">
                    <h3 class="font-semibold text-lg mb-4">Theme Settings</h3>
                    <div class="grid gap-4">
                        <a 
                            href="/theme/customize" 
                            class="card bg-base-100 hover:bg-base-300 transition-colors p-4 no-underline group"
                            data-sveltekit-reload
                        >
                            <div class="flex items-start gap-3">
                                <div class="p-2  bg-primary rounded-lg text-primary-content">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24"  stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 class="font-semibold group-hover:text-primary transition-colors">Customize Theme</h3>
                                    <p class="text-sm text-base-content/70">Adjust colors, fonts, and other theme settings</p>
                                </div>
                            </div>
                        </a>

                        {#if data.supportsFileUpload}
                            <a 
                                href="/theme/media" 
                                class="card bg-base-100 hover:bg-base-300 transition-colors p-4 no-underline group"
                                data-sveltekit-reload
                            >
                                <div class="flex items-start gap-3">
                                    <div class="p-2 bg-secondary rounded-lg text-secondary-content">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 class="font-semibold group-hover:text-secondary transition-colors">Manage Images</h3>
                                        <p class="text-sm text-base-content/70">Upload and organize theme images</p>
                                    </div>
                                </div>
                            </a>
                        {/if}
                    </div>
                </div>

                <!-- Right: Preview -->
                <div>
                    <div class="bg-base-100 rounded-lg p-3">
                        <Preview theme="" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Theme Change Modal -->
{#if data.themes.length > 1}
    <input type="checkbox" id="change_theme_modal" class="modal-toggle" />
    <div class="modal">
        <div class="modal-box max-w-4xl">
            <h3 class="font-bold text-lg mb-6">Switch Theme</h3>
            
            <form 
                method="POST"
                action="/theme?/select"
                class="space-y-6"
                onsubmit={handleThemeSubmit}
            >
                <div class="form-control">
                    <label class="label" for="theme-select">
                        <span class="label-text">Select a new theme from the list below</span>
                    </label>
                    <select 
                        id="theme-select"
                        name="theme_folder"
                        class="select select-bordered w-full"
                        value={selectedTheme}
                        onchange={handleThemeChange}
                        required 
                    >
                        <option selected value="">Choose a theme...</option>
                        {#each data.themes.filter(t => t.name !== data.currentThemeName) as theme}
                            <option value={theme.name}>{theme.name}</option>
                        {/each}
                    </select>
                </div>

                {#if selectedThemeData}
                    <div class="alert alert-info">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h4 class="font-semibold">{selectedThemeData.name}</h4>
                            <p class="text-sm">{selectedThemeData.description}</p>
                        </div>
                    </div>

                    <div class="bg-base-200 rounded-lg p-3">
                        <Preview theme={selectedTheme} />
                    </div>

                    <div class="modal-action justify-between">
                        <label for="change_theme_modal" class="btn btn-ghost">Cancel</label>
                        <button type="submit" class="btn btn-primary">
                            Apply {selectedThemeData.name}
                        </button>
                    </div>
                {/if}
            </form>
        </div>
    </div>
{/if}