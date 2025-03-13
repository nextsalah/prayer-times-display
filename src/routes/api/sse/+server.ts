import { produce } from 'sveltekit-sse';
import { sseService } from '$lib/server/sse/service';
import { logger } from '$lib/server/logger';

// SSE endpoint
export function POST() {
  return produce(
    async function start({ emit }) {
      // Generate unique ID
      const id = crypto.randomUUID();
      
      // Register client with the SSE service
      sseService.registerClient(id, emit);
      
      // Send connected confirmation
      sseService.sendStatus(id, 'connected');
      
      // Return cleanup function
      return function cleanup() {
        sseService.removeClient(id);
        logger.debug('SSE client disconnected:', id);
      };
    }
  );
}

// Expose endpoint to manually trigger events - useful for testing
export const GET = async ({ url }) => {
  const action = url.searchParams.get('action');
  const theme = url.searchParams.get('theme') || 'default';
  const message = url.searchParams.get('message') || 'Test notification';
  const level = url.searchParams.get('level') || 'info';
  
  switch (action) {
    case 'reload':
      sseService.reloadAllScreens();
      return new Response(`Triggered reload for ${sseService.getClientCount()} clients`);
    case 'theme':
      sseService.changeTheme(theme);
      return new Response(`Changed theme to ${theme} for ${sseService.getClientCount()} clients`);
    case 'notify':
      sseService.broadcastNotification(message, level as any);
      return new Response(`Sent notification to ${sseService.getClientCount()} clients`);
    case 'update':
      sseService.updateContent();
      return new Response(`Triggered content update for ${sseService.getClientCount()} clients`);
    case 'cleanup':
      sseService.cleanupOldConnections();
      return new Response(`Manually triggered cleanup of stale connections`);
    default:
      return new Response(`SSE server is active with ${sseService.getClientCount()} connected clients`);
  }
};