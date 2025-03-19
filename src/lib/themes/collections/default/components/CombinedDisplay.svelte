<script lang="ts">
  import Next from "./Next.svelte";
  import { slide } from 'svelte/transition';
  import { onDestroy, onMount } from "svelte";
  import type { FileMetadata, PrayerTimeItem } from '$lib/themes/interfaces/types';
  
  let {
    images = [],
    slideDuration = 30000, // milliseconds
    nextText = "Next",
    nextPrayer,
    nextPrayerTime,
    countdownText
  }: {
    images: FileMetadata[],
    slideDuration: number,
    nextText: string,
    nextPrayer: PrayerTimeItem,
    nextPrayerTime: string,
    countdownText: string
  } = $props();
  
  // State
  let showNext = $state(false);
  let currentImageIndex = $state(0);
  let timerId = $state<number | null>(null);
  
  // Derived values
  const imageUrls = $derived(images.map(img => img.path || ''));
  const totalImages = $derived(imageUrls.length);
  
  let previousDuration = $state(slideDuration);
  let timerNeedsReset = $state(false);

  function startToggleTimer() {
    // Clear any existing timer
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    
    // Don't start if no images
    if (totalImages === 0) return;
    
    // Set a new timer
    timerId = window.setTimeout(() => {
      if (showNext) {
        // Switching from Next to Slideshow
        showNext = false;
        currentImageIndex = 0; // Reset to first slide when coming back to slideshow
      } else {
        if (currentImageIndex < totalImages - 1) {
          // Move to next slide
          currentImageIndex++;
        } else {
          // Move from last slide to Next
          showNext = true;
        }
      }
      startToggleTimer();
    }, slideDuration); // Using the prop directly
  }

  // This effect only monitors changes to props, not state
  $effect(() => {
    // Check if slideDuration changed
    if (slideDuration !== previousDuration) {
      previousDuration = slideDuration;
      timerNeedsReset = true;
    }
    
    // Check if we need to reset the image index
    if (currentImageIndex >= totalImages && totalImages > 0) {
      currentImageIndex = 0;
    }
  });
  
  // This effect handles the actual timer reset separately
  $effect(() => {
    if (timerNeedsReset) {
      timerNeedsReset = false;
      startToggleTimer();
    }
  });
  
  // Initial timer setup on mount
  onMount(() => {
    startToggleTimer();
  });
  
  function handleIndicatorClick(index: number) {
    if (index === totalImages) {
      // Last indicator is for Next prayer
      showNext = true;
    } else {
      // Other indicators are for slideshow images
      showNext = false;
      currentImageIndex = index;
    }
    
    // Restart timer
    startToggleTimer();
  }
  
  // Clean up on component destroy
  onDestroy(() => {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
  });
</script>

<div class="combined-container">
  {#if showNext}
    <div class="display-wrapper" in:slide={{ duration: 500, axis: 'x' }} out:slide={{ duration: 500, axis: 'x' }}>
      <Next
        nextText={nextText}
        nextPrayer={nextPrayer}
        nextPrayerTime={nextPrayerTime}
        countdownText={countdownText}
      />
    </div>
  {:else}
    <!-- Integrated slideshow directly instead of using a separate component -->
    <div class="display-wrapper slideshow-container" in:slide={{ duration: 500, axis: 'x' }} out:slide={{ duration: 500, axis: 'x' }}>
      {#if totalImages > 0}
        {#each imageUrls as url, i}
          <div class="slide" class:active={i === currentImageIndex}>
            <img src={url} alt="Slideshow image {i+1}" />
          </div>
        {/each}
      {:else}
        <div class="placeholder">No images available</div>
      {/if}
    </div>
  {/if}
  
  <!-- Only show indicators if we have at least one image -->
  {#if totalImages > 0}
    <div class="indicators">
      {#each Array(totalImages) as _, i}
        <button 
          class="indicator" 
          class:active={!showNext && currentImageIndex === i}
          onclick={() => handleIndicatorClick(i)}
          aria-label={`Go to slide ${i + 1}`}
        ></button>
      {/each}
      <!-- Next prayer indicator -->
      <button 
        class="indicator next-indicator" 
        class:active={showNext}
        onclick={() => handleIndicatorClick(totalImages)}
        aria-label="Show next prayer information"
      ></button>
    </div>
  {/if}
</div>

<style>
  .combined-container {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
  }
  
  .display-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  
  /* Slideshow styles */
  .slideshow-container {
    background-color: #1a1a1a;
  }
  
  .slide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 1s ease-in-out;
  }
  
  .slide.active {
    opacity: 1;
    z-index: 2;
  }
  
  .slide img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* Ensures image covers the entire container */
  }
  
  .placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #777;
    font-family: Arial, sans-serif;
  }
  
  /* Indicators */
  .indicators {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    z-index: 10;
    padding: 10px; /* Add padding to ensure indicators are visible */
  }
  
  .indicator {
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.4);
    border: none;
    padding: 0;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  @media (orientation: landscape) {
    .indicator {
      width: 0.6vh;
      height: 0.6vh;
    }
  }

  @media (orientation: portrait) {
    .indicator {
      width: 1.2vw;
      height: 1.2vw;
    }
  }
  
  .indicator.active {
    background-color: rgba(255, 255, 255, 0.9);
    transform: scale(1.2);
  }
  
  .next-indicator {
    background-color: rgba(230, 230, 255, 0.5);
  }
  
  .next-indicator.active {
    background-color: rgba(230, 230, 255, 0.9);
  }
</style>