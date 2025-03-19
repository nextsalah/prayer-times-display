import { imageService } from '$lib/db';
import { error } from '@sveltejs/kit';

export async function GET ({ params, url }) {
    console.log('Fetching image with ID:', params.id);
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            throw error(400, `Invalid image ID: "${params.id}" is not a number`);
        }

        // Check for fallback parameter which determines if we should return a placeholder on error
        const useFallback = url.searchParams.get('fallback') !== 'false';
        
        const imageData = await imageService.getImageData(id);
        if (!imageData) {
            
            if (useFallback) {
                // Return a placeholder image instead of an error
                // You could either serve a static placeholder or redirect to a default image
                return new Response(null, {
                    status: 307, // Temporary Redirect
                    headers: {
                        'Location': '/images/placeholder.png', // Path to your placeholder image
                        'Cache-Control': 'no-cache'
                    }
                });
            }
            
            throw error(404, `Image with ID ${id} was not found`);
        }
        // Return the image data with appropriate content type
        return new Response(imageData.data, {
            headers: {
                'Content-Type': imageData.mimeType,
                'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
            }
        });
        
        
    } catch (err: unknown) {
        console.error('Error fetching image:', {
            id: params.id,
            error: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined
        });
        
        if (err && typeof err === 'object' && 'status' in err && 'body' in err) {
            throw error(err.status as number, (err.body as { message: string }).message);
        }
        throw error(500, 'Failed to fetch image');
    }
}

// Route to delete an image
export async function DELETE({ params }) {
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            throw error(400, 'Invalid image ID');
        }

        const deleted = await imageService.deleteImage(id);
        if (!deleted) {
            throw error(404, 'Image not found or could not be deleted');
        }

        return new Response(JSON.stringify({ success: true, message: 'Image deleted successfully' }), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
    } catch (err: unknown) {
        console.error('Error deleting image:', err);
        if (err && typeof err === 'object' && 'status' in err && 'body' in err) {
            throw error(err.status as number, (err.body as { message: string }).message);
        }
        throw error(500, 'Failed to delete image');
    }
}