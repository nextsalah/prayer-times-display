import { json } from '@sveltejs/kit';
import { sseService } from '$lib/server/sse/service';
import { EventType, ScreenEventType, type ScreenEventPayload } from '$lib/sse/types';
import { logger } from '$lib/server/logger';

/**
 * POST endpoint to handle broadcasting SSE events from client-side code
 */
export async function POST({ request }) {
    try {
        const { type, payload } = await request.json();
        
        // Process based on event type
        switch (type) {
            case EventType.SCREEN_EVENT:
                handleScreenEvent(payload);
                break;
                
            case EventType.NOTIFICATION:
                sseService.broadcastNotification(
                    payload.message,
                    payload.level
                );
                break;
                
            case EventType.SYSTEM_STATUS:
                sseService.updateSystemStatus(
                    payload.status,
                    payload.message
                );
                break;
                
            default:
                logger.warn(`Unhandled SSE broadcast type: ${type}`);
                return json({ success: false, error: 'Unhandled event type' }, { status: 400 });
        }
        
        return json({ success: true, clientCount: sseService.getClientCount() });
    } catch (error) {
        logger.error('Error processing SSE broadcast:', error);
        return json({ success: false, error: 'Failed to process broadcast' }, { status: 500 });
    }
}

/**
 * Helper to handle screen events
 */
/**
 * Helper to handle screen events
 */
function handleScreenEvent(payload: ScreenEventPayload): void {
    switch (payload.type) {
        case ScreenEventType.PAGE_RELOAD:
            sseService.reloadAllScreens();
            break;
            
        case ScreenEventType.THEME_CHANGE:
            sseService.changeTheme(payload.data?.theme || 'default');
            break;
            
        case ScreenEventType.CONTENT_UPDATE:
            sseService.updateContent();
            break;
            
        default:
            logger.warn(`Unhandled screen event type: ${payload.type}`);
    }
}
