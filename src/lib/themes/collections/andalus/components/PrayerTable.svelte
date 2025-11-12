<script lang="ts">
  import type { PrayerTimeItem } from "$lib/themes/interfaces/types";
  import sunriseIcon from "../assets/sunrise.png";

  // Types
  type PrayerConfig = {
    id: string;
    key: string;
    hasIqamah: boolean;
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
    { id: "fajr", key: "Fajr", hasIqamah: true },
    { id: "sunrise", key: "Sunrise", hasIqamah: false },
    { id: "dhuhr", key: "Dhuhr", hasIqamah: true },
    { id: "asr", key: "Asr", hasIqamah: true },
    { id: "maghrib", key: "Maghrib", hasIqamah: true },
    { id: "isha", key: "Isha", hasIqamah: true }
  ];

  // Props
  let {
      allPrayerTimes = {},
      iqamahTimes,
      activePrayer,
      nextPrayer
  }: {
      allPrayerTimes: any;
      iqamahTimes?: {[key: string]: string} | undefined | null;
      activePrayer: PrayerTimeItem;
      nextPrayer?: PrayerTimeItem;
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
    return activeId === id;
  };

  // Parse prayer times
  let prayerMap = $state<PrayerMapType>({});

  // Convert iqamah time to minutes offset
  const formatIqamahAsOffset = (iqamahTime: string | undefined): string | undefined => {
    if (!iqamahTime) return undefined;

    // If it's already in +X format, return as is
    if (iqamahTime.startsWith('+')) return iqamahTime.slice(1);

    // Common iqamah offset values (you can adjust these based on your data)
    const offsets: {[key: string]: string} = {
      '10': '10',
      '15': '15',
      '20': '20',
      '30': '30',
      '45': '45',
      '60': '60'
    };

    // Extract just the number if it's a time format
    const match = iqamahTime.match(/(\d+)/);
    if (match) {
      return offsets[match[1]] || match[1];
    }

    return iqamahTime;
  };

  $effect(() => {
    const newPrayerMap: PrayerMapType = {};

    if (Array.isArray(allPrayerTimes)) {
      // Handle array format
      PRAYERS.forEach(prayer => {
        const data = allPrayerTimes.find((p: any) => p.id === prayer.id) || {};
        newPrayerMap[prayer.key] = {
          name: data.name || prayer.key,
          time: data.time_readable || "--:--",
          iqamah: formatIqamahAsOffset(data.iqamah_readable)
        };
      });
    } else {
      // Handle legacy object format
      newPrayerMap["Fajr"] = {
        name: allPrayerTimes.fajr_name || "Fajr",
        time: allPrayerTimes.fajr_time || "--:--",
        iqamah: formatIqamahAsOffset(iqamahTimes?.fajr)
      };
      newPrayerMap["Sunrise"] = {
        name: allPrayerTimes.sunrise_name || "Sunrise",
        time: allPrayerTimes.sunrise_time || "--:--"
      };
      newPrayerMap["Dhuhr"] = {
        name: allPrayerTimes.dhuhr_name || "Dhuhr",
        time: allPrayerTimes.dhuhr_time || "--:--",
        iqamah: formatIqamahAsOffset(iqamahTimes?.dhuhr)
      };
      newPrayerMap["Asr"] = {
        name: allPrayerTimes.asr_name || "Asr",
        time: allPrayerTimes.asr_time || "--:--",
        iqamah: formatIqamahAsOffset(iqamahTimes?.asr)
      };
      newPrayerMap["Maghrib"] = {
        name: allPrayerTimes.maghrib_name || "Maghrib",
        time: allPrayerTimes.maghrib_time || "--:--",
        iqamah: formatIqamahAsOffset(iqamahTimes?.maghrib)
      };
      newPrayerMap["Isha"] = {
        name: allPrayerTimes.isha_name || "Isha",
        time: allPrayerTimes.isha_time || "--:--",
        iqamah: formatIqamahAsOffset(iqamahTimes?.isha)
      };
    }

    prayerMap = newPrayerMap;
  });

</script>

<div class="body_container" class:has-active={PRAYERS.some(prayer => isPrayerActive(prayer.id))}>
  <!-- Prayer Rows -->
  {#each PRAYERS as prayer}
    {@const isActive = isPrayerActive(prayer.id)}
    {@const data = prayerMap[prayer.key] || { name: prayer.key, time: "--:--" }}

    <section class="prayer_row" class:active={isActive}>
      <div class="prayer-name">
        {#if prayer.id === "sunrise"}
          <img src={sunriseIcon} alt="Sunrise" class="sunrise-icon" />
        {:else}
          {data.name}
        {/if}
      </div>

      <div class="prayer-time">
        {data.time}
      </div>

      <div class="iqamah-time">
        {#if prayer.hasIqamah && data.iqamah}
          +{data.iqamah}
        {:else}

        {/if}
      </div>
    </section>
  {/each}
</div>

<style lang="scss">
.body_container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: relative;
  background: transparent;
}

.prayer_row {
  display: flex;
  position: relative;
  transition: all 0.3s ease;
  flex: 1;
  background: transparent;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);

  &:first-child {
    border-top: none;
  }

  &:last-child {
    border-bottom: none;
  }

  &.active {
    .prayer-name,
    .prayer-time,
    .iqamah-time {
      color: #43FFC4;
      font-size: 5.5vw;
      font-weight: 500;
    }
  }
}

.body_container.has-active {
  background: radial-gradient(ellipse 60% 80% at center, rgba(67, 255, 196, 0.06) 0%, rgba(67, 255, 196, 0.02) 50%, transparent 100%);
}

.prayer-name,
.prayer-time,
.iqamah-time {
  display: flex;
  align-items: center;
  padding: 5vw 1vw;
  font-size: 5vw;
  margin: 0;
  font-weight: 400;
  font-family: 'Barlow', sans-serif;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  flex: 1;
}

.prayer-name {
  justify-content: flex-start;
  padding-left: 4vw;
}

.prayer-time {
  justify-content: center;
}

.iqamah-time {
  justify-content: flex-end;
  padding-right: 4vw;
}

.sunrise-icon {
  width: 7vw;
  height: 7vw;
  object-fit: contain;
}

@media (orientation: landscape) {
  .prayer-name,
  .prayer-time,
  .iqamah-time {
    font-size: 2.8vh;
    padding: 2vh 1vh;
  }

  .prayer-name {
    padding-left: 3vh;
  }

  .iqamah-time {
    padding-right: 3vh;
  }

  .prayer_row.active {
    .prayer-name,
    .prayer-time,
    .iqamah-time {
      font-size: 3.2vh;
    }
  }

  .sunrise-icon {
    width: 5vh;
    height: 5vh;
  }
}
</style>