<script lang="ts">
  import type { AppDataResult } from "$lib/themes/interfaces/types";
  import Header from "./components/Header.svelte";
  import PrayerTable from "./components/PrayerTable.svelte";
  import CombinedDisplay from "./components/CombinedDisplay.svelte";
  import type { DefaultThemeSettings } from "./customization";
  import Next from "./components/Next.svelte";
  import backgroundDarkmode from "./assets/background_darkmode.png";
  
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
  <!-- Background Image -->
  <div class="background-image" style="background-image: url({backgroundDarkmode});"></div>
  
  <!-- Content Wrapper -->
  <div class="content-wrapper">
    <!-- Header Section with Clock and Date -->
    <div class="headers">
      <Header 
        dateFormat={data.apiData.localization.dateSettings.dateFormat}
        timezone={data.apiData.localization.timeSettings.timezone}
        use24h={data.apiData.localization.timeSettings.use24Hour}
        showSeconds={data.apiData.localization.timeSettings.showSeconds}
        languageCode={data.apiData.localization.language.language_code}
      />
      
      <!-- Arabic Quote below header -->
      <div class="arabic-quote">
        <p>لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا</p>
      </div>
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

    <!-- Next Prayer Section -->
    <div class="next-prayer-container">
      <!-- Arabic Quote above countdown -->
      <div class="arabic-quote-bottom">
        <p>إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا</p>
      </div>
      
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
    background-color: #0a0e1a;
  }
  
  /* Background Image Layer */
  .background-image {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 1;
    z-index: 0;
  }
  
  /* Content Wrapper */
  .content-wrapper {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr auto auto;
    gap: 0;
    grid-template-areas:
      "headers"
      "arabic-top"
      "body"
      "next-prayer"
      "footer";
  }

  .headers {
    grid-area: headers;
    width: 100%;
    height: auto;
  }
  
  /* Arabic Quote Styling */
  .arabic-quote, .arabic-quote-bottom {
    width: 100%;
    text-align: center;
    padding: 2vw 0;
    
    p {
      margin: 0;
      font-size: 4.5vw;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.85);
      font-family: 'Traditional Arabic', 'Amiri', 'Scheherazade', serif;
      letter-spacing: 0.05em;
      line-height: 1.4;
    }
  }
  
  .arabic-quote {
    padding-top: 0;
    padding-bottom: 3vw;
  }
  
  .arabic-quote-bottom {
    padding-top: 3vw;
    padding-bottom: 2vw;
    
    p {
      font-size: 4vw;
    }
  }
  
  .body { 
    grid-area: body; 
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 2vw;
  }
  
  .next-prayer-container { 
    grid-area: next-prayer; 
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .footer {
    grid-area: footer;
    width: 100%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.4), transparent);
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
    font-size: 3.5vw;
    padding: 2vw 0;
    color: rgba(255, 255, 255, 0.9);
  }

  /* Override component backgrounds to be transparent */
  :global(.body_container) {
    background: transparent !important;
  }
  
  :global(.table_header) {
    background: rgba(255, 255, 255, 0.08) !important;
    backdrop-filter: blur(10px);
  }
  
  :global(.prayer_row) {
    background: rgba(0, 0, 0, 0.2) !important;
    backdrop-filter: blur(5px);
  }
  
  :global(.prayer_row.active) {
    background: rgba(34, 197, 94, 0.15) !important;
  }
  
  :global(.prayer_row.next) {
    background: rgba(255, 165, 0, 0.15) !important;
  }
  
  :global(header) {
    background: transparent !important;
  }
  
  :global(.next_section) {
    background: transparent !important;
  }
  
  :global(.next_section::before) {
    background: rgba(0, 0, 0, 0.2) !important;
  }
</style>