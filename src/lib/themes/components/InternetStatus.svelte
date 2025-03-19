<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  // @ts-ignore
  import QRCode from 'qrcode';
  let showQrCode: { showQrCode: boolean} = $props();
  
  let serverIp: string | null = $state(null);
  let displayIp: string | null = $state(null);  // New variable for display purposes
  let isConnected: boolean = $state(false);
  let intervalId: ReturnType<typeof setInterval>;
  let qrCodeDataUrl: string | null = $state(null);
  
  // Check if we're in development mode
  const isDevelopment = import.meta.env.DEV;
  
  async function generateQrCode() {
    if (!serverIp || !showQrCode.showQrCode) return;
    
    try {
      // Append port 5000 in development mode
      const url = `http://${serverIp}${isDevelopment ? ':5000' : ''}`;
      qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 70, // Smaller QR code
        margin: 0, // No margin
      });
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      qrCodeDataUrl = null;
    }
  }
  
  async function checkInternetStatus() {
    try {
      const response = await fetch('/api/server-ip');
      const data = await response.json();
      serverIp = data.server_address;
      // Update display IP with port if in development
      displayIp = serverIp ? `${serverIp}${isDevelopment ? ':5000' : ''}` : null;
      isConnected = data.internet_connection;
      
      // Generate QR code after IP is updated
      await generateQrCode();
    } catch (error) {
      isConnected = false;
      serverIp = null;
      displayIp = null;
      qrCodeDataUrl = null;
      console.error('Failed to check internet status:', error);
    }
  }
  
  onMount(() => {
    // Check immediately on mount
    checkInternetStatus();
    
    // Then check every 5 seconds
    intervalId = setInterval(checkInternetStatus, 5000);
  });
  
  onDestroy(() => {
    if (intervalId) clearInterval(intervalId);
  });
  
  // Watch for showQrCode changes to regenerate QR code if needed
  $effect(() => {
    if (showQrCode.showQrCode && serverIp) {
      generateQrCode();
    } else {
      qrCodeDataUrl = null;
    }
  });
</script>

<div class="internet-status-container">
  {#if serverIp}
    {#if showQrCode.showQrCode && qrCodeDataUrl}
      <div class="qr-container">
        <img src={qrCodeDataUrl} alt="QR Code to access server" />
      </div>
    {/if}
    <div class="ip-status">
      <p>{displayIp}</p>
    </div>
  {:else}
    <p class="loading">...</p>
  {/if}
</div>

<style>
  .internet-status-container {
    position: fixed;
    bottom:  0.1vh;
    right:  0.1vw;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    z-index: 1000;
    opacity: 0.9;
  }
  
  .qr-container {
    margin-bottom:  0.2vh; /* Using viewport height for margin */
    background: white;
    padding:  0.5vw; /* Using viewport width for padding */
    box-shadow: none;
  }
  
  .qr-container img {
    display: block;
    height: 5.5vh; /* Using viewport height for QR code */
    width: auto;
  }
  
  .ip-status {
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 0.2vw 0.5vw; /* Using viewport width for padding */
    font-size: 1.5vw; /* Using viewport width for text */
    text-align: right;
  }
  
  .loading {
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 3px 5px;
    border-radius: 2px;
    font-size: 1.2vw; /* Using viewport width for text */
  }
  
  p {
    margin: 0;
  }
  
  /* Add responsive adjustments for different screen orientations */
  @media ( orientation: landscape) {
    .qr-container img {
      height: 5vh; /* Adjusted for landscape */
    }
    
    .ip-status {
      font-size: 1vh; /* Adjusted for landscape */
      padding: 0.2vh 0.5vh; /* Adjusted for landscape */
    }
    .qr-container {
      margin-bottom: 0.5vh; /* Adjusted for landscape */
      padding: 0.3vh; /* Adjusted for landscape */
    }
  }

</style>