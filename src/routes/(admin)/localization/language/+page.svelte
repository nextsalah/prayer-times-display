<!-- Language Settings Page -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { superForm } from 'sveltekit-superforms';
    import { Languages, CheckCircle, ChevronLeft, Loader2, Edit, X, Save, Settings } from 'lucide-svelte';
    import { SystemSettingsSchema, type LanguageSchemaType } from '$lib/db/schemas';
    import { zod } from 'sveltekit-superforms/adapters';
    import { languageConfigs, type LanguageConfig } from '$lib/config/languageConfiguration';

    let { data } = $props();
    
    let loading = $state(true);
    let saved = $state(false);
    let currentCustomizations = $state<Partial<LanguageSchemaType>>(data.customizations || {});
    let editingLanguage = $state<{code: string, config: LanguageConfig[keyof LanguageConfig]} | null>(null);

    // Initialize the form with improved handling
    const { form, enhance, submitting, delayed } = superForm(data.form, {
        validators: zod(SystemSettingsSchema),
        validationMethod: 'submit-only',
        delayMs: 300,
        resetForm: false,
        onSubmit: ({ formData }) => {
            // Add customizations to form data
            if (editingLanguage && Object.keys(currentCustomizations).length > 0) {
                Object.entries(currentCustomizations).forEach(([key, value]) => {
                    if (value) formData.set(key, value);
                });
            }
        },
        onResult: ({ result }) => {
            if (result.type === 'success') {
                saved = true;
                editingLanguage = null;
                setTimeout(() => {
                    saved = false;
                }, 3000);
            }
        }
    });

    // Function to edit language settings
    function editLanguageSettings(code: keyof typeof languageConfigs) {
        const config = languageConfigs[code];
        // Load any existing customizations for this language
        currentCustomizations = data.customizations?.language_code === code 
            ? { ...data.customizations }
            : {};
        delete currentCustomizations.id;
        delete currentCustomizations.language_code;
        editingLanguage = { code, config };
    }

    function updateCustomization(key: keyof LanguageSchemaType, value: string) {
        if (value === languageConfigs[editingLanguage?.code || '']?.settings[key]) {
            // If value is same as default, remove customization
            delete currentCustomizations[key];
        } else {
            currentCustomizations[key] = value;
        }
    }

    // Initialize
    onMount(() => {
        setTimeout(() => {
            loading = false;
        }, 500);
    });
</script>

{#if loading}
    <div class="container mx-auto p-4 max-w-4xl flex justify-center items-center min-h-[400px]">
        <Loader2 class="h-12 w-12 animate-spin text-primary" />
    </div>
{:else}
    <div class="container mx-auto p-4 max-w-4xl">
        <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
                <div class="flex items-center gap-2 mb-2">
                    <a href="/localization" class="btn btn-ghost btn-sm btn-square">
                        <ChevronLeft size={20} />
                    </a>
                    <h2 class="card-title">
                        <Languages class="h-6 w-6 mr-1 text-primary" />
                        Language Settings
                    </h2>
                </div>
                <p class="text-base-content/70 ml-10">Choose interface language and customize translations</p>

                <form method="POST" use:enhance class="space-y-6 mt-6">
                    <!-- Language Selection -->
                    <div class="form-control w-full">
                        <h3 class="text-lg font-medium mb-4">Interface Language</h3>
                        
                        <div class="grid gap-3 mt-2">
                            {#each Object.entries(languageConfigs) as [code, lang]}
                                <div 
                                    class="relative flex rounded-lg
                                          border bg-base-200 p-4 
                                          {$form.language === code ? 'border-primary bg-primary/10' : 'border-base-300'}
                                          transition-colors"
                                >
                                    <label class="flex-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="language"
                                            value={code}
                                            class="sr-only"
                                            bind:group={$form.language}
                                        />
                                        <div class="flex items-center justify-between">
                                            <span class="flex items-center gap-2">
                                                <svelte:component this={lang.flag} class="w-8 h-6" />
                                                <span class="text-base font-medium text-base-content">
                                                    {lang.name}
                                                </span>
                                                <span class="badge badge-sm">{lang.code}</span>
                                            </span>
                                            
                                            {#if $form.language === code}
                                                <CheckCircle class="h-5 w-5 text-primary" />
                                            {/if}
                                        </div>
                                    </label>
                                    
                                    <div class="flex items-center ml-3">
                                        <button 
                                            type="button" 
                                            class="btn btn-sm btn-ghost btn-square"
                                            onclick={() => editLanguageSettings(code)}
                                            title="Customize translations"
                                        >
                                            <Edit size={16} />
                                        </button>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>

                    <!-- Edit Language Dialog -->
                    {#if editingLanguage}
                        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div class="bg-base-100 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                <div class="flex items-center justify-between mb-6">
                                    <div class="flex items-center gap-3">
                                        <svelte:component this={editingLanguage.config.flag} class="w-8 h-6" />
                                        <h3 class="text-lg font-bold">Customize {editingLanguage.config.name} Translations</h3>
                                    </div>
                                    <button 
                                        type="button" 
                                        class="btn btn-sm btn-ghost btn-square"
                                        onclick={() => editingLanguage = null}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div class="space-y-4">
                                    {#each Object.entries(editingLanguage.config.settings) as [key, defaultValue]}
                                        <div class="form-control w-full">
                                            <label class="label">
                                                <span class="label-text capitalize">{key}</span>
                                                <span class="label-text-alt text-base-content/60">Default: {defaultValue}</span>
                                            </label>
                                            <div class="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    class="input input-bordered flex-1" 
                                                    placeholder={defaultValue}
                                                    value={currentCustomizations[key as keyof LanguageSchemaType] ?? defaultValue}
                                                    oninput={(e) => updateCustomization(key as keyof LanguageSchemaType, e.currentTarget.value)}
                                                />
                                                {#if currentCustomizations[key as keyof LanguageSchemaType]}
                                                    <button 
                                                        type="button"
                                                        class="btn btn-ghost btn-square"
                                                        title="Reset to default"
                                                        onclick={() => updateCustomization(key as keyof LanguageSchemaType, defaultValue)}
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                {/if}
                                            </div>
                                        </div>
                                    {/each}
                                </div>

                                <div class="mt-8 flex justify-end gap-2">
                                    <button 
                                        type="button" 
                                        class="btn"
                                        onclick={() => editingLanguage = null}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        class="btn btn-primary"
                                    >
                                        <Save size={16} class="mr-2" />
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    {/if}

                    <!-- Submit Button -->
                    <div class="mt-8 flex justify-end">
                        <button 
                            type="submit"
                            class="btn btn-primary w-full sm:w-auto" 
                            disabled={$submitting}
                        >
                            {#if $submitting}
                                <Loader2 class="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            {:else if $delayed}
                                <Loader2 class="h-4 w-4 mr-2 animate-spin" />
                                Checking...
                            {:else if saved}
                                <CheckCircle class="h-4 w-4 mr-2" />
                                Saved!
                            {:else}
                                <Settings class="h-4 w-4 mr-2" />
                                Save Settings
                            {/if}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
{/if}

<style>
    :global(.flag-icon) {
        border-radius: 2px;
    }
</style>