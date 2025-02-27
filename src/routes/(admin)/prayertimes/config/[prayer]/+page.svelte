<script>
    import { superForm } from 'sveltekit-superforms/client';
    import { 
        Clock, 
        AlarmCheck, 
        Timer, 
        ArrowUpDown, 
        Lock, 
        Sunrise,
        Info,
        CheckCircle,
        AlertCircle
    } from 'lucide-svelte';
    
    /** @type {import('./$types').PageData} */
    let { data } = $props();

    // Use a regular variable since we don't need reactivity for this static check
    const isFajr = data.prayerName?.toLowerCase() === 'fajr';
    
    const { form, enhance, errors, submitting, message } = superForm(data.form, {
        resetForm: false,
        taintedMessage: 'You have unsaved changes. Are you sure you want to leave?',
    });
    
    // UI feedback states
    let showSuccessMessage = $state(false);
    let showErrorMessage = $state(false);
    
    // Handle form messages
    $effect(() => {
        if ($message?.success) {
            showSuccessMessage = true;
            setTimeout(() => { showSuccessMessage = false; }, 3000);
        }
        
        if ($message?.error) {
            showErrorMessage = true;
            setTimeout(() => { showErrorMessage = false; }, 3000);
        }
    });
    
    // Form section component for better organization
    const FormSection = ({ title, description = '' }) => {
        return `
            <div class="border-b border-base-300 pb-2 mb-4">
                <h3 class="text-lg font-medium">${title}</h3>
                ${description ? `<p class="text-sm text-base-content/70">${description}</p>` : ''}
            </div>
        `;
    };
</script>

