// src/routes/api/server-ip/+server.ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import dns from 'dns';
import ip from 'ip';

/**
 * Checks if the server has working internet connection
 */
async function isInternetConnected(connectionTimeout = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    const dnsTimeoutId = setTimeout(() => resolve(false), connectionTimeout);
    
    dns.promises.resolve('google.com')
      .then(() => {
        clearTimeout(dnsTimeoutId);
        resolve(true);
      })
      .catch(() => {
        clearTimeout(dnsTimeoutId);
        resolve(false);
      });
  });
}

/**
 * API endpoint to get server IP and internet status
 */
export const GET: RequestHandler = async () => {
  try {
    // Get local server's IPv4 address
    const localServerIp = ip.address();
    
    // Check if server has internet connection
    const internetConnected = await isInternetConnected();
    
    return json({
      server_address: localServerIp,
      internet_connection: internetConnected
    });
  } catch (error) {
    console.error('IP detection error:', error);
    
    return json({
      server_address: null,
      internet_connection: false
    }, { status: 500 });
  }
};