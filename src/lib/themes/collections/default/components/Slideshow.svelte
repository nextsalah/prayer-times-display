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
  const imageUrls = $derived(images.map(img => img.path || ''));
  const totalImages = $derived(imageUrls.length);
  
  // Start the slideshow
  function startSlideshow() {
    if (totalImages <= 1) return; // No slideshow needed if only one image
    
    timer = setInterval(() => {
      currentImageIndex = (currentImageIndex + 1) % totalImages;
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
    {#each imageUrls as url, i}
      <div class="slide" class:active={i === currentImageIndex}>
        <img src={url} alt="Slideshow image {i+1}" />
      </div>
    {/each}
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
    opacity: 0;
    transition: opacity 1s ease-in-out;
    
    &.active {
      opacity: 1;
      z-index: 2;
    }
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover; /* Ensures image covers the entire container */
    }
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
</style>