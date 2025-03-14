<!-- Language Settings Page -->
<script lang="ts">
    import { superForm } from 'sveltekit-superforms';
    import { Languages, CheckCircle, ChevronLeft, Loader2, Save } from 'lucide-svelte';
    import { LanguageSchema, type LanguageSchemaType } from '$lib/db/schemas';
    import { zod } from 'sveltekit-superforms/adapters';
    import { languageConfigs } from '$lib/config/languageConfiguration';
	import toast from 'svelte-french-toast';

    const { data } = $props();
    
    const { form, enhance, submitting, errors } = superForm(data.form, {
        validators: zod(LanguageSchema),
        validationMethod: 'onblur',
        dataType: 'json',
        resetForm: false,
        onResult: ({ result }) => {
            if (result.type === 'success') {
                toast.success("Successfully saved language settings");           
            }
        }
    });

    // Format field name for display
    function formatLabel(field: string): string {
        return field.charAt(0).toUpperCase() + field.slice(1);
    }

    // Update form with selected language settings
    function updateLanguage(code: string) {
        const config = Object.values(languageConfigs).find(lang => lang.code === code);
        if (!config) return;
        
        // Update language code
        form.update($form => ({
            ...$form,
            language_code: code
        }));
        
        // Update all language fields
        Object.entries(config.settings).forEach(([key, value]) => {
            form.update($form => ({
                ...$form,
                [key]: value
            }));
        });
    }
    
    // Get form fields excluding technical fields
    function getDisplayFields() {
        return Object.keys($form).filter(key => 
            key !== 'id' && key !== 'language_code'
        );
    }
    
    // Determine if a language is active
    function isLanguageActive(code: string): boolean {
        return $form.language_code === code;
    }
</script>

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
                <!-- Language Selection Buttons -->
                <div class="form-control w-full">
                    <h3 class="text-lg font-medium mb-4">Choose a language</h3>
                    <div class="flex flex-wrap gap-2 mb-6">
                        {#each Object.values(languageConfigs) as lang}
                            <button 
                                type="button"
                                class="btn {isLanguageActive(lang.code) ? 'btn-primary' : 'btn-outline'} gap-2"
                                onclick={() => updateLanguage(lang.code)}
                            >
                                <lang.flag class="w-6 h-4" />
                                {lang.name}
                                {#if isLanguageActive(lang.code)}
                                    <CheckCircle class="h-4 w-4" />
                                {/if}
                            </button>
                        {/each}
                    </div>
                </div>
                
                <!-- Hidden language code field -->
                <input type="hidden" name="language_code" bind:value={$form.language_code} />

                <!-- Form Fields -->
                <div class="form-control w-full">
                    <h3 class="text-lg font-medium mb-4">Customize translations</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {#each getDisplayFields() as field}
                            <div class="form-control w-full">
                                <label for={field} class="label">
                                    <span class="label-text">{formatLabel(field)}</span>
                                </label>
                                <input
                                    type="text"
                                    id={field}
                                    name={field}
                                    bind:value={$form[field as keyof typeof $form]}
                                    class="input input-bordered w-full {$errors[field as keyof typeof $errors] ? 'input-error' : ''}"
                                />
                                {#if $errors[field as keyof typeof $errors]}
                                    <span class="label-text-alt text-error">{$errors[field as keyof typeof $errors]}</span>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </div>

                <!-- Submit Button -->
                <div class="mt-8 flex justify-end">
                    <button 
                        type="submit"
                        class="btn btn-primary gap-2" 
                        disabled={$submitting}
                    >
                        {#if $submitting}
                            <Loader2 class="h-5 w-5 animate-spin" />
                            Saving...
                        {:else}
                            <Save class="h-5 w-5" />
                            Save Settings
                        {/if}
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>