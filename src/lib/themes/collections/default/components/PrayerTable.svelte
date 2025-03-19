<script lang="ts">
  import type { PrayerTimeItem } from "$lib/themes/interfaces/types";
    import { Check } from "lucide-svelte";
  import Sunrise from "../assets/sunrise.svelte";
  
  // Types
  type PrayerConfig = {
    id: string;
    key: string;
    isOdd: boolean;
    hasIqamah: boolean;
    showIcon?: boolean;
  };
  
  type PrayerData = {
    name: string;
    time: string;
    iqamah?: string;
  };
  
  type PrayerMapType = {
    [key: string]: PrayerData;
  };
  
  // Prayer configuration
  const PRAYERS: PrayerConfig[] = [
    { id: "fajr", key: "Fajr", isOdd: false, hasIqamah: true },
    { id: "sunrise", key: "Sunrise", isOdd: true, hasIqamah: false, showIcon: true },
    { id: "dhuhr", key: "Dhuhr", isOdd: false, hasIqamah: true },
    { id: "asr", key: "Asr", isOdd: true, hasIqamah: true },
    { id: "maghrib", key: "Maghrib", isOdd: false, hasIqamah: true },
    { id: "isha", key: "Isha", isOdd: true, hasIqamah: true }
  ];

  // Props
  let { 
      prayer = 'Namaz',
      begins = 'Počinje',
      allPrayerTimes = {},
      iqamahTimes,
      activePrayer,
      nextPrayer
  }: {
      prayer: string;
      begins: string;
      allPrayerTimes: any;
      iqamahTimes?: {[key: string]: string} | undefined | null;
      activePrayer: PrayerTimeItem;
      nextPrayer: PrayerTimeItem;
  } = $props();

  // Get prayer ID from various types
  const getPrayerId = (prayer: any): string | null => {
    if (!prayer) return null;
    if (typeof prayer === 'string') return prayer.toLowerCase();
    return prayer.id?.toLowerCase() || prayer.name?.toLowerCase() || null;
  };

  // Prayer state functions
  const isPrayerActive = (id: string): boolean => {
    if (id === "sunrise") return false; // Sunrise is never active
    const activeId = getPrayerId(activePrayer);
    const nextId = getPrayerId(nextPrayer);
    // Edge case: Fajr cannot be active when Dhuhr is next
    if (id === "fajr" && nextId === "dhuhr") return false;
    return activeId === id;
  };
  
  const isPrayerNext = (id: string): boolean => {
    return getPrayerId(nextPrayer) === id;
  };

  const isPrayerPast = (id: string): boolean => {
    const activeId = getPrayerId(activePrayer);
    const nextId = getPrayerId(nextPrayer);
    if (!activeId || !nextId) return false;
    
    const prayerOrder = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
    const activeIndex = prayerOrder.indexOf(activeId);
    const prayerIndex = prayerOrder.indexOf(id);
    
    // Edge cases
    if (nextId === "dhuhr" && id === "fajr") return true;
    if (activeId === "fajr" && nextId === "sunrise" && id !== "fajr") return true;
    
    return prayerIndex < activeIndex;
  };

  // Parse prayer times
  let prayerMap = $state<PrayerMapType>({});

  $effect(() => {
    const newPrayerMap: PrayerMapType = {};
    
    if (Array.isArray(allPrayerTimes)) {
      // Handle array format
      PRAYERS.forEach(prayer => {
        const data = allPrayerTimes.find((p: any) => p.id === prayer.id) || {};
        newPrayerMap[prayer.key] = {
          name: data.name || prayer.key,
          time: data.time_readable || "--:--",
          iqamah: data.iqamah_readable
        };
      });
    } else {
      // Handle legacy object format
      newPrayerMap["Fajr"] = { 
        name: allPrayerTimes.fajr_name || "Fajr", 
        time: allPrayerTimes.fajr_time || "--:--",
        iqamah: iqamahTimes?.fajr
      };
      newPrayerMap["Sunrise"] = { 
        name: allPrayerTimes.sunrise_name || "Sunrise", 
        time: allPrayerTimes.sunrise_time || "--:--"
      };
      newPrayerMap["Dhuhr"] = { 
        name: allPrayerTimes.dhuhr_name || "Dhuhr", 
        time: allPrayerTimes.dhuhr_time || "--:--",
        iqamah: iqamahTimes?.dhuhr
      };
      newPrayerMap["Asr"] = { 
        name: allPrayerTimes.asr_name || "Asr", 
        time: allPrayerTimes.asr_time || "--:--",
        iqamah: iqamahTimes?.asr
      };
      newPrayerMap["Maghrib"] = { 
        name: allPrayerTimes.maghrib_name || "Maghrib", 
        time: allPrayerTimes.maghrib_time || "--:--",
        iqamah: iqamahTimes?.maghrib
      };
      newPrayerMap["Isha"] = { 
        name: allPrayerTimes.isha_name || "Isha", 
        time: allPrayerTimes.isha_time || "--:--",
        iqamah: iqamahTimes?.isha
      };
    }
    
    prayerMap = newPrayerMap;
  });

  // Get text size based on length
  const getTextSize = (text: string): string => {
    const len = text?.length || 0;
    if (len > 12) return 'text-xs';
    if (len > 9) return 'text-sm';
    if (len > 7) return 'text-md';
    return '';
  };
</script>

