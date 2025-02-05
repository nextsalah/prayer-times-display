<!-- /routes/system/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
  
    let { data } = $props();
    
    let activeTab = $state('time');
    
    let timeSettings = $state({
      timezone: 'UTC',
      timeFormat: '24h',
      dateFormat: 'DD/MM/YYYY',
      showSeconds: true,
      showMilliseconds: false,
      use24Hour: true,
      timeStyle: 'medium' // 'short', 'medium', 'long'
    });

    // Reactive time and date strings
    let currentTime = $state('');
    let currentDate = $state('');
    
    // Update the time display every second
    let timeInterval: ReturnType<typeof setInterval>;

    function updateDateTime() {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: timeSettings.showSeconds ? '2-digit' : undefined,
        hour12: !timeSettings.use24Hour
      };

      if (timeSettings.showMilliseconds) {
        currentTime = now.toLocaleTimeString() + '.' + now.getMilliseconds().toString().padStart(3, '0');
      } else {
        currentTime = now.toLocaleTimeString(undefined, options);
      }

      const dateOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: timeSettings.dateFormat.includes('MMMM') ? 'long' : timeSettings.dateFormat.includes('MMM') ? 'short' : '2-digit',
        day: '2-digit'
      };
      
      currentDate = now.toLocaleDateString(undefined, dateOptions);
    }

    // Initialize and cleanup timer
    onMount(() => {
      updateDateTime();
      timeInterval = setInterval(updateDateTime, 1000);
      
      return () => {
        clearInterval(timeInterval);
      };
    });

    // Effect for timezone updates
    $effect(() => {
      if (timeSettings.timezone === 'auto') {
        timeSettings.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      }
      updateDateTime();
    });
</script>

<div class="container mx-auto p-4 max-w-4xl">
  <h1 class="text-2xl font-bold mb-6">System Settings</h1>

  <!-- Tab Navigation -->
  <div class="tabs tabs-boxed mb-4">
    <button 
      class="tab {activeTab === 'time' ? 'tab-active' : ''}" 
      onclick={() => activeTab = 'time'}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      Time Settings
    </button>
  </div>

  <!-- Time Settings Tab -->
  {#if activeTab === 'time'}
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          Time & Date Settings
        </h2>
        <p class="text-base-content/70">Configure how time and date are displayed in the application</p>

        <!-- Timezone Selection -->
        <div class="form-control w-full max-w-xs">
          <label class="label" for="timezone-select">
            <span class="label-text">Timezone</span>
          </label>
          <select 
            id="timezone-select"
            class="select select-bordered" 
            bind:value={timeSettings.timezone}
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
          
          <!-- 12/24 Hour Format -->
          <div class="flex flex-col gap-2 mb-4">
            <label class="label cursor-pointer justify-start gap-4">
              <input 
                type="checkbox" 
                class="toggle" 
                bind:checked={timeSettings.use24Hour}
              />
              <span class="label-text">Use 24-hour format</span>
            </label>
          </div>

          <!-- Time Components -->
          <div class="flex flex-col gap-2">
            <label class="label cursor-pointer justify-start gap-4">
              <input 
                type="checkbox" 
                class="checkbox" 
                bind:checked={timeSettings.showSeconds}
              />
              <span class="label-text">Show seconds</span>
            </label>
            
            <label class="label cursor-pointer justify-start gap-4">
              <input 
                type="checkbox" 
                class="checkbox" 
                bind:checked={timeSettings.showMilliseconds}
              />
              <span class="label-text">Show milliseconds</span>
            </label>
          </div>
        </div>

        <!-- Date Format -->
        <div class="form-control w-full max-w-xs">
          <label class="label" for="date-format-select">
            <span class="label-text">Date Format</span>
          </label>
          <select 
            id="date-format-select"
            class="select select-bordered" 
            bind:value={timeSettings.dateFormat}
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
              <p>Timezone: {timeSettings.timezone}</p>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="mt-6">
          <button class="btn btn-primary">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>