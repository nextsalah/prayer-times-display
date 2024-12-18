<script lang="ts">
    import { XCircle, ArrowRight } from 'lucide-svelte';
    import Preview from '$lib/components/Preview.svelte';
    import type { AllThemesType } from '$themes/interfaces/types';
    
    interface Theme {
        name: string;
        description: string;
    }
    
    interface SwitchThemeProps {
        themes: AllThemesType;
        currentThemeName: string;
    }
    
    let { themes, currentThemeName }: SwitchThemeProps = $props();
    let selectedTheme = $state('');
    let selectedThemeData = $state<Theme | null>(null);
    
    function handleThemeChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        selectedTheme = select.value;
        selectedThemeData = themes.find(t => t.name === selectedTheme) ?? null;
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
    
    <!-- Trigger Button -->
    <label for="change_theme_modal" class="btn btn-outline gap-2">
        Change Theme
        <ArrowRight class="w-4 h-4" />
    </label>
    
    <!-- Modal -->
    <input type="checkbox" id="change_theme_modal" class="modal-toggle" />
    <div class="modal">
        <div class="modal-box max-w-4xl">
            <div class="flex justify-between items-center mb-6">
                <h3 class="font-bold text-2xl">Available Themes</h3>
                <label for="change_theme_modal" class="btn btn-sm btn-circle btn-ghost">
                    <XCircle class="w-5 h-5" />
                </label>
            </div>
            
            <form 
                method="POST"
                action="/theme?/select"
                class="space-y-6"
                onsubmit={handleThemeSubmit}
            >
                <select 
                    id="theme-select"
                    name="theme_folder"
                    class="select select-lg select-bordered w-full"
                    value={selectedTheme}
                    onchange={handleThemeChange}
                >
                    <option value="">Select a theme...</option>
                    {#each themes.filter(t => t.name !== currentThemeName) as theme}
                        <option value={theme.name}>{theme.name}</option>
                    {/each}
                </select>
    
                {#if selectedThemeData}
                    <div class="divider">Theme Preview</div>
                    
                    <div class="bg-base-200 rounded-lg p-4">
                        <h4 class="font-semibold text-lg mb-2">{selectedThemeData.name}</h4>
                        <p class="text-base-content/70 mb-4">{selectedThemeData.description}</p>
                        <Preview theme={selectedTheme} />
                    </div>
    
                    <div class="modal-action flex justify-between">
                        <label for="change_theme_modal" class="btn btn-ghost gap-2">
                            <XCircle class="w-4 h-4" /> Cancel
                        </label>
                        <button type="submit" class="btn btn-primary gap-2">
                            Apply {selectedThemeData.name}
                            <ArrowRight class="w-4 h-4" />
                        </button>
                    </div>
                {/if}
            </form>
        </div>
    </div>