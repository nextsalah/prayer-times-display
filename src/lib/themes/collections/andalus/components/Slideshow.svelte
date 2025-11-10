<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { FileMetadata } from '$lib/themes/interfaces/types';
  
  // Props
  let { 
    images = [],
    slideDuration = 30000 // 30 seconds in milliseconds
  } : {
    images: FileMetadata[],
    slideDuration?: number
  } = $props();
  
  // State
  let currentImageIndex = $state(0);
  let timer: ReturnType<typeof setInterval> | null = null;
  
  // Get the URLs for displaying images
  const imageUrls = $derived(images.map(img => img.url || ''));
  const totalImages = $derived(imageUrls.length);
  
  // Add a flag to handle image transition
  let isTransitioning = $state(false);
  let currentImageUrl = $state('');
  let nextImageUrl = $state('');
  
  // Modified function to handle smooth transition
  function startSlideshow() {
    if (totalImages <= 1) return; // No slideshow needed if only one image
    
    // Initialize first image
    currentImageUrl = imageUrls[currentImageIndex];
    
    timer = setInterval(() => {
      const nextIndex = (currentImageIndex + 1) % totalImages;
      nextImageUrl = imageUrls[nextIndex];
      
      // Start transition
      isTransitioning = true;
      
      // After transition completes, update current image
      setTimeout(() => {
        currentImageIndex = nextIndex;
        currentImageUrl = nextImageUrl;
        isTransitioning = false;
      }, 600); // Match the transition duration in CSS
    }, slideDuration);
  }
  
  // Clean up timer on component destroy
  onDestroy(() => {
    if (timer) clearInterval(timer);
  });
  
  // Initialize slideshow when component mounts
  onMount(() => {
    if (totalImages > 0) {
      startSlideshow();
    }
  });
  
  // Restart slideshow if images or duration changes
  $effect(() => {
    if (timer) clearInterval(timer);
    if (totalImages > 0) {
      startSlideshow();
    }
  });
</script>

<div class="slideshow-container">
  {#if totalImages > 0}
    <div class="slide current">
      <img src={currentImageUrl} alt="Current slideshow content" />
    </div>
    {#if isTransitioning}
      <div class="slide next">
        <img src={nextImageUrl} alt="Next slideshow content" />
      </div>
    {/if}
  {:else}
    <div class="placeholder">No images available</div>
  {/if}
</div>

<style lang="scss">
  .slideshow-container {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    background-color: #1a1a1a;
  }
  
  .slide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform: translateZ(0); /* Hardware acceleration hint */
    
    &.current {
      z-index: 1;
    }
    
    &.next {
      z-index: 2;
      animation: simpleFadeIn 600ms ease-in-out forwards;
    }
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: translateZ(0);
      will-change: transform;
    }
  }
  
  @keyframes simpleFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #777;
    font-family: Arial, sans-serif;
    padding: 2vmin;
  }
</style>