<script lang="ts">
  import Time from "$lib/themes/components/Time.svelte";
  import type { AppDataResult } from "$lib/themes/interfaces/types";
  import type { DefaultThemeSettings } from "./customization";
  
  // Fake data that will be replaced with real data
  const fakeData = {
    prayerTimes: {
      nextPrayer: "Dhuhr",
      countdownText: "01:23:45",
      allPrayerTimes: {
        "Fajr": "05:12",
        "Sunrise": "06:43",
        "Dhuhr": "12:30",
        "Asr": "15:45",
        "Maghrib": "18:21",
        "Isha": "19:52"
      }
    },
    apiData: {
      localization: {
        timeSettings: {
          timezone: "Europe/London",
          use24Hour: true,
          showSeconds: true
        },
        dateSettings: {
          dateFormat: "dddd, MMMM D YYYY"
        },
        language: {
          language_code: "en"
        }
      },
      custom_settings: {}
    }
  };
  
  // Use fake data for now, will be replaced with real data later
  let data = $state(fakeData as unknown as AppDataResult<DefaultThemeSettings>);
  
  // Derived values
  const nextPrayer = $derived(data.prayerTimes.nextPrayer);
  const countdownText = $derived(data.prayerTimes.countdownText);
  const allPrayerTimes = $derived(data.prayerTimes.allPrayerTimes);
  const customSettings = $derived(data.apiData.custom_settings);
  
  // Fake iqamah times (can be replaced with real data)
  const iqamahTimes = {
    "Fajr": "05:30",
    "Dhuhr": "13:00",
    "Asr": "16:15",
    "Maghrib": "18:25",
    "Isha": "20:15"
  };
</script>

<div class="container">
  <!-- Header Section -->
  <header>
    <div class="headers">
      <!-- Main Clock -->
      <p class="clock-display">
        <Time 
          mode="time" 
          as="span"
          timezone={data.apiData.localization.timeSettings.timezone} 
          use24h={data.apiData.localization.timeSettings.use24Hour} 
          showSeconds={data.apiData.localization.timeSettings.showSeconds}
          class="text-white"
        />
      </p>
      
      <!-- Date Display -->
      <p class="date-display">
        <Time 
          mode="date" 
          as="span"
          format={data.apiData.localization.dateSettings.dateFormat}
          locale={data.apiData.localization.language.language_code}
          class="text-white"
        />
      </p>
    </div>
  </header>

  <!-- Body Section - Prayer Times Table -->
  <div class="body">
    <div class="body_container">
      <!-- Table Header -->
      <section class="table_header">
        <h2>Prayer</h2>
        <h2>Begins</h2>
        <h2>Iqamah</h2>
      </section>

      <!-- Fajr -->
      <section class="prayer_times_today">
        <h2>Fajr</h2>
        <h2 class="prayer_time">{allPrayerTimes["Fajr"]}</h2>
        <h2 class="iqamah_time">{iqamahTimes["Fajr"]}</h2>
      </section>

      <!-- Sunrise -->
      <section class="prayer_times_today">
        <div id="sunrise-text">
          <span id="sunrise-span">Sunrise</span>
          <!-- Sunrise icon would go here -->
          <span class="sunrise-icon">☀️</span>
        </div>
        <p id="sunrise-time" class="sunrise-time-background_color">{allPrayerTimes["Sunrise"]}</p>
      </section>

      <!-- Dhuhr -->
      <section class="prayer_times_today">
        <h2>Dhuhr</h2>
        <h2 class="prayer_time">{allPrayerTimes["Dhuhr"]}</h2>
        <h2 class="iqamah_time">{iqamahTimes["Dhuhr"]}</h2>
      </section>

      <!-- Asr -->
      <section class="prayer_times_today">
        <h2>Asr</h2>
        <h2 class="prayer_time">{allPrayerTimes["Asr"]}</h2>
        <h2 class="iqamah_time">{iqamahTimes["Asr"]}</h2>
      </section>

      <!-- Maghrib -->
      <section class="prayer_times_today">
        <h2>Maghrib</h2>
        <h2 class="prayer_time">{allPrayerTimes["Maghrib"]}</h2>
        <h2 class="iqamah_time">{iqamahTimes["Maghrib"]}</h2>
      </section>

      <!-- Isha -->
      <section class="prayer_times_today">
        <h2>Isha</h2>
        <h2 class="prayer_time">{allPrayerTimes["Isha"]}</h2>
        <h2 class="iqamah_time">{iqamahTimes["Isha"]}</h2>
      </section>
    </div>
  </div>

  <!-- Footer Section - Next Prayer -->
  <footer class="footer footer_container">
    <div class="next_section fade" id="slide_next_prayer">
      <p id="next_text">Next...</p>
      <p id="next_prayer">{nextPrayer}</p>
      <p id="next_prayer_time">{allPrayerTimes[nextPrayer]}</p>
      <p id="next_prayer_countdown">{countdownText}</p>
    </div>
    <p id="footer_text">Please, turn off your phones</p>
  </footer>
</div>

<style>
:global(body) {
  margin: 0;
  padding: 0;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
}

