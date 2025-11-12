<script lang="ts">
  import type { PrayerTimeItem } from "$lib/themes/interfaces/types";

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

<div class="next_section">
  <div class="time-display">
    {countdownText}
  </div>
  <div class="prayer-label">
    {nextPrayer ? nextPrayer.name : '--'} {nextText}
  </div>
</div>

<style lang="scss">
.next_section {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: transparent;
  gap: 2vw;
}

.time-display {
  font-size: 18vw;
  font-weight: 400;
  color: #43FFC4;
  font-family: 'Big Shoulders Display', 'Impact', sans-serif;
  line-height: 1;
  letter-spacing: 0.02em;
  text-align: center;
}

.prayer-label {
  font-size: 4vw;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'Barlow Condensed', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: center;
}

@media (orientation: landscape) {
  .next_section {
    gap: 1vh;
  }

  .time-display {
    font-size: 12vh;
  }

  .prayer-label {
    font-size: 3vh;
  }
}
</style>