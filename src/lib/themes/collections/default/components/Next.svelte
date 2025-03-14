<script lang="ts">
  import type { PrayerTimeItem } from "$lib/themes/interfaces/types";
  // Props for the Next component
  let {
    nextText = 'Next',
    nextPrayer = null,
    nextPrayerTime = '--:--',
    countdownText = '--:--:--',
    isDefaultTheme
  } : {
    nextText: string,
    nextPrayer: PrayerTimeItem | null,
    nextPrayerTime: string,
    countdownText: string
    isDefaultTheme: boolean
  } = $props();
  
</script>

<div 
  class={`next_section fade ${isDefaultTheme 
    ? 'default_next_section' 
    : 'bg-primary/40 border-solid border-t border-l border-primary/10'}`}
>
  <div class="text-container backdrop-blur-sm">
    <p id="next_text" class="text-white opacity-90 tracking-wide">{nextText}...</p>
    <p id="next_prayer" class="text-white opacity-90 uppercase font-semibold tracking-wider">{nextPrayer ? nextPrayer.name : '--'}</p>
    <p id="next_prayer_time" class="text-white font-bold">{nextPrayerTime}</p>
    <p id="next_prayer_countdown" class="text-white opacity-95">{countdownText}</p>
  </div>
</div>

<style lang="scss">
.default_next_section {
  color: white;
  font-family: 'Arial', Helvetica, sans-serif;
  background-color: green;
}

/* Next Prayer Section Styles */
.next_section {
  text-align: center;
  font-size: 10vw; 
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  min-height: 100%;
  padding: 10px 0;
  position: relative;
  overflow: hidden;
}

.text-container {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 0 1rem;
}


.next_section p {
  margin: 0.1em 0;
  padding: 0;
  line-height: 1.1;
}

.next_section p:nth-child(1) {
  opacity: .9;
  font-size: 0.8em;
  margin-bottom: 0;
}

.next_section p:nth-child(2) {
  opacity: .9;
  text-transform: uppercase;
  margin-top: 0;
  margin-bottom: 0;
  letter-spacing: 0.05em;
}

.next_section p:nth-child(3) {
  font-size: 2.2em;
  font-weight: 700;
  margin-top: -0.05em;
  margin-bottom: -0.05em;
  letter-spacing: -0.02em;
}

.next_section p:nth-child(4) {
  font-size: 7vw;
  margin-top: 0;
}

/* Modern subtle overlay to ensure text readability */
.next_section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.25));
  z-index: 1;
  pointer-events: none;
}

/* Default theme doesn't need the overlay */
.default_next_section::before {
  background: none;
}

/* Keyframe Animation */
.fade {
  animation-name: fade;
  animation-duration: 2s;
}



/* Responsive adjustments for landscape mode */
@media (orientation: landscape) {
  .next_section {
    font-size: 10vh !important;
  }
  
  .next_section p:nth-child(3) {
    font-size: 2.2em !important;
  }
  
  .next_section p:nth-child(4) {
    font-size: 7vh !important;
  }
}
</style>