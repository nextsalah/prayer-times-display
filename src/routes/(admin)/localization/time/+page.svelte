<!-- Time Format Settings Page -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { superForm } from 'sveltekit-superforms';
    import { Clock, CheckCircle, ChevronLeft, Loader2, Save, AlertTriangle } from 'lucide-svelte';
    import { TimeSettingsSchema } from '$lib/db/schemas';
    import { zod } from 'sveltekit-superforms/adapters';

    let { data } = $props();
    
    let loading = $state(true);
    let saved = $state(false);
    let formError = $state<string | null>(null);

    // Initialize the form with default values merged with any existing data
    const { form, enhance, submitting, delayed, errors } = superForm(data.form ?? {
        // Default values
        use24Hour: false,
        showSeconds: false,
        timezone: 'auto'
    }, {
        validators: zod(TimeSettingsSchema),
        dataType: 'json',
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
            
    // Reactive time and date strings
    let currentTime = $state('');
    let timeInterval: ReturnType<typeof setInterval>;

    function updateTime() {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: $form.showSeconds ? '2-digit' : undefined,
            hour12: !$form.use24Hour
        };

        currentTime = now.toLocaleTimeString(undefined, options);
    }

    // Initialize and cleanup timer
    onMount(() => {
        // Check for any initial error from server load
        if (data.error) {
            formError = data.error;
        }

        updateTime();
        timeInterval = setInterval(updateTime, 1000);
        setTimeout(() => {
            loading = false;
        }, 500);
        return () => clearInterval(timeInterval);
    });

    // Effect for timezone updates
    $effect(() => {
        if (!$form.timezone || $form.timezone === 'auto') {
            $form.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            updateTime();
        }
    });
    
    // Watch for changes in form values and update preview
    $effect(() => {
        if ($form) {
            updateTime();
        }
    });

    function getTimezoneDisplayName(timezone: string) {
        try {
            return new Intl.DateTimeFormat('en', {
                timeZoneName: 'long',
                timeZone: timezone
            }).formatToParts(new Date())
                .find(part => part.type === 'timeZoneName')?.value || timezone;
        } catch {
            return timezone;
        }
    }

    const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
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
                        <Clock class="h-6 w-6 mr-1 text-accent" />
                        Time Format Settings
                    </h2>
                </div>
                <p class="text-base-content/70 ml-10">Choose how times are displayed on the prayer screen</p>

                {#if formError}
                    <div role="alert" class="alert alert-error mb-4">
                        <AlertTriangle class="h-6 w-6" />
                        <span>{formError}</span>
                    </div>
                {/if}

                <form method="POST" use:enhance class="space-y-6 mt-6">
                    <!-- Time Display Preview -->
                    <div class="card bg-base-200 p-6 text-center mb-8">
                        <div class="text-4xl font-mono font-semibold mb-2">{currentTime}</div>
                        <div class="text-sm text-base-content/70">{getTimezoneDisplayName($form.timezone)}</div>
                    </div>
                    
                    <!-- Time Format Options -->
                    <div class="form-control">
                        <h3 class="text-lg font-medium mb-4">Time Display Options</h3>
                        
                        <div class="card bg-base-200 p-4">
                            <label class="flex items-center justify-between cursor-pointer p-2">
                                <span class="label-text text-base">Use 24-hour format</span>
                                <input 
                                    type="checkbox" 
                                    name="use24Hour"
                                    class="toggle toggle-primary" 
                                    bind:checked={$form.use24Hour}
                                />
                            </label>
                            
                            <div class="divider my-2"></div>
                            
                            <label class="flex items-center justify-between cursor-pointer p-2">
                                <span class="label-text text-base">Show seconds</span>
                                <input 
                                    type="checkbox" 
                                    name="showSeconds"
                                    class="toggle toggle-primary" 
                                    bind:checked={$form.showSeconds}
                                />
                            </label>
                        </div>
                    </div>

                    <!-- Timezone Selection -->
                    <div class="form-control w-full">
                        <h3 class="text-lg font-medium mb-4">Timezone</h3>
                        
                        <select 
                            name="timezone"
                            id="timezone"
                            class="select select-bordered w-full" 
                            bind:value={$form.timezone}
                        >
                            <option value={systemTimezone}>
                                Auto-detect ({getTimezoneDisplayName(systemTimezone)})
                            </option>
                            <option value="UTC">UTC (Coordinated Universal Time)</option>
                            <option value="GMT">GMT (Greenwich Mean Time)</option>
                            <option value="EST">EST (Eastern Standard Time)</option>
                            <option value="PST">PST (Pacific Standard Time)</option>
                            <option value="IST">IST (India Standard Time)</option>
                        </select>
                        <p class="text-xs text-base-content/70 mt-2">
                            Select "Auto-detect" to use the device's timezone
                        </p>
                    </div>

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