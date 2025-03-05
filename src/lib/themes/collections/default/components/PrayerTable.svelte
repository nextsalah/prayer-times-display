<script lang="ts">
  import type { PrayerTimeItem } from "$lib/themes/interfaces/types";
  import Sunrise from "../assets/sunrise.svelte";

  // Prayer ID mapping - used for language-independent identification
  const PRAYER_IDS = {
    FAJR: "fajr",
    SUNRISE: "sunrise",
    DHUHR: "dhuhr", 
    ASR: "asr",
    MAGHRIB: "maghrib",
    ISHA: "isha"
  };

  let { 
      // Localization strings
      prayer = 'Prayer',
      begins = 'Begins',
      // Prayer times data
      allPrayerTimes = {
          fajr_name: "Fajr",
          fajr_time: "05:12",
          sunrise_name: "Sunrise",
          sunrise_time: "06:30",
          dhuhr_name: "Dhuhr",
          dhuhr_time: "12:30",
          asr_name: "Asr",
          asr_time: "15:45",
          maghrib_name: "Maghrib",
          maghrib_time: "18:21",
          isha_name: "Isha",
          isha_time: "19:52"
      },
      
      // Optional iqamah times
      iqamahTimes,
      
      // Active and next prayer indicators - could be string or PrayerTimeItem object
      activePrayer,
      nextPrayer
  }:{
      prayer: string,
      begins: string,
      iqamah: string,
      allPrayerTimes: {
          fajr_name: string,
          fajr_time: string,
          sunrise_name: string,
          sunrise_time: string,
          dhuhr_name: string,
          dhuhr_time: string,
          asr_name: string,
          asr_time: string,
          maghrib_name: string,
          maghrib_time: string,
          isha_name: string,
          isha_time: string
      },
      iqamahTimes: {  [key: string]: string } | undefined | null,
      activePrayer: PrayerTimeItem,
      nextPrayer: PrayerTimeItem
  } = $props();

  // Helper function to safely get ID from prayer item
  const getPrayerId = (prayer: string | PrayerTimeItem | null | undefined): string | null => {
    if (!prayer) return null;
    
    // If it's a string, try to map it to a standard ID based on name
    if (typeof prayer === 'string') {
      // Convert to lowercase for case-insensitive comparison
      const lowerName = prayer.toLowerCase();
      
      // Check if it matches any ID directly
      for (const key in PRAYER_IDS) {
        const typedKey = key as keyof typeof PRAYER_IDS;
        if (lowerName === PRAYER_IDS[typedKey]) {
          return PRAYER_IDS[typedKey];
        }
      }
      
      // If not matched by ID, try to guess based on position in the day
      // This is a fallback mechanism and not ideal
      if (lowerName.includes('fajr') || lowerName.includes('sabah') || lowerName.includes('dawn')) {
        return PRAYER_IDS.FAJR;
      } else if (lowerName.includes('sunrise') || lowerName.includes('ishraq')) {
        return PRAYER_IDS.SUNRISE;
      } else if (lowerName.includes('dhuhr') || lowerName.includes('podne') || lowerName.includes('noon')) {
        return PRAYER_IDS.DHUHR;
      } else if (lowerName.includes('asr') || lowerName.includes('ikindi') || lowerName.includes('afternoon')) {
        return PRAYER_IDS.ASR;
      } else if (lowerName.includes('maghrib') || lowerName.includes('aksam') || lowerName.includes('sunset')) {
        return PRAYER_IDS.MAGHRIB;
      } else if (lowerName.includes('isha') || lowerName.includes('jacija') || lowerName.includes('night')) {
        return PRAYER_IDS.ISHA;
      }
      
      // Could not determine prayer ID from string
      console.warn('Could not map prayer name to ID:', prayer);
      return null;
    }
    
    // If it's an object with an id property, use that
    if (typeof prayer === 'object') {
      if (prayer.id) return prayer.id.toLowerCase();
      
      // If no ID, try to use the name to determine ID
      if (prayer.name) return getPrayerId(prayer.name);
    }
    
    return null;
  };

  // Function to determine if a prayer is active or next
  const isPrayerActive = (standardId: string): boolean => {
    // Sunrise should never be considered an active prayer
    if (standardId === PRAYER_IDS.SUNRISE) return false;
    
    // Get the active prayer ID
    const activeId = getPrayerId(activePrayer);
    if (!activeId) return false;
    
    return activeId === standardId;
  };
  
  const isPrayerNext = (standardId: string): boolean => {
    // Get the next prayer ID
    const nextId = getPrayerId(nextPrayer);
    if (!nextId) return false;
    
    const isNext = nextId === standardId;
    return isNext;
  };

  // Mapping for our data access - support both old format and new array format
  let prayerMap = $state({
      "Fajr": { name: "", time: "", iqamah: undefined as string | undefined },
      "Sunrise": { name: "", time: "" },
      "Dhuhr": { name: "", time: "", iqamah: undefined as string | undefined },
      "Asr": { name: "", time: "", iqamah: undefined as string | undefined },
      "Maghrib": { name: "", time: "", iqamah: undefined as string | undefined },
      "Isha": { name: "", time: "", iqamah: undefined as string | undefined }
  });

  $effect(() => {
      // Check if allPrayerTimes is an array (new format) or an object (old format)
      if (Array.isArray(allPrayerTimes)) {
          // Find each prayer by ID and map its properties
          const findPrayer = (id: string) => allPrayerTimes.find(p => p.id === id);

          const fajr = findPrayer('fajr');
          const sunrise = findPrayer('sunrise');
          const dhuhr = findPrayer('dhuhr');
          const asr = findPrayer('asr');
          const maghrib = findPrayer('maghrib');
          const isha = findPrayer('isha');

          prayerMap = {
              "Fajr": { 
                  name: fajr?.name || "Fajr", 
                  time: fajr?.time_readable || "--:--", 
                  iqamah: fajr?.iqamah_readable 
              },
              "Sunrise": { 
                  name: sunrise?.name || "Sunrise", 
                  time: sunrise?.time_readable || "--:--" 
              },
              "Dhuhr": { 
                  name: dhuhr?.name || "Dhuhr", 
                  time: dhuhr?.time_readable || "--:--", 
                  iqamah: dhuhr?.iqamah_readable 
              },
              "Asr": { 
                  name: asr?.name || "Asr", 
                  time: asr?.time_readable || "--:--", 
                  iqamah: asr?.iqamah_readable 
              },
              "Maghrib": { 
                  name: maghrib?.name || "Maghrib", 
                  time: maghrib?.time_readable || "--:--", 
                  iqamah: maghrib?.iqamah_readable 
              },
              "Isha": { 
                  name: isha?.name || "Isha", 
                  time: isha?.time_readable || "--:--", 
                  iqamah: isha?.iqamah_readable 
              }
          };
      } else {
          // Use the old format directly
          prayerMap = {
              "Fajr": { 
                  name: allPrayerTimes.fajr_name, 
                  time: allPrayerTimes.fajr_time, 
                  iqamah: iqamahTimes?.fajr 
              },
              "Sunrise": { 
                  name: allPrayerTimes.sunrise_name, 
                  time: allPrayerTimes.sunrise_time 
              },
              "Dhuhr": { 
                  name: allPrayerTimes.dhuhr_name, 
                  time: allPrayerTimes.dhuhr_time, 
                  iqamah: iqamahTimes?.dhuhr 
              },
              "Asr": { 
                  name: allPrayerTimes.asr_name, 
                  time: allPrayerTimes.asr_time, 
                  iqamah: iqamahTimes?.asr 
              },
              "Maghrib": { 
                  name: allPrayerTimes.maghrib_name, 
                  time: allPrayerTimes.maghrib_time, 
                  iqamah: iqamahTimes?.maghrib 
              },
              "Isha": { 
                  name: allPrayerTimes.isha_name, 
                  time: allPrayerTimes.isha_time, 
                  iqamah: iqamahTimes?.isha 
              }
          };
      }
  });
