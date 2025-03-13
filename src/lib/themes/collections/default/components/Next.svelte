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

<div class={`next_section fade ${isDefaultTheme ? 'default_next_section' : 'bg-primary/20 text-primary-content shadow-lg border-solid border border-base-300 border-primary-focus'}`}>
  <p id="next_text" class={isDefaultTheme ? '' : 'text-primary-content opacity-80 tracking-wide'}>{nextText}...</p>
  <p id="next_prayer" class={isDefaultTheme ? '' : 'text-primary-content opacity-80 uppercase  font-semibold'}>{nextPrayer ? nextPrayer.name : '--'}</p>
  <p id="next_prayer_time" class={isDefaultTheme ? '' : 'text-primary-content font-bold '}>{nextPrayerTime}</p>
  <p id="next_prayer_countdown" class={isDefaultTheme ? '' : 'text-primary-content opacity-90'}>{countdownText}</p>
</div>

<style lang="scss">
.default_next_section {
  color: white;
  font-family: 'Arial', Helvetica, sans-serif;
  background-color: green;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
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
}

.next_section p {
  margin: 0.1em 0;
  padding: 0;
  line-height: 1.1;
}

.next_section p:nth-child(1) {
  opacity: .8;
  font-size: 0.8em;
  margin-bottom: 0;
}

.next_section p:nth-child(2) {
  opacity: .8;
  text-transform: uppercase;
  margin-top: 0;
  margin-bottom: 0;
}

.next_section p:nth-child(3) {
  font-size: 2.2em;
  font-weight: 700;
  margin-top: -0.05em;
  margin-bottom: -0.05em;
}

.next_section p:nth-child(4) {
  font-size: 7vw;
  margin-top: 0;
}

/* Keyframe Animation */
.fade {
  animation-name: fade;
  animation-duration: 2s;
}

@keyframes fade {
  from {opacity: 0} 
  to {opacity: 1}
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