<div class="body_container bg-base-100">
  <!-- Table Header -->
  <section class="table_header bg-base-200 border-solid border-b border-t border-base-300">
    <h2 class="prayer-header  text-base-content border-solid border-r-2 border-base-300 font-semibold">{prayer}</h2> 
    <h2 class="begins-header text-base-content font-semibold">{begins}</h2>
  </section>

  <!-- Prayer Rows -->
  {#each PRAYERS as prayer}
    {@const isActive = isPrayerActive(prayer.id)}
    {@const isNext = isPrayerNext(prayer.id)}
    {@const isPast = isPrayerPast(prayer.id)}
    {@const data = prayerMap[prayer.key] || { name: prayer.key, time: "--:--" }}
    
    <section class="prayer_row" class:active={isActive} class:next={isNext} class:past={isPast}>
      <h2 class="prayer-name {getTextSize(data.name)} text-base-content border-solid border-b border-r border-base-300 {!isActive && prayer.isOdd ? 'bg-gradient-to-r from-base-200/60 to-base-100' : !isActive ? 'bg-base-100' : ''}">
        {#if isPast}
          <span class="indicator past checkmark">
            <Check strokeWidth={3}/>
          </span>
        {/if}
        
        {data.name}
        
        {#if prayer.showIcon}
          <span class="icon"><Sunrise /></span>
        {/if}
        
        {#if isNext}
          <span class="indicator next">NEXT</span>
        {/if}
      </h2>
      
      {#if prayer.hasIqamah && data.iqamah}
        <h2 class="prayer-time with-iqamah text-base-content border-solid border-b border-base-300">
          {data.time}
        </h2>
        <h2 class="iqamah-time text-base-content border-solid border-b border-l border-base-300">
          {data.iqamah}
        </h2>
      {:else}
        <h2 class="prayer-time full-width text-base-content border-solid border-b border-base-300">
          {data.time}
        </h2>
      {/if}
    </section>
  {/each}
</div>

<style lang="scss">
:root {
  --active-color: #4caf50;
  --next-color: #ff8c00;
}

.body_container {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(7, 1fr);
}

.table_header { 
  display: flex;
  text-transform: uppercase;
   

  h2 {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1.5% 0;
    font-size: 5vw;
    margin: 0;
    font-weight: 800;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    text-shadow: 0 1px 1px rgba(0,0,0,0.1); /* Improved text readability */
  }
  
}

.prayer-header { 
  flex: 1; 
  justify-content: flex-start; 
  padding-left: 3% !important; 
}

.begins-header { 
  flex: 2; 
  justify-content: center; 
}

.prayer_row {
  display: flex;
  position: relative;
  transition: all 0.3s ease;
  
  h2 {
    display: flex;
    align-items: center;
    padding: 1.6% 0;
    font-size: 6vw;
    margin: 0;
    transition: all 0.3s ease;
    font-weight: 700; /* Increased font weight for better visibility */
    text-shadow: 0 1px 1px rgba(0,0,0,0.05); /* Improved text readability */
    
    &.text-xs { font-size: 3vw; }
    &.text-sm { font-size: 4vw; }
    &.text-md { font-size: 5.5vw; }
  }
  
  &.past { 
    opacity: 0.8; /* Increased from 0.7 for better visibility */
  }

  
  &.active {
    background-color: rgba(76, 175, 80, 0.15);
    box-shadow: 0 0 10px rgba(76, 175, 80, 0.2);
    z-index: 10;
    
    h2 {
      font-weight: 700;
      text-shadow: 0 1px 1px rgba(0,0,0,0.1); /* Enhanced visibility */
    }
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 6px;
      background-color: var(--active-color);
      animation: pulse 2s infinite;
      z-index: 2;
    }
  }

  &.next {
    background-color: rgba(255, 165, 0, 0.15);
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 6px;
      background-color: var(--next-color);
      z-index: 2;
    }
    
    h2 { 
      font-weight: 700; /* Increased from 600 to 700 */
      text-shadow: 0 1px 1px rgba(0,0,0,0.1); /* Enhanced visibility */
    }
  }
}

.prayer-name {
  flex: 1;
  justify-content: flex-start;
  padding-left: 3% !important;
  position: relative;
}

.prayer-time {
  flex: 2;
  justify-content: center;
  
  &.with-iqamah {
    flex: 1;
  }
  
  .next & { font-weight: 700; }
  .past & { text-decoration: line-through; }
}

.iqamah-time {
  flex: 1;
  justify-content: center;
  
  .next & { font-weight: 700; }
  .past & { text-decoration: line-through; }
}

.indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border-radius: 4px;
  
  &.next {
    background-color: var(--next-color);
    color: white;
    margin-left: 6px;
    padding: 1px 4px;
    font-size: 2.2vw; /* Responsive font size */
  }
  
  &.past { 
    margin-right: 6px;
    width: 1.1vw;
    height: 1.1vw;
  }
  &.checkmark{
    background-color: #4caf50;
    border-radius: 50%;
    color: white;
    padding: 2px;
    opacity: 0.9;
  }
  
}

.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.3em;
  max-height: 90%;
  height: 100%;
  
  :global(svg) {
    width: auto;
    max-height: 100%;
  }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
  100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
}

/* Responsive adjustments for landscape mode */
@media (orientation: landscape) {
  .table_header h2 { font-size: 5vh !important; }
  
  .prayer_row h2 {
    font-size: 5vh !important;
    
    &.text-xs { font-size: 3.5vh !important; }
    &.text-sm { font-size: 4vh !important; }
    &.text-md { font-size: 4.5vh !important; }
  }
  
  .icon :global(svg) {
    height: 0.95em;
    min-height: 20px;
  }
  
  .indicator {
    &.next {
      font-size: 2.2vh !important; /* Responsive font size for landscape */
    }
    
    &.past {
      font-size: 2.8vh !important; /* Responsive font size for landscape */
      
      :global(svg) {
        width: 2.8vh;
        height: 2.8vh;
      }
    }
  }
}
</style>