<div class="bg-base-100 p-6 rounded-xl border border-base-300 max-w-2xl mx-auto mb-8">
    <header class="mb-6">
        <h2 class="text-2xl font-bold">{data.title.charAt(0).toUpperCase() + data.title.slice(1)} Settings</h2>
        <p class="text-base-content/70">Configure prayer time settings and Iqamah preferences</p>
        <!-- Debug info - remove in production -->
        <p class="text-xs text-base-content/50 mt-2">Prayer Type: {isFajr ? 'Fajr' : 'Other'}</p>
    </header>

    {#if data.error}
        <div class="alert alert-error mb-6">
            <AlertCircle size={20} />
            <span>{data.error}</span>
        </div>
    {/if}

    {#if showSuccessMessage && $message?.success}
        <div class="alert alert-success mb-6 animate-in fade-in slide-in-from-top duration-300">
            <CheckCircle size={20} />
            <span>{$message.success}</span>
        </div>
    {/if}

    {#if showErrorMessage && $message?.error}
        <div class="alert alert-error mb-6 animate-in fade-in slide-in-from-top duration-300">
            <AlertCircle size={20} />
            <span>{$message.error}</span>
        </div>
    {/if}

    <form method="POST" use:enhance class="space-y-8">
        <!-- Prayer Time Section -->
        {@html FormSection({ 
            title: 'Prayer Time Settings', 
            description: 'Adjust how the prayer time is calculated or displayed'
        })}
    
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Offset field -->
            <div class="form-control w-full">
                <label for="offset" class="label">
                    <span class="label-text flex items-center gap-2">
                        <ArrowUpDown size={18} class="text-primary" />
                        Time Offset (minutes)
                    </span>
                </label>
                <input
                    type="number"
                    id="offset"
                    name="offset"
                    bind:value={$form.offset}
                    class="input input-bordered w-full"
                    min="-60"
                    max="60"
                    disabled={$submitting}
                />
                {#if $errors.offset}
                    <label class="label text-error text-sm">{$errors.offset}</label>
                {/if}
                <p class="text-xs text-base-content/60 mt-1">
                    Positive values delay prayer time, negative values advance it
                </p>
            </div>

            <!-- Fixed Time Toggle -->
            <div class="form-control w-full">
                <label for="isFixed" class="label">
                    <span class="label-text flex items-center gap-2">
                        <Lock size={18} class="text-primary" />
                        Use Fixed Time
                    </span>
                </label>
                <div class="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="isFixed"
                        name="isFixed"
                        bind:checked={$form.isFixed}
                        class="toggle toggle-primary"
                        disabled={$submitting}
                    />
                    <span class="text-sm">
                        {$form.isFixed ? 'Using fixed time' : 'Using calculated time'}
                    </span>
                </div>
                <p class="text-xs text-base-content/60 mt-1">
                    Override calculated prayer time with your own scheduled time
                </p>
            </div>
        </div>

        <!-- Fixed Time Input (conditionally shown) -->
        {#if $form.isFixed}
            <div class="form-control w-full max-w-xs animate-in fade-in slide-in-from-top duration-300">
                <label for="fixedTime" class="label">
                    <span class="label-text flex items-center gap-2">
                        <Clock size={18} class="text-primary" />
                        Fixed Time
                    </span>
                </label>
                <input
                    type="time"
                    id="fixedTime"
                    name="fixedTime"
                    bind:value={$form.fixedTime}
                    class="input input-bordered w-full"
                    disabled={$submitting}
                />
                {#if $errors.fixedTime}
                    <label class="label text-error text-sm">{$errors.fixedTime}</label>
                {/if}
            </div>
        {/if}
        
        <!-- Iqamah Section -->
        {@html FormSection({ 
            title: 'Iqamah Settings', 
            description: 'Configure how Iqamah times are calculated and displayed'
        })}
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Show Iqamah Toggle -->
            <div class="form-control w-full">
                <label for="showIqamah" class="label">
                    <span class="label-text flex items-center gap-2">
                        <AlarmCheck size={18} class="text-primary" />
                        Show Iqamah Time
                    </span>
                </label>
                <div class="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="showIqamah"
                        name="showIqamah"
                        bind:checked={$form.showIqamah}
                        class="toggle toggle-primary"
                        disabled={$submitting}
                    />
                    <span class="text-sm">
                        {$form.showIqamah ? 'Iqamah time will be displayed' : 'Iqamah time hidden'}
                    </span>
                </div>
            </div>
            
            <!-- Iqamah After Prayer Toggle -->
            <div class="form-control w-full">
                <label for="iqamahAfterPrayer" class="label">
                    <span class="label-text flex items-center gap-2">
                        <Timer size={18} class="text-primary" />
                        Iqamah Method
                    </span>
                </label>
                <div class="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="iqamahAfterPrayer"
                        name="iqamahAfterPrayer"
                        bind:checked={$form.iqamahAfterPrayer}
                        class="toggle toggle-primary"
                        disabled={$submitting}
                    />
                    <span class="text-sm">
                        {$form.iqamahAfterPrayer ? 'Minutes after prayer time' : 'Custom calculation'}
                    </span>
                </div>
            </div>
        </div>
        
        {#if $form.showIqamah}
            <div class="form-control w-full max-w-xs animate-in fade-in slide-in-from-top duration-300">
                <label for="iqamah" class="label">
                    <span class="label-text flex items-center gap-2">
                        <Timer size={18} class="text-primary" />
                        Iqamah Delay (minutes)
                    </span>
                </label>
                <input
                    type="number"
                    id="iqamah"
                    name="iqamah"
                    bind:value={$form.iqamah}
                    class="input input-bordered w-full"
                    min="0"
                    max="60"
                    disabled={$submitting}
                />
                {#if $errors.iqamah}
                    <label class="label text-error text-sm">{$errors.iqamah}</label>
                {/if}
                <p class="text-xs text-base-content/60 mt-1">
                    Minutes to wait after prayer time before Iqamah
                </p>
            </div>
        {/if}
        
        <!-- Fajr-specific settings - Only show for Fajr prayer -->
        {#if isFajr}
            {@html FormSection({ 
                title: 'Fajr-Specific Settings', 
                description: 'Special settings applicable only to Fajr prayer'
            })}
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Calculate from Sunrise Toggle -->
                <div class="form-control w-full">
                    <label for="calculateIqamahFromSunrise" class="label">
                        <span class="label-text flex items-center gap-2">
                            <Sunrise size={18} class="text-primary" />
                            Calculate from Sunrise
                        </span>
                    </label>
                    <div class="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="calculateIqamahFromSunrise"
                            name="calculateIqamahFromSunrise"
                            bind:checked={$form.calculateIqamahFromSunrise}
                            class="toggle toggle-primary"
                            disabled={$submitting}
                        />
                        <span class="text-sm">
                            {$form.calculateIqamahFromSunrise ? 'Based on sunrise time' : 'Based on Fajr time'}
                        </span>
                    </div>
                    <p class="text-xs text-base-content/60 mt-1">
                        Useful when Iqamah should be at a specific time before sunrise
                    </p>
                </div>
                
                <!-- Sunrise Offset Input (conditionally shown) -->
                {#if $form.calculateIqamahFromSunrise}
                    <div class="form-control w-full animate-in fade-in slide-in-from-top duration-300">
                        <label for="sunriseOffset" class="label">
                            <span class="label-text flex items-center gap-2">
                                <ArrowUpDown size={18} class="text-primary" />
                                Minutes Before Sunrise
                            </span>
                        </label>
                        <input
                            type="number"
                            id="sunriseOffset"
                            name="sunriseOffset"
                            bind:value={$form.sunriseOffset}
                            class="input input-bordered w-full"
                            min="-120"
                            max="0"
                            disabled={$submitting}
                        />
                        {#if $errors.sunriseOffset}
                            <label class="label text-error text-sm">{$errors.sunriseOffset}</label>
                        {/if}
                        <p class="text-xs text-base-content/60 mt-1">
                            Negative values represent minutes before sunrise (e.g., -30 = 30 minutes before)
                        </p>
                    </div>
                {/if}
            </div>
        {/if}

        <!-- Form Actions -->
        <div class="flex items-center justify-between pt-4 border-t border-base-300">
            <div class="flex items-center text-base-content/70">
                <Info size={16} class="mr-2" />
                <span class="text-sm">Changes will be applied immediately</span>
            </div>
            <div class="space-x-2">
                <button type="reset" class="btn btn-outline" disabled={$submitting}>Reset</button>
                <button type="submit" class="btn btn-primary" disabled={$submitting}>
                    {#if $submitting}
                        <span class="loading loading-spinner loading-xs"></span>
                        Saving...
                    {:else}
                        Save Changes
                    {/if}
                </button>
            </div>
        </div>
    </form>
</div>