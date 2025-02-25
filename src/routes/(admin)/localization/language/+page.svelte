<!-- Language Settings Page -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { superForm } from 'sveltekit-superforms';
    import { Languages, CheckCircle, ChevronLeft, Loader2 } from 'lucide-svelte';
    import { SystemSettingsSchema } from '$lib/db/schemas';
    import { zod } from 'sveltekit-superforms/adapters';

    let { data } = $props();
    
    let loading = $state(true);
    let saved = $state(false);

    // Initialize the form
    const { form, enhance, submitting, delayed } = superForm(data.form, {
        validators: zod(SystemSettingsSchema),
        validationMethod: 'submit-only',
        delayMs: 300,
        resetForm: false,
        onResult: ({ result }) => {
            if (result.type === 'success') {
                saved = true;
                setTimeout(() => {
                    saved = false;
                }, 3000);
            }
        }
    });

    // Set default values if fields don't exist
    $effect(() => {
        if (!$form.language) {
            $form.language = 'en';
        }
        if ($form.useArabicPrayerNames === undefined) {
            $form.useArabicPrayerNames = false;
        }
    });

    const languages = [
        { code: 'en', name: 'English', example: 'Prayer Times Display' },
        { code: 'ar', name: 'العربية (Arabic)', example: 'عرض أوقات الصلاة' },
        { code: 'ur', name: 'اردو (Urdu)', example: 'نماز کے اوقات کی نمائش' },
        { code: 'fr', name: 'Français (French)', example: 'Affichage des heures de prière' },
        { code: 'tr', name: 'Türkçe (Turkish)', example: 'Namaz Vakitleri Ekranı' },
    ];

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
                <p class="text-base-content/70 ml-10">Choose interface and prayer text languages</p>

                <form method="POST" use:enhance class="space-y-6 mt-6">
                    <!-- Language Selection -->
                    <div class="form-control w-full">
                        <h3 class="text-lg font-medium mb-4">Interface Language</h3>
                        
                        <div class="grid gap-3 mt-2">
                            {#each languages as lang, i}
                                <label 
                                    class="relative flex cursor-pointer flex-col rounded-lg
                                          border bg-base-200 p-4 hover:bg-base-300 
                                          focus-within:ring-2 focus-within:ring-primary
                                          {$form.language === lang.code ? 'border-primary bg-primary/10' : 'border-base-300'}
                                          transition-colors"
                                >
                                    <input
                                        type="radio"
                                        name="language"
                                        value={lang.code}
                                        class="sr-only"
                                        checked={$form.language === lang.code}
                                        on:change={() => $form.language = lang.code}
                                    />
                                    <div class="flex items-start justify-between">
                                        <span class="flex items-center gap-2">
                                            <span class="text-base font-medium text-base-content">
                                                {lang.name}
                                            </span>
                                        </span>
                                        
                                        {#if $form.language === lang.code}
                                            <CheckCircle class="h-5 w-5 text-primary" />
                                        {/if}
                                    </div>
                                    <p class="mt-1 text-sm text-base-content/80 font-medium">
                                        {lang.example}
                                    </p>
                                </label>
                            {/each}
                        </div>
                    </div>

                    <!-- Prayer Names Language -->
                    <div class="form-control w-full mt-8">
                        <h3 class="text-lg font-medium mb-4">Prayer Names Language</h3>
                        
                        <div class="card bg-base-200 p-4">
                            <label class="flex items-center justify-between cursor-pointer p-2">
                                <span class="label-text text-base">Use Arabic prayer names</span>
                                <input 
                                    type="checkbox" 
                                    name="useArabicPrayerNames"
                                    class="toggle toggle-primary" 
                                    checked={$form.useArabicPrayerNames}
                                    on:change={(e) => $form.useArabicPrayerNames = e.currentTarget.checked}
                                />
                            </label>
                            
                            <div class="mt-4 bg-base-300 p-3 rounded-lg">
                                <div class="text-sm">
                                    <p class="mb-1"><span class="font-medium">Example:</span></p>
                                    <p class="mb-1">{$form.useArabicPrayerNames ? 'الفجر' : 'Fajr'}</p>
                                    <p class="mb-1">{$form.useArabicPrayerNames ? 'الظهر' : 'Dhuhr'}</p>
                                    <p class="mb-1">{$form.useArabicPrayerNames ? 'العصر' : 'Asr'}</p>
                                    <p class="mb-1">{$form.useArabicPrayerNames ? 'المغرب' : 'Maghrib'}</p>
                                    <p>{$form.useArabicPrayerNames ? 'العشاء' : 'Isha'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <div class="mt-8 flex justify-end">
                        <button 
                            type="submit"
                            class="btn btn-primary w-full sm:w-auto" 
                            disabled={$submitting}
                        >
                            {#if $submitting}
                                <Loader2 class="h-4 w-4 mr-1 animate-spin" />
                                Saving...
                            {:else if $delayed}
                                <Loader2 class="h-4 w-4 mr-1 animate-spin" />
                                Checking...
                            {:else if saved}
                                <CheckCircle class="h-4 w-4 mr-1" />
                                Saved!
                            {:else}
                                Save Settings
                            {/if}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
{/if}