<script lang="ts">
    import { z } from 'zod';
    import { superForm } from 'sveltekit-superforms';
    import { zod } from 'sveltekit-superforms/adapters';
    import { RefreshCw, Download, Shield, AlertTriangle, Loader2 } from 'lucide-svelte';
    import type { PageData } from './$types';

    // Local schema to match server-side schema
    const VersionSettingsSchema = z.object({
        currentVersion: z.string(),
        updateAvailable: z.boolean(),
        autoUpdate: z.boolean(),
        betaUpdates: z.boolean(),
        updateChannel: z.enum(['stable', 'beta', 'dev']),
        secureUpdates: z.boolean(),
    });

    let { data }: { data: PageData } = $props();
    
    let loading = $state(false);
    let formError = $state<string | null>(null);

    const { form, enhance, submitting, errors } = superForm(data.form, {
        validators: zod(VersionSettingsSchema),
        dataType: 'json',
        validationMethod: 'submit-only',
        delayMs: 300,
        onResult: ({ result }) => {
            if (result.type === 'failure') {
                // Check if there's a specific error message in the result
                formError = result.data?.error ?? 'An unexpected error occurred';
            } else {
                formError = null;
            }
        }
    });

</script>

<div>
    <h2 class="card-title mb-4">
        <RefreshCw class="h-6 w-6 mr-2" />
        Version & Update Settings
    </h2>
    <p class="text-base-content/70 mb-6">Manage system updates and version settings</p>

    {#if formError}
        <div role="alert" class="alert alert-error mb-4">
            <AlertTriangle class="h-6 w-6" />
            <span>{formError}</span>
        </div>
    {/if}

    <form method="POST" use:enhance class="space-y-8">
        <!-- Current Version Info -->
        <div class="bg-base-200 rounded-lg p-4">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="font-medium">Current Version</h3>
                    <p class="text-sm text-base-content/70">v{$form.currentVersion || '1.0.0'}</p>
                </div>
                {#if $form.updateAvailable}
                    <div class="badge badge-primary">Update Available</div>
                {/if}
            </div>
        </div>

        <!-- Update Settings -->
        <div class="space-y-4">
            <h3 class="font-medium text-lg">Update Settings</h3>
            
            <div class="form-control">
                <label class="label cursor-pointer justify-start gap-4">
                    <input 
                        type="checkbox" 
                        class="toggle toggle-primary" 
                        bind:checked={$form.autoUpdate}
                        name="autoUpdate"
                    />
                    <span class="label-text">Enable automatic updates</span>
                </label>
            </div>

            <div class="form-control">
                <label class="label cursor-pointer justify-start gap-4">
                    <input 
                        type="checkbox" 
                        class="toggle toggle-primary" 
                        bind:checked={$form.betaUpdates}
                        name="betaUpdates"
                    />
                    <span class="label-text">Receive beta updates</span>
                </label>
            </div>

            <!-- Update Channel -->
            <div class="form-control w-full max-w-xs">
                <label class="label" for="updateChannel">
                    <span class="label-text">Update Channel</span>
                </label>
                <select 
                    class="select select-bordered" 
                    id="updateChannel"
                    name="updateChannel"
                    bind:value={$form.updateChannel}
                >
                    <option value="stable">Stable</option>
                    <option value="beta">Beta</option>
                    <option value="dev">Development</option>
                </select>
            </div>
        </div>

        <!-- Security Settings -->
        <div class="space-y-4">
            <h3 class="font-medium text-lg flex items-center gap-2">
                <Shield class="h-5 w-5" />
                Security
            </h3>
            
            <div class="form-control">
                <label class="label cursor-pointer justify-start gap-4">
                    <input 
                        type="checkbox" 
                        class="toggle toggle-primary" 
                        bind:checked={$form.secureUpdates}
                        name="secureUpdates"
                    />
                    <span class="label-text">Verify updates before installing</span>
                </label>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4">
            <button 
                type="submit"
                class="btn btn-primary" 
                disabled={$submitting}
            >
                {#if $submitting}
                    <Loader2 class="h-4 w-4 animate-spin" />
                    Saving...
                {:else}
                    Save Settings
                {/if}
            </button>

            <button 
                type="button"
                class="btn btn-outline gap-2"
                disabled={$submitting}
            >
                <Download class="h-4 w-4" />
                Check for Updates
            </button>
        </div>
    </form>
</div>