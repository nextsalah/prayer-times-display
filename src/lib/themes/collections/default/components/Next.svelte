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
  
  // Calculate urgency level based on countdown
  const urgencyLevel = $derived(getUrgencyLevel(countdownText));
  
  function getUrgencyLevel(timeString: string): 'normal' | 'approaching' | 'imminent' {
    if (timeString === '--:--:--') return 'normal';
    
    const parts = timeString.split(':');
    if (parts.length !== 3) return 'normal';
    
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    
    // Calculate total minutes remaining
    const totalMinutesRemaining = hours * 60 + minutes;
    
    if (totalMinutesRemaining <= 5) return 'imminent';
    if (totalMinutesRemaining <= 15) return 'approaching';
    return 'normal';
  }
</script>

<div class="next_section fade bg-primary/40 ">
  <div class="text-container backdrop-blur-sm">
    <p id="next_text" class="text-white opacity-90 tracking-wide">{nextText}...</p>
    <p id="next_prayer" class="text-white opacity-90 uppercase font-semibold tracking-wider">{nextPrayer ? nextPrayer.name : '--'}</p>
    <p id="next_prayer_time" class="text-white font-bold">{nextPrayerTime}</p>
    
    {#if urgencyLevel === 'normal'}
      <p id="next_prayer_countdown" class="text-white opacity-95">{countdownText}</p>
    {:else if urgencyLevel === 'approaching'}
      <p id="next_prayer_countdown" class="text-amber-200 font-semibold">{countdownText}</p>
      <div class="prayer-indicator approaching">15 minutes until prayer</div>
    {:else}
      <p id="next_prayer_countdown" class="text-red-200 font-bold animate-pulse">{countdownText}</p>
      <div class="prayer-indicator imminent">5 minutes - prepare now</div>
    {/if}
  </div>
</div>

<style lang="scss">
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
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); /* Added text shadow for better contrast */
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

/* Prayer time indicators */
.prayer-indicator {
  display: inline-block;
  margin-top: 0.5em;
  padding: 0.3em 0.8em;
  border-radius: 100px;
  font-size: 0.35em;
  font-weight: 500;
  text-shadow: none;
  color: white;
}

.prayer-indicator.approaching {
  background-color: rgba(245, 158, 11, 0.7);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
}

.prayer-indicator.imminent {
  background-color: rgba(239, 68, 68, 0.7);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  animation: pulse 2s infinite;
}

/* Modern subtle overlay to ensure text readability */
.next_section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.3)); /* Increased overlay opacity */
  z-index: 1;
  pointer-events: none;
}

/* Keyframe Animation */
.fade {
  animation-name: fade;
  animation-duration: 2s;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.9;
  }
  50% {
    opacity: 1;
  }
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
  
  .prayer-indicator {
    font-size: 0.3em;
  }
}
</style>