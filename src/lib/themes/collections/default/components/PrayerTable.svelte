<script lang="ts">
  import type { PrayerTimeItem } from "$lib/themes/interfaces/types";
    import { CheckmarkIcon } from "svelte-french-toast";
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
      nextPrayer,
      isDefaultTheme = true
  }:{
      prayer: string,
      begins: string,
      iqamah?: string,
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
      iqamahTimes?: {  [key: string]: string } | undefined | null,
      activePrayer: PrayerTimeItem,
      nextPrayer: PrayerTimeItem,
      isDefaultTheme: boolean
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
  
  // Get the active prayer ID and next prayer ID
  const activeId = getPrayerId(activePrayer);
  const nextId = getPrayerId(nextPrayer);
  
  if (!activeId) return false;

  // Fix: Fajr cannot be active when Dhuhr is next
  if (standardId === PRAYER_IDS.FAJR && nextId === PRAYER_IDS.DHUHR) {
    return false;
  }
  
  return activeId === standardId;
};
  
  const isPrayerNext = (standardId: string): boolean => {
    // Get the next prayer ID
    const nextId = getPrayerId(nextPrayer);
    if (!nextId) return false;
    
    const isNext = nextId === standardId;
    return isNext;
  };

  // New function to determine if prayer has passed (is before active)
  const isPrayerPast = (standardId: string): boolean => {
  // If there's no active or next prayer, we can't determine
  const activeId = getPrayerId(activePrayer);
  const nextId = getPrayerId(nextPrayer);
  if (!activeId || !nextId) return false;
  
  // Order of prayers in a day
  const prayerOrder = [
    PRAYER_IDS.FAJR,
    PRAYER_IDS.SUNRISE,
    PRAYER_IDS.DHUHR,
    PRAYER_IDS.ASR,
    PRAYER_IDS.MAGHRIB,
    PRAYER_IDS.ISHA
  ];
  
  const activeIndex = prayerOrder.indexOf(activeId);
  const nextIndex = prayerOrder.indexOf(nextId);
  const prayerIndex = prayerOrder.indexOf(standardId);
  
  // Fix the issue with Fajr showing as active when Dhuhr is next
  // This happens when we're between Sunrise and Dhuhr, so Fajr should be past
  if (nextId === PRAYER_IDS.DHUHR && standardId === PRAYER_IDS.FAJR) {
    return true;
  }
  
  // If active prayer is Fajr and next is Sunrise, only Fajr isn't past
  if (activeId === PRAYER_IDS.FAJR && nextId === PRAYER_IDS.SUNRISE) {
    return standardId !== PRAYER_IDS.FAJR;
  }
  
  // Normal case: If prayer comes before active in the order, it's past
  return prayerIndex < activeIndex;
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

  // Helper function to determine text size class based on string length
  const getTextSizeClass = (text: string): string => {
    if (!text) return '';
    
    const length = text.length;
    if (length > 12) return 'text-xs';
    if (length > 9) return 'text-sm';
    if (length > 7) return 'text-md';
    return '';  // default size
  };

  // Updated function with isNext parameter
  const getPrayerNameClass = (odd = false, isActive = false, isNext = false, isPast = false) => {
    // Define base classes without the background gradient
    const baseClass = 'text-base-content border-solid border-b border-r border-base-300';
    
    // Only apply gradient if it's odd AND not active
    const bgClass = odd && !isActive
      ? 'bg-gradient-to-r from-base-200/60 to-base-100'
      : 'bg-base-100';
    
    // Add past prayer styling (reduced opacity)
    const pastClass = isPast ? 'opacity-60 line-through' : '';
    
    // Active styling takes precedence
    if (isActive) {
      return `${baseClass} bg-transparent border-none text-base-content`;
    }
    
    // Next prayer styling
    if (isNext) {
      return `${baseClass} ${bgClass} bg-transparent border-r-0 next-prayer-label`;
    }
    
    return `${baseClass} ${bgClass} ${pastClass}`;
  };
  
  // Helper functions for class names based on theme
  const getPrayerTimeClass = (withIqamah = false, isNext = false, isPast = false) => {
    const baseClasses = withIqamah 
      ? "prayer_time time-with-iqamah border-solid border-b border-base-300" 
      : "prayer_time full-width border-solid border-b border-base-300";
    
    // Add next prayer styling if applicable
    const nextClass = isNext ? " next-prayer-time" : "";
    
    // Add past prayer styling
    const pastClass = isPast ? " past-prayer-time" : "";
    
    return isDefaultTheme 
      ? baseClasses + nextClass + pastClass
      : `${baseClasses} border-solid border-b border-base-300 text-base-content${nextClass}${pastClass}`;
  };
  
  const getIqamahClass = (isNext = false, isPast = false) => {
    const nextClass = isNext ? " next-iqamah-time" : "";
    const pastClass = isPast ? " past-iqamah-time" : "";
    
    return isDefaultTheme 
      ? "iqamah_time" + nextClass + pastClass
      : "iqamah_time text-base-content border-solid border-b border-l border-base-300" + nextClass + pastClass;
  };
  
  const getSunriseClass = (isNext = false, isPast = false) => {
    const nextClass = isNext ? " next-prayer-time" : "";
    const pastClass = isPast ? " past-prayer-time" : "";
    
    return isDefaultTheme 
      ? "prayer_time full-width" + nextClass + pastClass
      : "prayer_time text-base-content full-width border-solid border-b border-base-300" + nextClass + pastClass;
  };
</script>

<div class={isDefaultTheme ? 'body_container default_background' : 'body_container bg-base-100'} >
  <!-- Table Header -->
  <section class={isDefaultTheme ? 'default_table_header table_header' : 'table_header bg-base-200 border-solid border-b border-t border-base-300'} >
    <h2 class={isDefaultTheme ? 'prayer-header-column default_h2' : 'prayer-header-column text-base-content border-solid border-r-2 border-base-300 font-semibold'}>{prayer}</h2> 
    <h2 class={isDefaultTheme ? 'begins-header-column default_h2' : 'begins-header-column text-base-content font-semibold'}>{begins}</h2>
  </section>

  <!-- Fajr -->
  <section class="prayer_times_today" 
    class:active={isPrayerActive(PRAYER_IDS.FAJR)} 
    class:default_h2={isDefaultTheme} 
    class:next={isPrayerNext(PRAYER_IDS.FAJR)}
    class:past={isPrayerPast(PRAYER_IDS.FAJR)}>
    <h2 class="prayer-column {getTextSizeClass(prayerMap['Fajr'].name)} {getPrayerNameClass(false, isPrayerActive(PRAYER_IDS.FAJR), isPrayerNext(PRAYER_IDS.FAJR), isPrayerPast(PRAYER_IDS.FAJR))}">
      {prayerMap["Fajr"].name}
      {#if isPrayerNext(PRAYER_IDS.FAJR)}
      <span class="status-indicator next-indicator">NEXT</span>
      {:else if isPrayerPast(PRAYER_IDS.FAJR)}
      <span class="status-indicator past-indicator"><CheckmarkIcon /></span>
      {/if}
    </h2>
    {#if prayerMap["Fajr"].iqamah}
      <h2 class={getPrayerTimeClass(true, isPrayerNext(PRAYER_IDS.FAJR), isPrayerPast(PRAYER_IDS.FAJR))}>{prayerMap["Fajr"].time}</h2>
      <h2 class={getIqamahClass(isPrayerNext(PRAYER_IDS.FAJR), isPrayerPast(PRAYER_IDS.FAJR))}>{prayerMap["Fajr"].iqamah}</h2>
    {:else}
      <h2 class={getPrayerTimeClass(false, isPrayerNext(PRAYER_IDS.FAJR), isPrayerPast(PRAYER_IDS.FAJR))}>{prayerMap["Fajr"].time}</h2>
    {/if}
  </section>

  <!-- Sunrise - Always full width since it never has iqamah -->
  <section class="prayer_times_today" 
    class:next={isPrayerNext(PRAYER_IDS.SUNRISE)} 
    class:default_h2={isDefaultTheme}
    class:past={isPrayerPast(PRAYER_IDS.SUNRISE)}>
    <h2 class="prayer-column {getTextSizeClass(prayerMap['Sunrise'].name)} {getPrayerNameClass(true, false, isPrayerNext(PRAYER_IDS.SUNRISE), isPrayerPast(PRAYER_IDS.SUNRISE))}">
      {prayerMap["Sunrise"].name} <span class="sunrise-icon"><Sunrise /></span>
      {#if isPrayerNext(PRAYER_IDS.SUNRISE)}
        <span class="status-indicator next-indicator">NEXT</span>
      {:else if isPrayerPast(PRAYER_IDS.SUNRISE)}
        <span class="status-indicator past-indicator"><CheckmarkIcon /></span>
      {/if}
    </h2>
    <h2 class={getSunriseClass(isPrayerNext(PRAYER_IDS.SUNRISE), isPrayerPast(PRAYER_IDS.SUNRISE))}>{prayerMap["Sunrise"].time}</h2>
  </section>

  <!-- Dhuhr -->
  <section class="prayer_times_today" 
    class:active={isPrayerActive(PRAYER_IDS.DHUHR)} 
    class:default_h2={isDefaultTheme} 
    class:next={isPrayerNext(PRAYER_IDS.DHUHR)}
    class:past={isPrayerPast(PRAYER_IDS.DHUHR)}>
    <h2 class="prayer-column {getTextSizeClass(prayerMap['Dhuhr'].name)} {getPrayerNameClass(false, isPrayerActive(PRAYER_IDS.DHUHR), isPrayerNext(PRAYER_IDS.DHUHR), isPrayerPast(PRAYER_IDS.DHUHR))}">
      {prayerMap["Dhuhr"].name}
      {#if isPrayerNext(PRAYER_IDS.DHUHR)}
        <span class="status-indicator next-indicator">NEXT</span>
      {:else if isPrayerPast(PRAYER_IDS.DHUHR)}
        <span class="status-indicator past-indicator"><CheckmarkIcon /></span>
      {/if}
    </h2>
    {#if prayerMap["Dhuhr"].iqamah}
      <h2 class={getPrayerTimeClass(true, isPrayerNext(PRAYER_IDS.DHUHR), isPrayerPast(PRAYER_IDS.DHUHR))}>{prayerMap["Dhuhr"].time}</h2>
      <h2 class={getIqamahClass(isPrayerNext(PRAYER_IDS.DHUHR), isPrayerPast(PRAYER_IDS.DHUHR))}>{prayerMap["Dhuhr"].iqamah}</h2>
    {:else}
      <h2 class={getPrayerTimeClass(false, isPrayerNext(PRAYER_IDS.DHUHR), isPrayerPast(PRAYER_IDS.DHUHR))}>{prayerMap["Dhuhr"].time}</h2>
    {/if}
  </section>

  <!-- Asr -->
  <section class="prayer_times_today" 
    class:active={isPrayerActive(PRAYER_IDS.ASR)} 
    class:default_h2={isDefaultTheme} 
    class:next={isPrayerNext(PRAYER_IDS.ASR)}
    class:past={isPrayerPast(PRAYER_IDS.ASR)}>
    <h2 class="prayer-column {getTextSizeClass(prayerMap['Asr'].name)} {getPrayerNameClass(true, isPrayerActive(PRAYER_IDS.ASR), isPrayerNext(PRAYER_IDS.ASR), isPrayerPast(PRAYER_IDS.ASR))}">
      {prayerMap["Asr"].name}
      {#if isPrayerNext(PRAYER_IDS.ASR)}
        <span class="status-indicator next-indicator">NEXT</span>
      {:else if isPrayerPast(PRAYER_IDS.ASR)}
        <span class="status-indicator past-indicator"><CheckmarkIcon /></span>
      {/if}
    </h2>
    {#if prayerMap["Asr"].iqamah}
      <h2 class={getPrayerTimeClass(true, isPrayerNext(PRAYER_IDS.ASR), isPrayerPast(PRAYER_IDS.ASR))}>{prayerMap["Asr"].time}</h2>
      <h2 class={getIqamahClass(isPrayerNext(PRAYER_IDS.ASR), isPrayerPast(PRAYER_IDS.ASR))}>{prayerMap["Asr"].iqamah}</h2>
    {:else}
      <h2 class={getPrayerTimeClass(false, isPrayerNext(PRAYER_IDS.ASR), isPrayerPast(PRAYER_IDS.ASR))}>{prayerMap["Asr"].time}</h2>
    {/if}
  </section>

  <!-- Maghrib -->
  <section class="prayer_times_today" 
    class:active={isPrayerActive(PRAYER_IDS.MAGHRIB)} 
    class:default_h2={isDefaultTheme} 
    class:next={isPrayerNext(PRAYER_IDS.MAGHRIB)}
    class:past={isPrayerPast(PRAYER_IDS.MAGHRIB)}>
    <h2 class="prayer-column {getTextSizeClass(prayerMap['Maghrib'].name)} {getPrayerNameClass(false, isPrayerActive(PRAYER_IDS.MAGHRIB), isPrayerNext(PRAYER_IDS.MAGHRIB), isPrayerPast(PRAYER_IDS.MAGHRIB))}">
      {prayerMap["Maghrib"].name}
      {#if isPrayerNext(PRAYER_IDS.MAGHRIB)}
        <span class="status-indicator next-indicator">NEXT</span>
      {:else if isPrayerPast(PRAYER_IDS.MAGHRIB)}
        <span class="status-indicator past-indicator"><CheckmarkIcon /></span>
      {/if}
    </h2>
    {#if prayerMap["Maghrib"].iqamah}
      <h2 class={getPrayerTimeClass(true, isPrayerNext(PRAYER_IDS.MAGHRIB), isPrayerPast(PRAYER_IDS.MAGHRIB))}>{prayerMap["Maghrib"].time}</h2>
      <h2 class={getIqamahClass(isPrayerNext(PRAYER_IDS.MAGHRIB), isPrayerPast(PRAYER_IDS.MAGHRIB))}>{prayerMap["Maghrib"].iqamah}</h2>
    {:else}
      <h2 class={getPrayerTimeClass(false, isPrayerNext(PRAYER_IDS.MAGHRIB), isPrayerPast(PRAYER_IDS.MAGHRIB))}>{prayerMap["Maghrib"].time}</h2>
    {/if}
  </section>

  <!-- Isha -->
  <section class="prayer_times_today" 
    class:active={isPrayerActive(PRAYER_IDS.ISHA)} 
    class:default_h2={isDefaultTheme} 
    class:next={isPrayerNext(PRAYER_IDS.ISHA)}
    class:past={isPrayerPast(PRAYER_IDS.ISHA)}>
    <h2 class="prayer-column {getTextSizeClass(prayerMap['Isha'].name)} {getPrayerNameClass(true, isPrayerActive(PRAYER_IDS.ISHA), isPrayerNext(PRAYER_IDS.ISHA), isPrayerPast(PRAYER_IDS.ISHA))}">
      {prayerMap["Isha"].name}
      {#if isPrayerNext(PRAYER_IDS.ISHA)}
      <span class="status-indicator next-indicator">NEXT</span>
      {:else if isPrayerPast(PRAYER_IDS.ISHA)}
      <span class="status-indicator past-indicator"><CheckmarkIcon /></span>
      {/if}
    </h2>
    {#if prayerMap["Isha"].iqamah}
      <h2 class={getPrayerTimeClass(true, isPrayerNext(PRAYER_IDS.ISHA), isPrayerPast(PRAYER_IDS.ISHA))}>{prayerMap["Isha"].time}</h2>
      <h2 class={getIqamahClass(isPrayerNext(PRAYER_IDS.ISHA), isPrayerPast(PRAYER_IDS.ISHA))}>{prayerMap["Isha"].iqamah}</h2>
    {:else}
      <h2 class={getPrayerTimeClass(false, isPrayerNext(PRAYER_IDS.ISHA), isPrayerPast(PRAYER_IDS.ISHA))}>{prayerMap["Isha"].time}</h2>
    {/if}
  </section>
</div>

<style lang="scss">
/* ------------------ Body ------------------*/
/* Set indicator colors based on theme */
:global(.default_background) {
  --indicator-color: rgba(0, 175, 0, 0.9);
  --next-indicator-color: #ff8c00;
  --active-bg-color: rgba(0, 175, 0, 0.15);
  --next-bg-color: rgba(255, 165, 0, 0.3);
  --past-indicator-color: rgba(150, 150, 150, 0.7);
}

.default_background{
  background-color: #2a2a2a; /* Background color for the gaps */
  gap: 2px;
}

.body_container {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(7, 1fr); /* Equal rows for all 7 sections */
}

.default_table_header {
  background-color: black !important;
  color: white !important;
}
.table_header { 
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
  text-transform: uppercase;
  text-align: center; 
  margin: 0;
}

.prayer-header-column {
  flex: 1;
  justify-content: flex-start;
  padding-left: 3% !important;
}

/* Begins header takes 2/3 */
.begins-header-column {
  flex: 2;
  justify-content: center;
}

/* Regular prayer column for the rows */
.prayer-column {
  flex: 1;
  justify-content: flex-start;
  align-items: center;
  padding-left: 3% !important;
  position: relative;
}

.time-column {
  flex: 2;
  justify-content: center;
}

.default_h2{
  font-family: Arial, Helvetica, sans-serif;
  color: white;
}

.prayer_times_today {
  display: flex;
  justify-content: center;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
  
  h2 {
    display: flex;
    align-items: center;
    padding: 1.6% 0;
    font-size: 6vw;
    font-weight: 550;
    overflow: hidden;
    margin: 0;
    transition: all 0.3s ease;
    
    /* Text size classes based on content length */
    &.text-xs {
      font-size: 3vw;  /* For very long text */
    }
    
    &.text-sm {
      font-size: 4vw; /* For medium-long text */
    }
    
    &.text-md {
      font-size: 5.5vw; /* For slightly longer than default text */
    }
  }
  
  /* Past prayer styling */
  &.past {
    opacity: 0.7;
    
    h2 {
      color: #888;
    }
  }
  
  /* Active prayer styling */
  &.active {
    position: relative;
    background-color: var(--active-bg-color, rgba(0, 175, 0, 0.15));
    box-shadow: 0 0 10px rgba(0, 175, 0, 0.3);
    z-index: 10;
    transform: scale(1.02);
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 6px;
      background-color: var(--indicator-color, rgba(0, 175, 0, 0.9));
      animation: pulseBorder 2s infinite;
      z-index: 2;
    }
  }

  /* Next prayer styling */
  &.next {
    position: relative;
    background-color: var(--next-bg-color, rgba(255, 165, 0, 0.3));
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 6px;
      background-color: var(--next-indicator-color, rgba(255, 165, 0, 0.9));
      z-index: 2;
    }
    
    h2 {
      font-weight: 600;
    }
  }
}

/* Status indicators */
.status-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.5em;
  font-weight: bold;
  border-radius: 4px;
  padding: 1px 4px;
  margin-left: 6px;
  line-height: 1;
}

.now-indicator {
  background-color: var(--indicator-color, rgba(0, 175, 0, 0.9));
  animation: pulse 2s infinite;
  border-radius: 50%;
  width: 10px;
  height: 10px;
  margin-left: 0;
  margin-left: 0.3em;
}

.next-indicator {
  background-color: var(--next-indicator-color, #ff8c00);
  color: white;
}


/* Animations */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 175, 0, 0.7);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(0, 175, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 175, 0, 0);
  }
}

@keyframes pulseBorder {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 175, 0, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 175, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 175, 0, 0);
  }
}

.prayer_time {
  flex: 2; /* Default is full-width (2 columns) */
  justify-content: center;
  
  &.time-with-iqamah {
    flex: 1; /* When paired with iqamah column */
  }
  
  &.past-prayer-time {
    opacity: 0.7;
    text-decoration: line-through;
  }
  
  &.next-prayer-time {
    font-weight: 600;
  }
}

.iqamah_time {
  flex: 1;
  justify-content: center;
  
  &.past-iqamah-time {
    opacity: 0.7;
    text-decoration: line-through;
  }
  
  &.next-iqamah-time {
    font-weight: 600;
  }
}

/* Active prayer label */
.active-prayer-label {
  position: relative;
  animation: glow 1.5s infinite alternate;
}

@keyframes glow {
  from {
    text-shadow: 0 0 2px rgba(0, 175, 0, 0.7);
  }
  to {
    text-shadow: 0 0 8px rgba(0, 175, 0, 0.9);
  }
}

/* Next prayer label */
.next-prayer-label {
  position: relative;
}

/* Sunrise icon styling */
.sunrise-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.3em;
  max-height: 90%;  
  height: 100%;
  :global(svg) {
    width: auto;
    max-height: 100%;
    fill: white;
  }
}

/* Responsive adjustments for landscape mode */
@media (orientation: landscape) {
  .table_header h2 {
    font-size: 5vh !important;
  }

  .prayer_times_today h2 {
    font-size: 5vh !important;
    
    &.text-xs {
      font-size: 3.5vh !important;
    }
    
    &.text-sm {
      font-size: 4vh !important;
    }
    
    &.text-md {
      font-size: 4.5vh !important;
    }
  }
  
  .sunrise-icon {
    :global(svg) {
      height: 0.95em;
      min-height: 20px;
    }
  }
  
  .status-indicator {
    font-size: 0.4em;
  }
}

/* Default theme will use these background colors */
:global(.default_background) {
  .prayer_time {
    background-color: #dd8500;
    border-right: 1px solid #b97000;
    
    &.next-prayer-time {
      background-color: #f0a732;
    }
    
    &.past-prayer-time {
      background-color: #a66400;
    }
  }
  
  .iqamah_time {
    background-color: #0066bf;
    border-left: 1px solid #004f92;
    
    &.next-iqamah-time {
      background-color: #0077d6;
    }
    
    &.past-iqamah-time {
      background-color: #004a8c;
    }
  }
}
</style>