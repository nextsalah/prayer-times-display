<!-- Date Format Settings Page -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { superForm } from 'sveltekit-superforms';
    import { CalendarClock, CheckCircle, ChevronLeft, Loader2, Save, AlertTriangle } from 'lucide-svelte';
    import { DateSettingsSchema } from '$lib/db/schemas';
    import { zod } from 'sveltekit-superforms/adapters';
    import type { PageData } from './$types';

    let { data } = $props();
    
    let loading = $state(true);
    let saved = $state(false);
    let formError = $state<string | null>(null);

    // Initialize the form
    const { form, enhance, submitting, delayed, errors } = superForm(data.form, {
        validators: zod(DateSettingsSchema),
        validationMethod: 'submit-only',
        delayMs: 300,
        resetForm: false,
        onResult: ({ result }) => {
            if (result.type === 'success') {
                saved = true;
                formError = null;
                setTimeout(() => {
                    saved = false;
                }, 3000);
            } else if (result.type === 'failure') {
                // Check if there's a specific error message in the result
                formError = result.data?.error ?? 'An unexpected error occurred';
            }
        }
    });

    // Current date preview
    let currentDate = $state('');
    let previewDates = $state<Array<{label: string, value: string, example: string}>>([]);

    function updateDatePreviews() {
        const now = new Date();
        
        const dateOptions: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: $form.dateFormat.includes('MMMM') ? 'long' : 
                  $form.dateFormat.includes('MMM') ? 'short' : '2-digit',
            day: '2-digit'
        };
        
        currentDate = now.toLocaleDateString(undefined, dateOptions);

        // Generate preview dates for each format
        const formats = [
            { label: "DD/MM/YYYY", value: "DD/MM/YYYY", example: now.toLocaleDateString(undefined, {
                day: '2-digit', month: '2-digit', year: 'numeric'
            })},
            { label: "MM/DD/YYYY", value: "MM/DD/YYYY", example: now.toLocaleDateString('en-US', {
                month: '2-digit', day: '2-digit', year: 'numeric'
            })},
            { label: "YYYY-MM-DD", value: "YYYY-MM-DD", example: now.toLocaleDateString(undefined, {
                year: 'numeric', month: '2-digit', day: '2-digit'
            }).replace(/\//g, '-') },
            { label: "DD MMM YYYY", value: "DD MMM YYYY", example: now.toLocaleDateString('en-US', {
                day: '2-digit', month: 'short', year: 'numeric'
            })},
            { label: "MMMM DD, YYYY", value: "MMMM DD, YYYY", example: now.toLocaleDateString('en-US', {
                month: 'long', day: '2-digit', year: 'numeric'
            })},
        ];
        
        previewDates = formats;
    }

    // Initialize and cleanup timer
    onMount(() => {
        // Check for any initial error from server load
        if (data.error) {
            formError = data.error;
        }
        
        updateDatePreviews();
        setTimeout(() => {
            loading = false;
        }, 500);
    });

    // Effect for updates
    $effect(() => {
        if ($form) {
            updateDatePreviews();
        }
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
                        <CalendarClock class="h-6 w-6 mr-1 text-secondary" />
                        Date Format Settings
                    </h2>
                </div>
                <p class="text-base-content/70 ml-10">Choose how dates are displayed on the prayer screen</p>

                {#if formError}
                    <div role="alert" class="alert alert-error mb-4">
                        <AlertTriangle class="h-6 w-6" />
                        <span>{formError}</span>
                    </div>
                {/if}

                <form method="POST" use:enhance class="space-y-6 mt-6">
                    <!-- Date Format Selection -->
                    <div class="grid gap-3 mt-2">
                        {#each previewDates as format}
                            <label 
                                class="relative flex cursor-pointer flex-col rounded-lg
                                      border bg-base-200 p-4 hover:bg-base-300 
                                      focus-within:ring-2 focus-within:ring-secondary
                                      {$form.dateFormat === format.value ? 'border-secondary bg-secondary/10' : 'border-base-300'}
                                      transition-colors"
                            >
                                <input
                                    type="radio"
                                    name="dateFormat"
                                    value={format.value}
                                    class="sr-only"
                                    bind:group={$form.dateFormat}
                                />
                                <div class="flex items-start justify-between">
                                    <span class="flex items-center gap-2">
                                        <span class="text-base font-medium text-base-content">
                                            {format.label}
                                        </span>
                                    </span>
                                    
                                    {#if $form.dateFormat === format.value}
                                        <CheckCircle class="h-5 w-5 text-secondary" />
                                    {/if}
                                </div>
                                <p class="mt-1 text-sm text-base-content/80">
                                    {format.example}
                                </p>
                            </label>
                        {/each}
                    </div>

                    {#if $errors.dateFormat}
                        <p class="text-error text-sm mt-2">{$errors.dateFormat}</p>
                    {/if}

                    <!-- Submit Button -->
                    <div class="mt-8 flex justify-end">
                        <button 
                            type="submit"
                            class="btn btn-primary gap-2 w-full sm:w-auto" 
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
{/if}