<script lang="ts">
  import type { AppDataResult } from "$lib/themes/interfaces/types";
  import Header from "./components/Header.svelte";
  import PrayerTable from "./components/PrayerTable.svelte";
  import CombinedDisplay from "./components/CombinedDisplay.svelte";
  import type { DefaultThemeSettings } from "./customization";
  import Next from "./components/Next.svelte";
  
  let { data } : { data: AppDataResult<DefaultThemeSettings> } = $props();
  
  // Derived values
  const nextPrayer = $derived(data.prayerTimes.nextPrayer);
  const currentPrayer = $derived(data.prayerTimes.currentPrayer);
  const countdownText = $derived(data.prayerTimes.countdownText);
  const allPrayerTimes = $derived(data.prayerTimes.allPrayerTimes);

  // Theme selection
  const themeColor = $derived(data.apiData.custom_settings.theme_color || 'default');
  
  // Interface text
  const interfaceText = $derived({
    prayer: data.apiData.localization?.language?.prayer || 'Prayer',
    begins: data.apiData.localization?.language?.begins || 'Begins',
    iqamah: data.apiData.localization?.language?.iqamah || 'Iqamah',
    next: data.apiData.localization?.language?.next || 'Next',
  });
  
  // Image slideshow
  const images = $derived(data.apiData.custom_settings.name_file || []);
  const showSlideshow = $derived(images.length > 0);
  const slideshowDuration = $derived(data.apiData.custom_settings.slide_delay || 30); // in seconds
  
  // Get iqamah times from prayer times
  const iqamahTimes = $derived((() => {
    const times: { [key: string]: string } = {};
    allPrayerTimes.forEach(prayer => {
      if (prayer.showIqamah && prayer.iqamah_readable) {
        times[prayer.id] = prayer.iqamah_readable;
      }
    });
    
    return times;
  })());
  
  // For backward compatibility - format prayer times as in the original table component
  const legacyPrayerTimes = $derived((() => {
    // Find each prayer time by ID
    const findPrayer = (id: string) => allPrayerTimes.find(p => p.id === id);
    const fajr = findPrayer('fajr');
    const sunrise = findPrayer('sunrise');
    const dhuhr = findPrayer('dhuhr');
    const asr = findPrayer('asr');
    const maghrib = findPrayer('maghrib');
    const isha = findPrayer('isha');
    return {
      fajr_name: fajr?.name || "Fajr",
      fajr_time: fajr?.time_readable || "--:--",
      sunrise_name: sunrise?.name || "Sunrise",
      sunrise_time: sunrise?.time_readable || "--:--",
      dhuhr_name: dhuhr?.name || "Dhuhr",
      dhuhr_time: dhuhr?.time_readable || "--:--",
      asr_name: asr?.name || "Asr",
      asr_time: asr?.time_readable || "--:--",
      maghrib_name: maghrib?.name || "Maghrib",
      maghrib_time: maghrib?.time_readable || "--:--",
      isha_name: isha?.name || "Isha",
      isha_time: isha?.time_readable || "--:--"
    };
  })());
 
</script>

<!-- Landscape mode warning -->
<div class="landscape-warning">
  <p>Landscape mode is not supported</p>
  <p class="rotate-message">Please rotate your device to portrait mode</p>
</div>

<div class="container" data-theme={themeColor !== 'default' ? themeColor : undefined}>
  <!-- Header Section -->
  <div class="headers">
    <Header 
      dateFormat={data.apiData.localization.dateSettings.dateFormat}
      timezone={data.apiData.localization.timeSettings.timezone}
      use24h={data.apiData.localization.timeSettings.use24Hour}
      showSeconds={data.apiData.localization.timeSettings.showSeconds}
      languageCode={data.apiData.localization.language.language_code}
    />
  </div>

  <!-- Body Section - Prayer Times Table -->
  <div class="body">
    <PrayerTable 
      allPrayerTimes={legacyPrayerTimes}
      iqamahTimes={iqamahTimes}
      nextText={interfaceText.next}
      prayer={interfaceText.prayer}
      begins={interfaceText.begins}
      activePrayer={currentPrayer}
      nextPrayer={nextPrayer}
    />
  </div>

  <!-- Combined Next Prayer Section and Slideshow -->
  <div class="next-prayer-container">
    {#if showSlideshow}
      <CombinedDisplay
        images={images}
        slideDuration={slideshowDuration * 1000}
        nextText={interfaceText.next}
        nextPrayer={nextPrayer}
        nextPrayerTime={nextPrayer.time_readable}
        countdownText={countdownText || '--:--:--'}
      />
    {:else}
      <Next
        nextText={interfaceText.next}
        nextPrayer={nextPrayer}
        nextPrayerTime={nextPrayer.time_readable}
        countdownText={countdownText || '--:--:--'}
      />
    {/if}
  </div>
  
  <!-- Footer Section -->
  <div class="footer">
    <footer class="footer_text">
      {data.apiData.custom_settings.footer_text}
    </footer>
  </div>
</div>
<style lang="scss">
  /* Landscape mode warning - shown only in landscape */
  .landscape-warning {
    display: none;
  }
  
  @media (orientation: landscape) {
    .landscape-warning {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      background-color: #000;
      color: #fff;
      z-index: 9999;
      text-align: center;
      padding: 2rem;
      
      p {
        margin: 0;
        font-size: 3rem;
        font-weight: bold;
      }
      
      .rotate-message {
        margin-top: 1rem;
        font-size: 1.5rem;
        font-weight: normal;
        opacity: 0.8;
      }
    }
    
    .container {
      display: none;
    }
  }
  
  .container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    max-width: 100vw;
    max-height: 100vh;
    overflow: hidden;
  }
  
  /* ------------------ Grid System (Portrait Only) ------------------*/
  .container {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr) minmax(0, 1fr) auto;
    gap: 0;
    grid-template-areas:
      "headers"
      "body"
      "next-prayer"
      "footer";
  }

  .headers {
    grid-area: headers;
    width: 100%;
    height: auto;
  }
  
  .footer_text {
    font-size: 3.5vw;
    padding: 1.9vw 0;
  }
  
  .body { 
    grid-area: body; 
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  
  .next-prayer-container { 
    grid-area: next-prayer; 
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .footer {
    grid-area: footer;
    width: 100%;
  }
  
  .footer_text { 
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
    text-align: center;
    font-weight: bold;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

</style>