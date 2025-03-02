<script lang="ts">
  import type { AppDataResult } from "$lib/themes/interfaces/types";
  import type { DefaultThemeSettings } from "./customization";
  
  let { data } : { data: AppDataResult<DefaultThemeSettings>} = $props();
  // Extract commonly used values for convenience
  const nextPrayer = $derived(data.prayerTimes.nextPrayer);
  const countdownText = $derived(data.prayerTimes.countdownText);
  const allPrayerTimes = $derived(data.prayerTimes.allPrayerTimes);
  const customSettings = $derived(data.apiData.custom_settings);
  
</script>


<main class="theme-default">
  <div class="container mx-auto p-4">
    <header class="mb-6 text-center">
      <h1 class="text-2xl font-bold">Prayer Times</h1>
      {#if nextPrayer}
        <div class="next-prayer mt-2">
          <h2>Next Prayer: {nextPrayer.name}</h2>
          <p class="countdown text-xl">{countdownText || '--:--:--'}</p>
        </div>
      {/if}
    </header>
    
    <div class="prayer-times-list">
      {#if allPrayerTimes && allPrayerTimes.length}
        <div class="grid grid-cols-3 gap-4">
          {#each allPrayerTimes as prayer}
            <div class="prayer-card p-3 rounded-lg border {nextPrayer?.id === prayer.id ? 'border-primary bg-primary/10' : ''}">
              <h3 class="font-medium">{prayer.name}</h3>
              <p>{prayer.time_readable}</p>
              {#if prayer.showIqamah}
                <p class="text-sm opacity-80">Iqamah: {prayer.iqamah_readable}</p>
              {/if}
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-center">No prayer times available</p>
      {/if}
    </div>
    
    <footer class="mt-8 text-center">
      <p>{customSettings?.footer_text || 'Prayer Times Display'}</p>
    </footer>
  </div>
</main>
