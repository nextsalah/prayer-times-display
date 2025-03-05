<script lang="ts">
  import type { AppDataResult } from "$lib/themes/interfaces/types";
  import Header from "./components/Header.svelte";
  import PrayerTable from "./components/PrayerTable.svelte";
  import Next from "./components/Next.svelte";
  import type { DefaultThemeSettings } from "./customization";
  
  let { data } : { data: AppDataResult<DefaultThemeSettings> } = $props();
  
  // Derived values
  const nextPrayer = $derived(data.prayerTimes.nextPrayer);
  const currentPrayer = $derived(data.prayerTimes.currentPrayer);
  const countdownText = $derived(data.prayerTimes.countdownText);
  const allPrayerTimes = $derived(data.prayerTimes.allPrayerTimes);
  
  // Interface text
  const interfaceText = $derived({
    prayer: data.apiData.localization?.language?.prayer || 'Prayer',
    begins: data.apiData.localization?.language?.begins || 'Begins',
    iqamah: data.apiData.localization?.language?.iqamah || 'Iqamah',
    next: data.apiData.localization?.language?.next || 'Next',
  });
  
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

<div class="container">
  <!-- Header Section -->
  <div class="headers">
    <Header 
      dateFormat={data.apiData.localization.dateSettings.dateFormat}
      timezone={data.apiData.localization.timeSettings.timezone}
      use24h={data.apiData.localization.timeSettings.use24Hour}
      showSeconds={data.apiData.localization.timeSettings.showSeconds}
    />
  </div>

  <!-- Body Section - Prayer Times Table -->
  <div class="body">
    <PrayerTable 
      allPrayerTimes={legacyPrayerTimes}
      iqamahTimes={iqamahTimes}
      prayer={interfaceText.prayer}
      begins={interfaceText.begins}
      iqamah={interfaceText.iqamah}
      activePrayer={currentPrayer}
      nextPrayer={nextPrayer}
    />
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
  
  <!-- Footer Section - Now outside the next-prayer container -->
  <div class="footer">
    <footer id="footer_text">{data.apiData.custom_settings.footer_text}</footer>
  </div>
</div>

<style lang="scss">
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
.headers {
  grid-area: headers;
  width: 100%;
}
/* ------------------ Grid System (portrait) ------------------*/
@media (orientation: portrait) {
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
    height: auto;
  }
}

/* ------------------ Grid System (Landscape) ------------------*/
@media (orientation: landscape) {
  .container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto 1fr auto;
    gap: 0;
    grid-template-areas:
      "headers headers"
      "body next-prayer"
      "footer footer";
  }
}

.body { 
  grid-area: body; 
  background-color: black;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.next-prayer-container { 
  grid-area: next-prayer; 
  background-color: green;
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

#footer_text { 
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  padding: 1rem 0;
  background-color: #f0f0f0;
  color: rgb(46, 46, 46);
  font-family: Arial, Helvetica, sans-serif;
}
</style>