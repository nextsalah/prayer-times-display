<script lang="ts">
  import type { PrayerTimeItem } from "$lib/themes/interfaces/types";

  // Props for the Next component
  let {
    nextText = 'Next',
    nextPrayer = null,
    nextPrayerTime = '--:--',
    countdownText = '--:--:--'
  } : {
    nextText: string,
    nextPrayer: PrayerTimeItem | null,
    nextPrayerTime: string,
    countdownText: string
  } = $props();
</script>

<div class="next_section fade" id="slide_next_prayer">
  <p id="next_text">{nextText}...</p>
  <p id="next_prayer">{nextPrayer ? nextPrayer.name : '--'}</p>
  <p id="next_prayer_time">{nextPrayerTime}</p>
  <p id="next_prayer_countdown">{countdownText}</p>
</div>

<style lang="scss">
/* Next Prayer Section Styles */
.next_section {
  color: white;
  text-align: center;
  font-family: 'Arial', Helvetica, sans-serif;
  font-size: 10vw; 
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
