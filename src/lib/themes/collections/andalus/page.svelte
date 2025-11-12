<script lang="ts">
  import type { AppDataResult } from "$lib/themes/interfaces/types";
  import Header from "./components/Header.svelte";
  import PrayerTable from "./components/PrayerTable.svelte";
  import CombinedDisplay from "./components/CombinedDisplay.svelte";
  import type { DefaultThemeSettings } from "./customization";
  import Next from "./components/Next.svelte";
  import backgroundDarkmode from "./assets/background_darkmode.png";
  
  // Import local fonts (includes all-fonts.css)
  import "./assets/fonts";
  
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
        showSeconds={data.apiData.localization.timeSettings.showSeconds}
      />
    </div>
    
    <!-- Arabic Quote below header -->
    <div class="arabic-quote-top">
      <p>لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَاا</p>
    </div>

    <!-- Body Section - Prayer Times Table -->
    <div class="body">
      <PrayerTable
        allPrayerTimes={legacyPrayerTimes}
        iqamahTimes={iqamahTimes}
        activePrayer={currentPrayer}
        nextPrayer={nextPrayer}
      />
    </div>

    <!-- Arabic Quote above next prayer -->
    <div class="arabic-quote-bottom">
      <p>إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا</p>
    </div>

    <!-- Next Prayer Section -->
    <div class="next-prayer-container">
        <Next
          nextText={interfaceText.next}
          nextPrayer={nextPrayer}
          nextPrayerTime={nextPrayer.time_readable}
          countdownText={countdownText || '--:--:--'}
        />
    </div>

    <!-- Footer with Masjid Logo -->
    <div class="footer">
      <img src="/src/lib/themes/collections/andalus/assets/masjid logo.png" alt="Masjid Logo" class="masjid-logo" />
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
    padding-top: 12vh;
    box-sizing: border-box;
  }

  .headers {
    width: 100%;
    height: auto;
  }
  
  /* Arabic Quote Styling */
  .arabic-quote-top, .arabic-quote-bottom {
    width: 100%;
    text-align: center;

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

  .arabic-quote-top {
    padding: 2vw 0;

    p {
      font-family: 'KFGQPC HafsEx1 Uthmanic Script', 'Hafs', 'Uthmanic HAFS', 'Traditional Arabic', 'Amiri', serif;
      font-size: 6vw;
      font-weight: 400;
      color: white;
      letter-spacing: 0.02em;
      line-height: 1.2;
    }
  }

  .arabic-quote-bottom {
    padding: 2vw 0;

    p {
      font-size: 5.5vw;
    }
  }
  
  .body { 
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 2vw;
  }
  
  .next-prayer-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .footer {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2vw 0;
  }

  .masjid-logo {
    height: 6.5vw;
    width: auto;
    filter: brightness(1.2);
  }
  
  /* ------------------ Grid System (portrait) ------------------*/
  @media (orientation: portrait) {
    .content-wrapper {
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: auto auto 3fr auto 1.5fr auto;
      gap: 0.2vh;
      grid-template-areas:
        "headers"
        "arabic-top"
        "body"
        "arabic-bottom"
        "next-prayer"
        "footer";
    }
    
    .headers { grid-area: headers; }
    .arabic-quote-top { grid-area: arabic-top; }
    .body { grid-area: body; }
    .arabic-quote-bottom { grid-area: arabic-bottom; }
    .next-prayer-container { grid-area: next-prayer; }
    .footer { grid-area: footer; }
  }


  /* Override component backgrounds - keep only essential ones */
  :global(.body_container) {
    background: transparent !important;
  }

  :global(header) {
    background: transparent !important;
  }
</style>