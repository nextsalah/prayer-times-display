<script lang="ts">
     import { XCircle, ArrowRight, RefreshCcwIcon } from 'lucide-svelte';
    import Preview from '$lib/components/Preview.svelte';
    import type { ThemeList } from '$lib/themes/interfaces/types';
    
    interface Theme {
        name: string;
        description: string;
    }
    
    interface SwitchThemeProps {
        themes: ThemeList,
        currentThemeName: string;
    }
    
    let { themes, currentThemeName }: SwitchThemeProps = $props();
    let selectedTheme = $state('');
    let selectedThemeData = $state<Theme | null>(null);
    let isLoading = $state(false);
    let errorMessage = $state('');
    
    function handleThemeChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        selectedTheme = select.value;
        selectedThemeData = themes.find(t => t.value === selectedTheme) || null;
        errorMessage = '';
    }
    
    async function handleThemeSubmit(event: SubmitEvent) {
        event.preventDefault();
        errorMessage = '';
        isLoading = true;
        
        try {
            const formData = new FormData();
            formData.append('theme_name', selectedTheme); // Only send theme_name

            const response = await fetch('/theme?/select', {
                method: 'POST',
                body: formData
            });
    
            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.message || 'Failed to switch theme');
            }
            
            window.location.reload();
        } catch (error) {
            errorMessage = error instanceof Error ? error.message : 'Failed to switch theme';
        } finally {
            isLoading = false;
        }
    }
</script>
    
    <!-- Trigger Button -->
    <label for="change_theme_modal" class="btn btn-outline gap-2">
        Change Theme
        <RefreshCcwIcon class="w-4 h-4" />
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
                class="space-y-6"
                onsubmit={handleThemeSubmit}
            >
                <select 
                    id="theme-select"
                    class="select select-lg select-bordered w-full"
                    value={selectedTheme}
                    onchange={handleThemeChange}
                >
                    <option value="">Select a theme...</option>
                    {#each themes.filter(t => t.name !== currentThemeName) as theme}
                        <option value={theme.value}>{theme.name}</option>
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
                        <div class="flex items-center gap-2">
                            {#if errorMessage}
                                <span class="text-error text-sm">{errorMessage}</span>
                            {/if}
                        </div>
                        <div class="flex gap-2">
                            <label for="change_theme_modal" class="btn btn-ghost gap-2">
                                <XCircle class="w-4 h-4" /> Cancel
                            </label>
                            <button 
                                type="submit" 
                                class="btn btn-primary gap-2"
                                disabled={isLoading}
                            >
                                {#if isLoading}
                                    <span class="loading loading-spinner"></span>
                                {:else}
                                    Apply {selectedThemeData.name}
                                    <ArrowRight class="w-4 h-4" />
                                {/if}
                            </button>
                        </div>
                    </div>
                {/if}
            </form>
        </div>
    </div>