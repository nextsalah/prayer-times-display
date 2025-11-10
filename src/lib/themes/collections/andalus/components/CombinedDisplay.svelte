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
  const imageUrls = $derived(images.map(img => img.url));
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
    console.log("Image URLs: ", imageUrls);
    console.log("Total Images: ", totalImages);
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
  <div class="display-area">
    {#if showNext}
      <div class="display-wrapper" transition:slide={{ duration: 500, axis: 'x' }}>
        <Next
          nextText={nextText}
          nextPrayer={nextPrayer}
          nextPrayerTime={nextPrayerTime}
          countdownText={countdownText}
        />
      </div>
    {:else}
      <!-- Integrated slideshow directly instead of using a separate component -->
      <div class="display-wrapper slideshow-container" transition:slide={{ duration: 500, axis: 'x' }}>
        {#if totalImages > 0}
          {#each imageUrls as url, i}
            {#if i === currentImageIndex}
              <div class="slide active" transition:slide={{ duration: 300, axis: 'x' }}>
                <img src={url} alt="Slideshow image {i+1}" />
              </div>
            {/if}
          {/each}
        {:else}
          <div class="placeholder">No images available</div>
        {/if}
      </div>
    {/if}
  </div>
  
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
  
  .display-area {
    position: relative;
    width: 100%;
    height: 100%;
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
    bottom: 0.2vmin; /* Moved higher up from the bottom */
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.5vmin;
    z-index: 100; /* Higher z-index to ensure it's above other content */
    padding: 0.7vmin;
    border-radius: 5vmin; /* Rounded corners */
  }
  
  .indicator {
    width: 0.7vmin;
    height: 0.7vmin;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.4);
    border: none;
    padding: 0;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  /*  on media query for portrait mode */
  @media (orientation: portrait) {
    .indicator {
      width: 1vmin;
      height: 1vmin;
    }
    .indicators {
      gap: 0.6vmin;
      bottom: 0.5vmin; /* Moved higher up from the bottom */

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