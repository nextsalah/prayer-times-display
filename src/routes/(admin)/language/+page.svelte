<script lang="ts">
    import { superForm } from 'sveltekit-superforms/client';
    import type { z } from 'zod';
    import { LanguageSchema, type LanguageSettingsWithoutId } from '$lib/db/schemas';
    import { zod } from 'sveltekit-superforms/adapters';
    import { languageConfigs } from '$lib/config/languageConfiguration';

    const { data } = $props();
    const { form, enhance, submitting, errors } = superForm(data.form, {
        validators: zod(LanguageSchema),
        validationMethod: 'onblur',
        resetForm: false,
        onResult: ({ result }) => {
            if (result.type === 'success') {
                console.log('Form submitted successfully');
            }
        }
    });

    function formatLabel(field: string): string {
        return field.charAt(0).toUpperCase() + field.slice(1);
    }

    function updateLanguage(settings: LanguageSettingsWithoutId) {
        // Update all form fields except id
        Object.keys(settings).forEach(key => {
            form.update($form => ({
                ...$form,
                [key]: settings[key as keyof LanguageSettingsWithoutId]
            }));
        });
    }
</script>

<div class="p-4">
    <div class="card bg-base-300 shadow-xl">
        <div class="card-body">
            <h2 class="card-title text-2xl mb-2">Language Settings</h2>
            <p class="text-base-content/70 mb-4">Customize the language settings for prayer times display.</p>

                <!-- Language Selector -->
                <div class="flex flex-wrap gap-2 mb-6 border-b pb-4">
                    {#each Object.entries(languageConfigs) as [key, config]}
                        <button 
                            type="button"
                            class="btn btn-sm gap-2 hover:scale-105 transition-transform"
                            onclick={() => updateLanguage(config.settings)}
                        >
                            <config.flag />
                            {config.name}
                        </button>
                    {/each}
                </div>


            <form method="POST" use:enhance class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {#each Object.keys($form).filter(key => key !== 'id') as field}
                        <div class="form-control w-full">
                            <label for={field} class="label">
                                <span class="label-text">{formatLabel(field)}</span>
                            </label>
                            <input
                                type="text"
                                id={field}
                                name={field}
                                bind:value={$form[field as keyof z.infer<typeof LanguageSchema>]}
                                class="input input-bordered w-full {$errors[field as keyof typeof $errors] ? 'input-error' : ''}"
                            />
                            {#if $errors[field as keyof typeof $errors]}
                                <span class="label-text-alt text-error">{$errors[field as keyof typeof $errors]}</span>
                            {/if}
                        </div>
                    {/each}
                </div>

                <div class="card-actions justify-end mt-6">
                    <button 
                        type="submit" 
                        class="btn btn-primary {$submitting ? 'loading' : ''}" 
                        disabled={$submitting}
                    >
                        {$submitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>