</script>

<div class="body_container">
<!-- Table Header -->
<section class="table_header">
  <h2 class="prayer-column">{prayer}</h2>
  <h2 class="time-column">{begins}</h2>
</section>

<!-- Fajr -->
<section class="prayer_times_today" class:active={isPrayerActive(PRAYER_IDS.FAJR)} class:next={isPrayerNext(PRAYER_IDS.FAJR)}>
  <h2 class="prayer-column">{prayerMap["Fajr"].name}</h2>
  {#if prayerMap["Fajr"].iqamah}
    <h2 class="prayer_time time-with-iqamah">{prayerMap["Fajr"].time}</h2>
    <h2 class="iqamah_time">{prayerMap["Fajr"].iqamah}</h2>
  {:else}
    <h2 class="prayer_time full-width">{prayerMap["Fajr"].time}</h2>
  {/if}
</section>

<!-- Sunrise - Always full width since it never has iqamah -->
<section class="prayer_times_today" class:next={isPrayerNext(PRAYER_IDS.SUNRISE)}>
  <h2 class="prayer-column">
    {prayerMap["Sunrise"].name} <span class="sunrise-icon"><Sunrise /></span>
  </h2>
  <h2 class="prayer_time sunrise-time-background_color full-width">{prayerMap["Sunrise"].time}</h2>
</section>

<!-- Dhuhr -->
<section class="prayer_times_today" class:active={isPrayerActive(PRAYER_IDS.DHUHR)} class:next={isPrayerNext(PRAYER_IDS.DHUHR)}>
  <h2 class="prayer-column">{prayerMap["Dhuhr"].name}</h2>
  {#if prayerMap["Dhuhr"].iqamah}
    <h2 class="prayer_time time-with-iqamah">{prayerMap["Dhuhr"].time}</h2>
    <h2 class="iqamah_time">{prayerMap["Dhuhr"].iqamah}</h2>
  {:else}
    <h2 class="prayer_time full-width">{prayerMap["Dhuhr"].time}</h2>
  {/if}
</section>

<!-- Asr -->
<section class="prayer_times_today" class:active={isPrayerActive(PRAYER_IDS.ASR)} class:next={isPrayerNext(PRAYER_IDS.ASR)}>
  <h2 class="prayer-column">{prayerMap["Asr"].name}</h2>
  {#if prayerMap["Asr"].iqamah}
    <h2 class="prayer_time time-with-iqamah">{prayerMap["Asr"].time}</h2>
    <h2 class="iqamah_time">{prayerMap["Asr"].iqamah}</h2>
  {:else}
    <h2 class="prayer_time full-width">{prayerMap["Asr"].time}</h2>
  {/if}
</section>

<!-- Maghrib -->
<section class="prayer_times_today" class:active={isPrayerActive(PRAYER_IDS.MAGHRIB)} class:next={isPrayerNext(PRAYER_IDS.MAGHRIB)}>
  <h2 class="prayer-column">{prayerMap["Maghrib"].name}</h2>
  {#if prayerMap["Maghrib"].iqamah}
    <h2 class="prayer_time time-with-iqamah">{prayerMap["Maghrib"].time}</h2>
    <h2 class="iqamah_time">{prayerMap["Maghrib"].iqamah}</h2>
  {:else}
    <h2 class="prayer_time full-width">{prayerMap["Maghrib"].time}</h2>
  {/if}
</section>

<!-- Isha -->
<section class="prayer_times_today" class:active={isPrayerActive(PRAYER_IDS.ISHA)} class:next={isPrayerNext(PRAYER_IDS.ISHA)}>
  <h2 class="prayer-column">{prayerMap["Isha"].name}</h2>
  {#if prayerMap["Isha"].iqamah}
    <h2 class="prayer_time time-with-iqamah">{prayerMap["Isha"].time}</h2>
    <h2 class="iqamah_time">{prayerMap["Isha"].iqamah}</h2>
  {:else}
    <h2 class="prayer_time full-width">{prayerMap["Isha"].time}</h2>
  {/if}
</section>
</div>

<style lang="scss">
/* ------------------ Body ------------------*/
.body_container {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(7, 1fr); /* Equal rows for all 7 sections */
  gap: 2px; /* Add small gap between rows */
  background-color: #2a2a2a; /* Background color for the gaps */
}

.body_container section:nth-child(odd) {
  background-color: #383838;
}

.body_container section:nth-child(even) {
  background-color: #3d3d3d;
}

.table_header { 
  background-color: black !important;
  display: flex;
  justify-content: center;
  text-transform: uppercase;
}

.table_header h2 {
  display: flex;
  justify-content: center;
  align-self: center;
  padding: 1.5% 0% 1.5% 0%;
  font-size: 5vw;
  color: white;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  text-transform: uppercase;
  text-align: center; 
  margin: 0;
}

.prayer-column {
  flex: 1;
  justify-content: flex-start;
  padding-left: 5% !important;
}

.time-column {
  flex: 2;
  justify-content: center;
}

.prayer_times_today {
  display: flex;
  justify-content: center;
  overflow: hidden;
  position: relative;
  
  h2 {
    display: flex;
    align-items: center;
    padding: 1.6% 0;
    font-size: 6vw;
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 550;
    color: white;
    overflow: hidden;
    margin: 0;
  }
  
  &.active {
    background-color: rgba(0, 128, 0, 0.15) !important; /* Subtle green */
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 4px;
      background-color: rgba(0, 128, 0, 0.7);
      z-index: 2;
    }
  }

  &.next {
    background-color: rgba(255, 165, 0, 0.3) !important; /* More subtle orange */
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 4px;
      background-color: #ff8c00;
      z-index: 2;
    }
    
    h2 {
      font-weight: 600;
      color: #fff; /* Ensure text is white */
    }
  }
}

.prayer_time {
  flex: 2; /* Default is full-width (2 columns) */
  justify-content: center;
  background-color: #dd8500;
  
  &.time-with-iqamah {
    flex: 1; /* When paired with iqamah column */
  }
}

.iqamah_time {
  flex: 1;
  justify-content: center;
  background-color: #0066bf;
}

.sunrise-time-background_color {
  background-color: #dd8500;
}

/* Sunrise icon styling */
.sunrise-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 95%;
  margin-left: 0.3em;
  
  :global(svg) {
    height: 0.95em;
    width: auto;
    min-height: 20px;
  }
}

/* Responsive adjustments for landscape mode */
@media (orientation: landscape) {
  .table_header h2 {
    font-size: 5vh !important;
  }

  .prayer_times_today h2 {
    font-size: 5vh !important;
  }
  
  .sunrise-icon {
    :global(svg) {
      height: 0.95em;
      min-height: 20px;
    }
  }
  
  /* No special treatment needed for next prayer in landscape mode */
}
</style>