:global(html) {
  margin: 0;
  padding: 0;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

* {
  margin: 0;
  padding: 0;
  border: 0;
  outline: 0;
  box-sizing: border-box;
  cursor: none;
  overflow: hidden;
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

/* ------------------ Grid System (portrait) ------------------*/
@media (orientation: portrait) {
  .container {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr;
    gap: 0;
    grid-template-areas:
      "headers"
      "body"
      "footer";
  }

  #next_text {
    padding-top: 2% !important;
  }
  
  .next_section p:nth-child(4) {
    padding-bottom: 2% !important;
  }
}

/* ------------------ Grid System (Landscape) ------------------*/
@media (orientation: landscape) {
  .container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr auto;
    grid-auto-flow: row;
    gap: 0;
    grid-template-areas:
      "headers headers"
      "body footer";
  }
  
  .headers {
    position: absolute !important;
    top: 50% !important;
    right: 50% !important;
    transform: translate(50%, -50%) !important;
  }
  
  .clock-display {
    font-size: 19vh !important; 
    padding-top: 2% !important;
  }

  .date-display {
    font-size: 6vh !important;
  }
  
  .table_header h2 {
    font-size: 5vh !important;
  }
  
  .prayer_times_today h2, .prayer_times_today p, #sunrise-span {
    font-size: 6vh !important;
  }
  
  .next_section {
    font-size: 10vh !important; 
  }
  
  .next_section p:nth-child(3) {
    font-size: 2.2em !important;
  }
  
  .next_section p:nth-child(4) {
    font-size: 7vh !important;
  }
  
  .footer_container {
    grid-template-rows: auto !important;
  }
  
  #footer_text {
    display: none !important;
  }
}

header { 
  grid-area: headers; 
  position: relative !important;
  width: 100%;
  height: 100%;
}

.body { 
  grid-area: body; 
  background-color: black;
  width: 100%;
  height: 100%;
}

.footer { 
  grid-area: footer; 
  background-color: green;
  width: 100%;
  height: 100%;
}

/* ------------------ Headers ------------------*/
.headers {
  width: 100%;
}

.clock-display, .date-display {
  text-align: center;
  color: rgb(46, 46, 46);
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold;
  display: block;
  width: 100%;
  margin: 0;
  padding: 0;
}

.clock-display {
  line-height: 90%;
  font-size: 22.5vw;
  padding-top: 4%;
}

.date-display {
  font-size: 7.5vw;
  padding-bottom: 1%;
}

/* ------------------ Body ------------------*/
.body_container {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto auto auto auto auto;
  gap: 0;
}

.body_container section {
  border-bottom: 0.3px solid black;
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
  flex: 1;
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

.prayer_times_today {
  display: flex;
  justify-content: center;
  overflow: hidden;
}

.prayer_times_today h2 {
  flex: 1;
  display: flex;
  justify-content: center;
  align-self: center;
  padding: 1.5% 0;
  font-size: 7vw;
  padding-left: 1%;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 550;
  color: white;
  overflow: hidden;
  margin: 0;
}

#sunrise-text {
  flex: 1 1 33.333%;
  display: flex;
  align-items: center;
}

#sunrise-time {
  flex: 1 1 66.666%;  
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
}

#sunrise-span {
  padding-left: 1%;
  padding-right: 4%;
}

.sunrise-icon {
  font-size: 5vw;
}

#sunrise-time, #sunrise-text {
  padding: 1.5% 0%;
  font-size: 7vw;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 550;
  color: white;
  overflow: hidden;
}

.prayer_times_today h2:nth-child(1) {
  justify-content: left !important;
}

.prayer_time, .sunrise-time-background_color {
  background-color: #dd8500;
  border-right: 0.3px solid black;
}

.iqamah_time {
  background-color: #0066bf;
}

/* ------------------ Footer ------------------*/
.footer_container {
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr auto;
  grid-auto-rows: 1fr;
  gap: 0;
}

.next_section {
  color: white;
  text-align: center;
  font-family: 'Arial', Helvetica, sans-serif;
  font-size: 10vw; 
}

.next_section p:nth-child(1) {
  padding-top: 10%;
  opacity: .8;
  line-height: 90%;
  margin: 0;
}

.next_section p:nth-child(2) {
  opacity: .8;
  text-transform: uppercase;
  margin: 0;
}

.next_section p:nth-child(3) {
  font-size: 2.2em;
  font-weight: 700;
  line-height: 90%;
  margin: 0;
}

.next_section p:nth-child(4) {
  font-size: 7vw;
  padding-bottom: 10%;
  margin: 0;
}

#footer_text { 
  display: flex;
  background-color: white;
  text-align: center;
  font-weight: lighter;
  color: rgb(199, 0, 0);
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  font-size: 5vw;
  justify-content: center;
  padding: 1% 0px;
  align-items: center;
  word-spacing: 3px;
  overflow: hidden;
  margin: 0;
}

/* Keyframe */
.fade {
  animation-name: fade;
  animation-duration: 2s;
}

@keyframes fade {
  from {opacity: 0} 
  to {opacity: 1}
}
</style>