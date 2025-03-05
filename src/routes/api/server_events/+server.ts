// src/routes/api/server_events/+server.ts
import { connectionManager, ServerStream} from '$lib/sse/stream';
import { EventType } from '$lib/sse/types';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request }) => {
  // Create a new event stream
  const stream = new ServerStream();
  
  // Register connection
  connectionManager.addConnection(stream);
  
  // Set up the readable stream
  const readable = new ReadableStream({
    start(controller) {
      // Send initial connection confirmation
      controller.enqueue(`data: ${JSON.stringify({
        type: EventType.SYSTEM_STATUS,
        payload: {
          status: 'online',
          message: 'Connection established'
        }
      })}\n\n`);
      
      // Handle all messages from the event emitter
      stream.on('message', (data) => {
        try {
          controller.enqueue(`data: ${data}\n\n`);
        } catch (error) {
          console.error('[SSE] Error sending message:', error);
        }
      });
      
      // Handle heartbeats
      stream.on('heartbeat', (data) => {
        try {
          controller.enqueue(`:heartbeat ${data}\n\n`);
        } catch (error) {
          console.error('[SSE] Error sending heartbeat:', error);
        }
      });
      
      // Handle errors
      stream.on('error', (error) => {
        console.error('[SSE] Stream error:', error);
        try {
          controller.enqueue(`data: ${JSON.stringify({
            type: 'error',
            message: 'Stream error occurred'
          })}\n\n`);
        } catch (sendError) {
          console.error('[SSE] Failed to send error message:', sendError);
        }
      });
    },
    cancel() {
      // Clean up when client disconnects
      connectionManager.removeConnection(stream.id);
    }
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // Disable buffering in Nginx
    }
  });
};