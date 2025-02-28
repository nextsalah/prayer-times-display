<script lang="ts">
    import { superForm } from 'sveltekit-superforms/client';
    import { 
        Clock, 
        AlarmCheck, 
        Lock, 
        Sunrise,
        CheckCircle,
        AlertCircle,
        ChevronDown
    } from 'lucide-svelte';
    
    let { data } = $props();
    
    // Type the form properly based on prayer type
    const { form, enhance, errors, submitting, message } = superForm(data.form, {
        resetForm: false,
        taintedMessage: 'You have unsaved changes. Are you sure you want to leave?',
    });
    
    // Helper for type-safe access to Fajr fields
    function isFajrCalculateFromSunrise() {
        if (!data.isFajr) return false;
        return ($form as any).calculateIqamahFromSunrise ?? false;
    }
    
    // Helper for type-safe binding to Fajr fields
    function updateFajrCalculateFromSunrise(value: boolean) {
        if (!data.isFajr) return;
        ($form as any).calculateIqamahFromSunrise = value;
    }
    
    // Helper for type-safe access to sunriseOffset
    function getFajrSunriseOffset() {
        if (!data.isFajr) return 0;
        return ($form as any).sunriseOffset ?? -30;
    }
    
    // Helper for type-safe binding to sunriseOffset
    function updateFajrSunriseOffset(value: number) {
        if (!data.isFajr) return;
        ($form as any).sunriseOffset = value;
    }
    
    // Helper for type-safe access to sunrise offset errors
    function getSunriseOffsetError() {
        if (!data.isFajr) return null;
        return ($errors as any).sunriseOffset;
    }
    
    // Ensure valid default value for fixedTime
    $effect(() => {
        if (!$form.isFixed && (!$form.fixedTime || $form.fixedTime === "")) {
            $form.fixedTime = "00:00";
        }
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
    
    // Time formatting utility
    function formatTime(time: string): string {
        try {
            const [hours, minutes] = time.split(':').map(Number);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        } catch (e) {
            return time;
        }
    }
    
    
    // Generate example prayer and iqamah times for visualization
    let baseTime = $state("6:00");
    let calculatedTime = $state("");
    let iqamahTime = $state("");
    
    // Prayer time maps for visualization
    const prayerDefaultTimes = {
        fajr: "5:15",
        dhuhr: "12:30",
        asr: "15:45",
        maghrib: "18:20",
        isha: "20:00"
    };
    
    // Sunrise time for Fajr visualization
    let sunriseTime = $state("7:00");
    
    // Advanced settings panel state
    let advancedSettingsOpen = $state(false);
    
    // Update visualizer times whenever form values change
    $effect(() => {
        try {
            // Set base time based on prayer
            baseTime = prayerDefaultTimes[data.prayerName] || "6:00";
            
            // Split base time into hours and minutes
            let [hours, minutes] = baseTime.split(':').map(Number);
            
            // Apply offset if not using fixed time
            if (!$form.isFixed) {
                let newMinutes = minutes + ($form.offset || 0);
                let hourAdjust = Math.floor(newMinutes / 60);
                
                // Handle minute overflow/underflow
                if (newMinutes >= 60 || newMinutes < 0) {
                    newMinutes = ((newMinutes % 60) + 60) % 60;
                    hours += hourAdjust;
                    
                    // Keep hours in 24-hour format
                    hours = ((hours % 24) + 24) % 24;
                }
                
                calculatedTime = `${hours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
            } else {
                // Use fixed time
                calculatedTime = $form.fixedTime;
            }
            
            // Calculate Iqamah time
            if ($form.showIqamah) {
                // For Fajr with sunrise calculation
                if (data.isFajr && isFajrCalculateFromSunrise()) {
                    // Parse sunrise time
                    let [sunriseHours, sunriseMinutes] = sunriseTime.split(':').map(Number);
                    
                    // Apply sunrise offset
                    const offsetMinutes = getFajrSunriseOffset();
                    let totalMinutes = (sunriseHours * 60 + sunriseMinutes) + offsetMinutes;
                    
                    // Handle negative time
                    if (totalMinutes < 0) totalMinutes += 24 * 60;
                    
                    const iqamahHours = Math.floor(totalMinutes / 60) % 24;
                    const iqamahMinutes = totalMinutes % 60;
                    
                    iqamahTime = `${iqamahHours.toString().padStart(2, '0')}:${iqamahMinutes.toString().padStart(2, '0')}`;
                } else {
                    // Standard iqamah calculation: prayer time + iqamah delay
                    let [iqamahHours, iqamahMinutes] = calculatedTime.split(':').map(Number);
                    let totalMinutes = (iqamahHours * 60 + iqamahMinutes) + ($form.iqamah || 0);
                    
                    // Handle overnight
                    if (totalMinutes >= 24 * 60) totalMinutes -= 24 * 60;
                    
                    const newIqamahHours = Math.floor(totalMinutes / 60);
                    const newIqamahMinutes = totalMinutes % 60;
                    
                    iqamahTime = `${newIqamahHours.toString().padStart(2, '0')}:${newIqamahMinutes.toString().padStart(2, '0')}`;
                }
            } else {
                iqamahTime = "";
            }
        } catch (e) {
            console.error("Error calculating visualizer times:", e);
        }
    });
</script>

<div class="bg-base-100 p-4 md:p-8 rounded-xl border border-base-300 shadow-sm max-w-2xl mx-auto overflow-hidden">
    <!-- Header with visual enhancement -->
    <div class="flex flex-col gap-4 mb-8">
        <div class="flex items-center gap-3">
            <div class="bg-primary bg-opacity-10 p-2.5 rounded-lg">
                <Clock class="text-primary" size={22} />
            </div>
            <h2 class="text-2xl font-bold">{data.title} Settings</h2>
        </div>
        
        <!-- Time Preview Card -->
        <div class="bg-gradient-to-r from-base-200/40 to-base-200/70 backdrop-blur-sm rounded-xl p-4 md:p-5 mt-2 border border-base-300/50">
            <div class="flex flex-wrap justify-center items-center gap-4 md:gap-10">
                <div class="text-center">
                    <div class="text-xs uppercase tracking-wide text-base-content/60 mb-1.5">Prayer</div>
                    <div class="font-semibold text-xl">{formatTime(calculatedTime)}</div>
                </div>
                
                {#if $form.showIqamah}
                    <!-- Arrow connecting times -->
                    <div class="text-base-content/30">→</div>
                    
                    <div class="text-center">
                        <div class="text-xs uppercase tracking-wide text-base-content/60 mb-1.5">Iqamah</div>
                        <div class="font-semibold text-xl text-primary">{formatTime(iqamahTime)}</div>
                    </div>
                {/if}
                
                {#if data.isFajr}
                    {#if $form.showIqamah}
                        <div class="h-full w-px bg-base-content/10 mx-2 hidden md:block"></div>
                        <div class="w-full md:hidden border-t border-base-content/10 my-2"></div>
                        <div class="text-center">
                            <div class="text-xs uppercase tracking-wide text-base-content/60 mb-1.5">Sunrise</div>
                            <div class="font-semibold text-xl text-amber-500">{formatTime(sunriseTime)}</div>
                        </div>
                    {/if}
                {/if}
            </div>
        </div>
    </div>
  
    <!-- Alerts with improved animations -->
    {#if data.error || showSuccessMessage || showErrorMessage}
        <div class="mb-6 space-y-3">
            {#if data.error}
                <div class="alert alert-error shadow-sm">
                    <AlertCircle size={18} />
                    <span class="font-medium">{data.error}</span>
                </div>
            {/if}
            
            {#if showSuccessMessage && $message?.success}
                <div class="alert alert-success shadow-sm animate-in fade-in duration-300">
                    <CheckCircle size={18} />
                    <span class="font-medium">{$message.success}</span>
                </div>
            {/if}
            
            {#if showErrorMessage && $message?.error}
                <div class="alert alert-error shadow-sm animate-in fade-in duration-300">
                    <AlertCircle size={18} />
                    <span class="font-medium">{$message.error}</span>
                </div>
            {/if}
        </div>
    {/if}
  
    <form method="POST" use:enhance>
        <div class="card bg-base-200/20 border border-base-200 shadow-sm">
            <div class="card-body">
                <!-- Iqamah Settings Section -->
                <div class="flex items-center gap-3 mb-3">
                    <div class="shrink-0 bg-primary bg-opacity-10 p-1.5 rounded-md">
                        <AlarmCheck size={16} class="text-primary" />
                    </div>
                    <h3 class="text-base font-medium">Iqamah Configuration</h3>
                </div>
            
                <!-- Iqamah Toggle with improved styling -->
                <div class="form-control bg-base-100/50 p-3 rounded-lg border border-base-300/40">
                    <label class="label cursor-pointer justify-between">
                        <span class="flex items-center gap-2 text-base-content/80">
                            Show Iqamah Time
                        </span>
                        <input
                            type="checkbox"
                            name="showIqamah"
                            bind:checked={$form.showIqamah}
                            class="toggle toggle-primary"
                            disabled={$submitting}
                        />
                    </label>
                </div>
                
                <!-- Iqamah Delay Input - Improved layout -->
                {#if $form.showIqamah}
                    <div class="form-control mt-3 p-3 bg-base-100/30 rounded-lg border border-base-200">
                        <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <span class="text-base-content/70 whitespace-nowrap">Delay:</span>
                            <div class="flex flex-wrap items-center gap-2">
                                <input
                                    type="number"
                                    id="iqamah"
                                    name="iqamah"
                                    bind:value={$form.iqamah}
                                    class="input input-bordered input-sm w-20"
                                    min="0"
                                    max="60"
                                    disabled={$submitting || (data.isFajr && isFajrCalculateFromSunrise())}
                                />
                                <span class="text-sm text-base-content/70">minutes after prayer time</span>
                            </div>
                        </div>
                        {#if $errors.iqamah}
                            <div class="text-error text-sm mt-2 ml-1">{$errors.iqamah}</div>
                        {/if}
                    </div>
                {/if}
                
                <!-- Fajr-specific Settings with improved UI -->
                {#if data.isFajr && $form.showIqamah}
                    <div class="divider my-4"></div>
                    
                    <div class="flex items-center gap-3 mb-3">
                        <div class="shrink-0 bg-amber-500 bg-opacity-10 p-1.5 rounded-md">
                            <Sunrise size={16} class="text-amber-500" />
                        </div>
                        <h3 class="text-base font-medium">Fajr Special Settings</h3>
                    </div>
                    
                    <div class="form-control bg-base-100/50 p-3 rounded-lg border border-base-300/40">
                        <label class="label cursor-pointer justify-between">
                            <span class="flex items-center gap-2 text-base-content/80">
                                Calculate from Sunrise
                            </span>
                            <input
                                type="checkbox"
                                name="calculateIqamahFromSunrise"
                                checked={isFajrCalculateFromSunrise()}
                                onchange={(e) => updateFajrCalculateFromSunrise(e.currentTarget.checked)}
                                class="toggle toggle-primary"
                                disabled={$submitting}
                            />
                        </label>
                    </div>
                    
                    {#if isFajrCalculateFromSunrise()}
                        <div class="grid gap-4 mt-3 p-4 bg-base-100/30 rounded-lg border border-base-200">
                            <!-- Test Sunrise Time -->
                            <div class="form-control">
                                <label for="sunriseTime" class="label flex-wrap">
                                    <span class="label-text">Test with sunrise at</span>
                                    <span class="label-text-alt text-xs">For preview only</span>
                                </label>
                                <input
                                    type="time"
                                    id="sunriseTime"
                                    bind:value={sunriseTime}
                                    class="input input-bordered input-sm w-full"
                                />
                            </div>
                            
                            <!-- Minutes Before Sunrise -->
                            <div class="form-control">
                                <label for="sunriseOffset" class="label">
                                    <span class="label-text">Minutes before sunrise</span>
                                </label>
                                <input
                                    type="number"
                                    id="sunriseOffset"
                                    name="sunriseOffset"
                                    value={getFajrSunriseOffset()}
                                    oninput={(e) => updateFajrSunriseOffset(parseInt(e.currentTarget.value))}
                                    class="input input-bordered input-sm w-full"
                                    min="-120"
                                    max="0"
                                    disabled={$submitting}
                                />
                                {#if getSunriseOffsetError()}
                                    <div class="text-error text-sm mt-1">{getSunriseOffsetError()}</div>
                                {/if}
                            </div>
                        </div>
                    {/if}
                {/if}
                
                <!-- Advanced Settings -->
                <div class="divider my-4"></div>
                
                <!-- Improved collapsible section -->
                <div class="bg-base-100/50 rounded-lg border border-base-300/40">
                    <button 
                        type="button" 
                        class="w-full p-3 flex items-center justify-between text-left focus:outline-none"
                        onclick={() => advancedSettingsOpen = !advancedSettingsOpen}
                    >
                        <div class="flex items-center gap-2">
                            <div class="shrink-0 bg-secondary bg-opacity-10 p-1.5 rounded-md">
                                <Clock class="text-secondary" size={16} />
                            </div>
                            <span class="font-medium text-base-content/80">Advanced Prayer Time Settings</span>
                        </div>
                        <ChevronDown 
                            size={18} 
                            class="transition-transform duration-200" 
                            style={advancedSettingsOpen ? "transform: rotate(180deg)" : ""}
                        />
                    </button>
                    
                    {#if advancedSettingsOpen}
                        <div class="p-4 pt-2 border-t border-base-200">
                            <div class="form-control mt-2">
                                <label class="label cursor-pointer justify-between">
                                    <span class="flex items-center gap-2 text-base-content/80">
                                        <Lock size={16} class="text-secondary" />
                                        Use fixed time
                                    </span>
                                    <input
                                        type="checkbox"
                                        name="isFixed"
                                        bind:checked={$form.isFixed}
                                        class="toggle toggle-secondary toggle-sm"
                                        disabled={$submitting}
                                    />
                                </label>
                            </div>
                            
                            <div class="mt-3 p-3 bg-base-100/30 rounded-lg border border-base-200">
                                {#if $form.isFixed}
                                    <div class="form-control">
                                        <label for="fixedTime" class="label">
                                            <span class="label-text">Fixed time</span>
                                        </label>
                                        <input
                                            type="time"
                                            id="fixedTime"
                                            name="fixedTime"
                                            bind:value={$form.fixedTime}
                                            class="input input-bordered input-sm w-full"
                                            disabled={$submitting}
                                            required={$form.isFixed}
                                        />
                                        {#if $errors.fixedTime}
                                            <div class="text-error text-sm mt-1">{$errors.fixedTime}</div>
                                        {/if}
                                    </div>
                                {:else}
                                    <div class="form-control">
                                        <label for="offset" class="label">
                                            <span class="label-text">Time offset (minutes)</span>
                                        </label>
                                        <input
                                            type="number"
                                            id="offset"
                                            name="offset"
                                            bind:value={$form.offset}
                                            class="input input-bordered input-sm w-full"
                                            min="-60"
                                            max="60"
                                            disabled={$submitting}
                                        />
                                        {#if $errors.offset}
                                            <div class="text-error text-sm mt-1">{$errors.offset}</div>
                                        {/if}
                                    </div>
                                {/if}
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
        
        <!-- Form Actions with improved styling -->
        <div class="flex flex-col sm:flex-row sm:justify-end mt-6 gap-3">
            <button 
                type="reset" 
                class="btn btn-outline btn-sm w-full sm:w-auto px-4" 
                disabled={$submitting}
            >
                Reset
            </button>
            <button 
                type="submit" 
                class="btn btn-primary btn-sm w-full sm:w-auto px-6" 
                disabled={$submitting}
            >
                {#if $submitting}
                    <span class="loading loading-spinner loading-xs"></span>
                    Saving...
                {:else}
                    Save Changes
                {/if}
            </button>
        </div>
    </form>
</div>