<script lang="ts">
  import type { AppDataResult } from '$lib/db/services/appDataService';
  import PrayerTimeCalculator from "$lib/themes/logic/prayertime_calculator";
  import { countdownToTextSubscribe, nextPrayerTimeSubscribe, allPrayerTimesSubscribe } from "$lib/themes/logic/prayertime_calculator";
  import type { DefaultThemeSettings } from "./customization";
  import type { PrayerTimeItem } from "$lib/themes/interfaces/types";
  import { onMount, onDestroy } from 'svelte';
  
  let { data } : { data: AppDataResult } = $props();

  const settings = data?.apiData?.custom_settings as DefaultThemeSettings || {};

  let prayerTimeCalculator: PrayerTimeCalculator | null = null;
  let nextPrayerTimeText = $state<string>("Loading next prayer...");
  let nextPrayerName = $state<string>("");
  let nextPrayerTime = $state<string>("");
  let countdownText = $state<string>("--:--:--");
  let currentDate = $state<string>(new Date().toLocaleDateString());
  let allPrayerTimes = $state<PrayerTimeItem[]>([]);
  
  // Format the date nicely
  function formatDate(date: Date): string {
      try {
          const options: Intl.DateTimeFormatOptions = {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
          };
          return date.toLocaleDateString(undefined, options);
      } catch (error) {
          console.error('Error formatting date:', error);
          return new Date().toLocaleDateString();
      }
  }
  
  // Format the time in 12 or 24 hour format based on settings
  function formatTime(timeStr: string): string {
      try {
          const is24Hour = data?.apiData?.settings?.timeFormat === '24h';
          
          if (!timeStr || timeStr === '--:--') return timeStr;
          
          const [hourStr, minuteStr] = timeStr.split(':');
          const hour = parseInt(hourStr, 10);
          const minute = minuteStr.padStart(2, '0');
          
          if (is24Hour) {
              return `${hour.toString().padStart(2, '0')}:${minute}`;
          } else {
              const period = hour >= 12 ? 'PM' : 'AM';
              const hour12 = hour % 12 || 12;
              return `${hour12}:${minute} ${period}`;
          }
      } catch (error) {
          console.error('Error formatting time:', error);
          return timeStr;
      }
  }

  onMount(() => {
      try {
          // Check if data is valid
          if (!data || !data.apiData || !data.apiData.prayertimes) {
              console.error('Invalid prayer time data:', data);
              nextPrayerTimeText = "Error loading prayer times";
              return;
          }
          
          // Log the prayer times we received to help with debugging
          console.log('Mounting page component with prayer times:', data.apiData.prayertimes.today);
          
          // Set current date
          currentDate = formatDate(new Date());
          
          // Initialize prayer time calculator
          prayerTimeCalculator = new PrayerTimeCalculator(data);

          // Subscribe to next prayer time updates
          const unsubscribeNextPrayerTime = nextPrayerTimeSubscribe((value) => {
              if (!value || value.id === 'none') {
                  nextPrayerTimeText = "No upcoming prayers found";
                  nextPrayerName = "";
                  nextPrayerTime = "";
              } else {
                  nextPrayerName = value.name;
                  nextPrayerTime = formatTime(value.time_readable);
                  nextPrayerTimeText = `Next prayer: ${value.name}`;
              }
          });

          // Subscribe to countdown updates
          const unsubscribeCountdown = countdownToTextSubscribe((value) => {
              countdownText = value;
          });
          
          // Subscribe to all prayer times updates
          const unsubscribeAllPrayerTimes = allPrayerTimesSubscribe((value) => {
              allPrayerTimes = value;
          });
          
          // Update date every minute
          const dateInterval = setInterval(() => {
              currentDate = formatDate(new Date());
          }, 60000);

          return () => {
              // Clean up subscriptions
              unsubscribeNextPrayerTime();
              unsubscribeCountdown();
              unsubscribeAllPrayerTimes();
              clearInterval(dateInterval);
              
              // Clean up calculator
              if (prayerTimeCalculator) {
                  prayerTimeCalculator.destroy();
              }
          };
      } catch (error) {
          console.error('Error in page component mount:', error);
          nextPrayerTimeText = "Error initializing prayer times";
      }
  });

  onDestroy(() => {
      // Make sure to clean up the calculator
      if (prayerTimeCalculator) {
          prayerTimeCalculator.destroy();
      }
  });
  
  // Function to check if a prayer has passed
  function hasPrayerPassed(prayer: PrayerTimeItem): boolean {
      return prayerTimeCalculator?.prayerHasPassed(prayer) || false;
  }
  
  // Function to check if a prayer is active (next up)
  function isPrayerActive(prayer: PrayerTimeItem): boolean {
      return prayer.id === prayerTimeCalculator?.nextPrayerTime?.id;
  }
</script>

<section class="prayer-display">
  <div class="date-display">
      <p>{currentDate}</p>
  </div>
  
  <h1>
    <span class="text-4xl md:text-6xl lg:text-8xl font-bold relative">
      Prayer Times
    </span>
  </h1>

  <div class="next-prayer">
      {#if nextPrayerName && nextPrayerTime}
          <p class="prayer-name">{nextPrayerName} - {nextPrayerTime}</p>
          <p class="countdown">Countdown: <span class="countdown-value">{countdownText}</span></p>
      {:else}
          <p class="loading-message">Loading prayer times...</p>
      {/if}
  </div>
  
  {#if allPrayerTimes.length > 0}
      <div class="prayer-table">
          <h2 class="prayer-table-title">Today's Schedule</h2>
          <table>
              <thead>
                  <tr>
                      <th>Prayer</th>
                      <th>Time</th>
                  </tr>
              </thead>
              <tbody>
                  {#each allPrayerTimes.filter(p => p.id !== 'fajr_tomorrow') as prayer}
                      {@const passed = hasPrayerPassed(prayer)}
                      {@const active = isPrayerActive(prayer)}
                      <tr class:passed={passed} class:active={active}>
                          <td>{prayer.name}</td>
                          <td>{formatTime(prayer.time_readable)}</td>
                            <td>
                                {#if prayer.showIqamah && prayer.iqamah_readable}
                                    {formatTime(prayer.iqamah_readable)}
                                {:else}
                                    -
                                {/if}
                            </td>
                      </tr>
                  {/each}
              </tbody>
          </table>
      </div>
  {/if}
</section>

<style>
.prayer-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.date-display {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #666;
}

.next-prayer {
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: #f5f5f5;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

.prayer-name {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.countdown {
  font-size: 1.2rem;
}

.countdown-value {
  font-weight: bold;
  font-size: 1.4rem;
  color: #2563eb;
}

.loading-message {
  font-size: 1.2rem;
  color: #666;
}

.prayer-table {
  margin-top: 3rem;
  width: 100%;
  max-width: 600px;
}

.prayer-table-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

th, td {
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f8f8;
  font-weight: bold;
}

tr.passed {
  opacity: 0.6;
}

tr.active {
  background-color: #e6f2ff;
  font-weight: bold;
}

@media (max-width: 640px) {
  th, td {
    padding: 0.75rem 0.5rem;
    font-size: 0.9rem;
  }
  
  .prayer-table {
    max-width: 100%;
  }
}
</style>