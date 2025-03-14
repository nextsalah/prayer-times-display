<script lang="ts">
    import { z } from 'zod';
    import { superForm } from 'sveltekit-superforms';
    import { zod } from 'sveltekit-superforms/adapters';
    import { RefreshCw, Download, Loader2, CheckCircle, AlertTriangle } from 'lucide-svelte';
    import type { PageData } from './$types';

    // Simplified schema to match server-side schema
    const VersionSettingsSchema = z.object({
        currentVersion: z.string(),
        updateAvailable: z.boolean(),
        latestVersion: z.string().optional()
    });

    let { data }: { data: PageData } = $props();
    
    let loading = $state(false);
    let message = $state<{text: string, type: 'success' | 'error' | null}>({
        text: '',
        type: null
    });
    let updating = $state(false);

    const { form, enhance, submitting, errors } = superForm(data.form, {
        validators: zod(VersionSettingsSchema),
        dataType: 'json',
        validationMethod: 'submit-only',
        delayMs: 300,
        onResult: ({ result }) => {
            if (result.type === 'failure') {
                message = {
                    text: result.data?.error ?? 'An unexpected error occurred',
                    type: 'error'
                };
            } else if (result.type === 'success' && result.data?.message) {
                message = {
                    text: result.data.message,
                    type: 'success'
                };
            } else {
                message = {text: '', type: null};
            }
        }
    });

    // Form for the check for updates action
    const checkForm = superForm(data.form, {
        id: 'check-updates',
        dataType: 'json',
        validators: zod(VersionSettingsSchema),
        onSubmit: () => {
            loading = true;
            return true;
        },
        onResult: ({ result }) => {
            loading = false;
            if (result.type === 'failure') {
                message = {
                    text: result.data?.error ?? 'Failed to check for updates',
                    type: 'error'
                };
            } else if ($form.updateAvailable) {
                message = {
                    text: `Update available: v${$form.latestVersion}`,
                    type: 'success'
                };
            } else {
                message = {
                    text: 'Your system is up to date',
                    type: 'success'
                };
            }
        }
    });

    // Form for the update action
    const updateForm = superForm(data.form, {
        id: 'perform-update',
        dataType: 'json',
        validators: zod(VersionSettingsSchema),
        onSubmit: () => {
            updating = true;
            return true;
        },
        onResult: ({ result }) => {
            updating = false;
            if (result.type === 'failure') {
                message = {
                    text: result.data?.error ?? 'Failed to update system',
                    type: 'error'
                };
            } else {
                message = {
                    text: result.data?.message ?? 'System updated successfully!',
                    type: 'success'
                };
            }
        }
    });
</script>

<div class="card bg-base-100 shadow-xl">
    <div class="card-body">
        <h2 class="card-title flex items-center">
            <RefreshCw class="h-6 w-6 mr-2" />
            System Version
        </h2>
        <p class="text-sm text-base-content/70 mb-4">Check for updates and update your system</p>

        {#if message.text && message.type}
            <div role="alert" class="alert {message.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg mb-4">
                <div class="flex items-center">
                    {#if message.type === 'success'}
                        <CheckCircle class="h-6 w-6 mr-2" />
                    {:else}
                        <AlertTriangle class="h-6 w-6 mr-2" />
                    {/if}
                    <span>{message.text}</span>
                </div>
            </div>
        {/if}

        <!-- Current Version Info -->
        <div class="bg-base-200 rounded-lg p-5 mb-6">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="font-semibold text-lg">Current Version</h3>
                    <p class="text-xl font-mono mt-1">v{$form.currentVersion}</p>
                </div>
                {#if $form.updateAvailable}
                    <div class="badge badge-primary p-3">
                        Update Available: v{$form.latestVersion}
                    </div>
                {/if}
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4">
            <form action="?/checkUpdates" method="POST" use:checkForm.enhance>
                <button 
                    type="submit"
                    class="btn btn-outline gap-2"
                    disabled={loading}
                >
                    {#if loading}
                        <Loader2 class="h-4 w-4 animate-spin" />
                        Checking...
                    {:else}
                        <RefreshCw class="h-4 w-4" />
                        Check for Updates
                    {/if}
                </button>
            </form>

            {#if $form.updateAvailable}
                <form action="?/performUpdate" method="POST" use:updateForm.enhance>
                    <button 
                        type="submit"
                        class="btn btn-primary gap-2"
                        disabled={updating}
                    >
                        {#if updating}
                            <Loader2 class="h-4 w-4 animate-spin" />
                            Updating...
                        {:else}
                            <Download class="h-4 w-4" />
                            Update Now
                        {/if}
                    </button>
                </form>
            {/if}
        </div>
    </div>
</div>