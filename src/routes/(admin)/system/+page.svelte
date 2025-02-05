<script lang="ts">
    import { onMount } from 'svelte';
    import { superForm } from 'sveltekit-superforms';
    import { Clock } from 'lucide-svelte';
    import { SystemSettingsSchema } from '$lib/db/schemas';
    import { zod } from 'sveltekit-superforms/adapters';
    let { data } = $props();
    console.log(data);
    const { form, enhance, submitting, delayed } = superForm(data.form, {
        validators: zod(SystemSettingsSchema),
        validationMethod: 'submit-only',
        delayMs: 300,
        resetForm: false,
        onResult: ({ result }) => {
            if (result.type === 'success') {
                console.log('Form submitted successfully');
            }
        }
    });
  
  // Reactive time and date strings
  let currentTime = $state('');
  let currentDate = $state('');
  let timeInterval: ReturnType<typeof setInterval>;

  function updateDateTime() {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
          hour: '2-digit',
          minute: '2-digit',
          second: $form.showSeconds ? '2-digit' : undefined,
          hour12: !$form.use24Hour
      };

      if ($form.showMilliseconds) {
          currentTime = now.toLocaleTimeString() + '.' + now.getMilliseconds().toString().padStart(3, '0');
      } else {
          currentTime = now.toLocaleTimeString(undefined, options);
      }

      const dateOptions: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: $form.dateFormat.includes('MMMM') ? 'long' : 
                $form.dateFormat.includes('MMM') ? 'short' : '2-digit',
          day: '2-digit'
      };
      
      currentDate = now.toLocaleDateString(undefined, dateOptions);
  }

  // Initialize and cleanup timer
  onMount(() => {
      updateDateTime();
      timeInterval = setInterval(updateDateTime, 1000);
      return () => clearInterval(timeInterval);
  });

  // Effect for timezone updates
  $effect(() => {
      if ($form.timezone === 'auto') {
          $form.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      }
      updateDateTime();
  });
</script>

<div class="container mx-auto p-4 max-w-4xl">
  <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
          <h2 class="card-title">
              <Clock class="h-6 w-6 mr-2" />
              Time & Date Settings
          </h2>
          <p class="text-base-content/70">Configure how time and date are displayed in the application</p>

          <form method="POST" use:enhance class="space-y-6">
              <!-- Timezone Selection -->
              <div class="form-control w-full max-w-xs">
                  <label class="label" for="timezone">
                      <span class="label-text">Timezone</span>
                  </label>
                  <select 
                      id="timezone"
                      class="select select-bordered" 
                      bind:value={$form.timezone}
                  >
                      <option value="UTC">UTC (Coordinated Universal Time)</option>
                      <option value="GMT">GMT (Greenwich Mean Time)</option>
                      <option value="EST">EST (Eastern Standard Time)</option>
                      <option value="PST">PST (Pacific Standard Time)</option>
                      <option value="IST">IST (India Standard Time)</option>
                      <option value="auto">Auto-detect from system</option>
                  </select>
              </div>

              <!-- Time Format Options -->
              <div class="form-control">
                  <label class="label" for="time-format">
                      <span class="label-text">Time Display Options</span>
                  </label>
                  
                  <!-- 24 Hour Format -->
                  <label class="label cursor-pointer justify-start gap-4">
                      <input 
                          type="checkbox" 
                          class="toggle" 
                          bind:checked={$form.use24Hour}
                      />
                      <span class="label-text">Use 24-hour format</span>
                  </label>

                  <!-- Time<!-- Time Components -->
                    <div class="flex flex-col gap-2 mt-2">
                      <label class="label cursor-pointer justify-start gap-4">
                          <input 
                              type="checkbox" 
                              class="checkbox" 
                              bind:checked={$form.showSeconds}
                          />
                          <span class="label-text">Show seconds</span>
                      </label>
                      
                      <label class="label cursor-pointer justify-start gap-4">
                          <input 
                              type="checkbox" 
                              class="checkbox" 
                              bind:checked={$form.showMilliseconds}
                          />
                          <span class="label-text">Show milliseconds</span>
                      </label>
                  </div>
              </div>

              <!-- Date Format -->
              <div class="form-control w-full max-w-xs">
                  <label class="label" for="date-format">
                      <span class="label-text">Date Format</span>
                  </label>
                  <select 
                      id="date-format"
                      class="select select-bordered" 
                      bind:value={$form.dateFormat}
                  >
                      <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
                      <option value="DD MMM YYYY">DD MMM YYYY (31 Dec 2024)</option>
                      <option value="MMMM DD, YYYY">MMMM DD, YYYY (December 31, 2024)</option>
                  </select>
              </div>

              <!-- Preview Card -->
              <div class="card bg-base-200 mt-4">
                  <div class="card-body">
                      <h3 class="text-sm font-bold">Preview</h3>
                      <div class="space-y-2 text-sm opacity-70">
                          <p>Current time: {currentTime}</p>
                          <p>Current date: {currentDate}</p>
                          <p>Timezone: {$form.timezone}</p>
                      </div>
                  </div>
              </div>

              <!-- Submit Button -->
              <div class="mt-6">
                  <button 
                      class="btn btn-primary" 
                      disabled={$submitting}
                  >
                      {#if $submitting}
                          Saving...
                      {:else if $delayed}
                          Checking...
                      {:else}
                          Save Settings
                      {/if}
                  </button>
              </div>
          </form>
      </div>
  </div>
</div>