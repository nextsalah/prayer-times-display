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

<div class="next_section fade bg-primary/40">
  <div class="text-container backdrop-blur-sm">
    <div class="secondary-info">
      <p id="next_text" class="text-white">{nextText}...</p>
    </div>
    
    <div class="primary-info">
      <p id="next_prayer" class="text-white uppercase">{nextPrayer ? nextPrayer.name : '--'}</p>
      <p id="next_prayer_time" class="text-white font-bold">{nextPrayerTime}</p>
    </div>
    
    <div class="countdown-container">
      {#if urgencyLevel === 'normal'}
        <p id="next_prayer_countdown" class="text-white">{countdownText}</p>
      {:else if urgencyLevel === 'approaching'}
        <p id="next_prayer_countdown" class="text-amber-200 font-semibold">{countdownText}</p>
        <div class="prayer-indicator approaching">15 minutes until prayer</div>
      {:else}
        <p id="next_prayer_countdown" class="text-red-200 font-bold animate-pulse">{countdownText}</p>
        <div class="prayer-indicator imminent">5 minutes - prepare now</div>
      {/if}
    </div>
  </div>
</div>

<style lang="scss">

/* Next Prayer Section Styles */
.next_section {
  text-align: center;
  font-size: 10vmin; 
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  min-height: 100%;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', system-ui,  -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
}

.text-container {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 0.5vmin 0.3vmin;
  padding-bottom: 5vmin; /* Add bottom padding to avoid overlap with indicators */
  display: flex;
  flex-direction: column;
  gap: 1.6vmin;
  backdrop-filter: blur(10px);
}
@media ( orientation: landscape ) {
  .text-container {
    gap:  1.5vh;
  }
}

/* Group styles for better hierarchy */
.secondary-info {
  margin-bottom: -0.4em;
}

.primary-info {
  transform: scale(1.05);
  margin: 0.3em 0;
  position: relative;
}



.countdown-container {
  margin-top: 0.2em;
  position: relative;
}

/* Basic paragraph styling */
.next_section p {
  margin: 0;
  padding: 0;
  line-height: 1;
  font-weight: 500;
  /* Modern UI avoids heavy shadows */
  text-shadow: none;
}

/* "Next..." label - reduced emphasis */
.next_section .secondary-info p {
  opacity: .85;
  font-size: 0.7em;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

/* Prayer name - increased emphasis */
.primary-info p:nth-child(1) {
  font-size: 0.85em;
  font-weight: 800;
  letter-spacing: 0.07em;
  color: rgba(255, 255, 255, 0.98);
  text-transform: uppercase;
}

/* Prayer time - maximum emphasis */
.primary-info p:nth-child(2) {
  font-size: 2.5em;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: white;
  position: relative;
}


/* Countdown - medium emphasis */
.countdown-container p {
  font-size: 7vmin;
  font-weight: 700;
  margin-top: 0.1em;
  transition: color 0.3s ease;
  color: rgba(255, 255, 255, 0.9);
}

/* Modern prayer time indicators with minimal shadows */
.prayer-indicator {
  display: inline-block;
  margin-top: 0.5em;
  padding: 0.4em 1em;
  border-radius: 100px;
  font-size: 0.35em;
  font-weight: 600;
  color: white;
  /* Modern flat look with no shadows */
  box-shadow: none;
  transition: all 0.3s ease;
}

.prayer-indicator.approaching {
  background-color: rgba(245, 158, 11, 0.9);
  /* Use border instead of shadow for a more modern look */
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.prayer-indicator.imminent {
  background-color: rgba(239, 68, 68, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: pulse 2s infinite;
}

/* Modern subtle overlay with less gradient */
.next_section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* Flatter, more modern gradient */
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 1;
  pointer-events: none;
}

/* Simplified animations */
@keyframes pulse {
  0%, 100% {
    opacity: 0.9;
  }
  50% {
    opacity: 1;
  }
}

/* Ambient notification replaced with a simple accent line */
.countdown-container:has(> .prayer-indicator.imminent)::after {
  content: "";
  position: absolute;
  bottom: -1em;
  left: 25%;
  right: 25%;
  height: 0.3vmin;
  background-color: rgba(239, 68, 68, 0.6);
  border-radius: 0.3vmin;
  animation: pulse 2s infinite;
}

/* Responsive adjustments for landscape mode */
@media (orientation: landscape) {
  .next_section {
    font-size: 10vh !important;
  }
  
  .text-container {
    padding-bottom: 5vh; /* Adjusted padding for landscape */
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
  
  .countdown-container p {
    font-size: 7vh !important;
  }
}

/* Dark mode has cleaner background */
@media (prefers-color-scheme: dark) {
  .next_section::before {
    background-color: rgba(0, 0, 0, 0.4);
  }
}
</style>