import { fileService } from '$lib/db';
import { error } from '@sveltejs/kit';

export async function GET({ params, url }) {
    console.log('Fetching file with ID:', params.id);
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            throw error(400, `Invalid file ID: "${params.id}" is not a number`);
        }

        // Check for fallback parameter which determines if we should return a placeholder on error
        const useFallback = url.searchParams.get('fallback') !== 'false';
        
        const fileData = await fileService.getFileData(id);
        if (!fileData) {
            
            if (useFallback) {
                // Return a placeholder file instead of an error
                // You could either serve a static placeholder or redirect to a default file
                return new Response(null, {
                    status: 307, // Temporary Redirect
                    headers: {
                        'Location': '/images/placeholder.png', // Path to your placeholder file
                        'Cache-Control': 'no-cache'
                    }
                });
            }
            
            throw error(404, `File with ID ${id} was not found`);
        }
        // Return the file data with appropriate content type
        return new Response(fileData.data, {
            headers: {
                'Content-Type': fileData.mimeType,
                'Content-Length': fileData.data.length.toLocaleString(),
                'Cache-Control': 'cache, max-age=3600, immutable' // Cache for 1 hour
            }
        });
        
        
    } catch (err: unknown) {
        console.error('Error fetching file:', {
            id: params.id,
            error: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined
        });
        
        if (err && typeof err === 'object' && 'status' in err && 'body' in err) {
            throw error(err.status as number, (err.body as { message: string }).message);
        }
        throw error(500, 'Failed to fetch file');
    }
}

// Route to delete a file
export async function DELETE({ params }) {
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            throw error(400, 'Invalid file ID');
        }

        const deleted = await fileService.deleteFile(id);
        if (!deleted) {
            throw error(404, 'File not found or could not be deleted');
        }

        return new Response(JSON.stringify({ success: true, message: 'File deleted successfully' }), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
    } catch (err: unknown) {
        console.error('Error deleting file:', err);
        if (err && typeof err === 'object' && 'status' in err && 'body' in err) {
            throw error(err.status as number, (err.body as { message: string }).message);
        }
        throw error(500, 'Failed to delete file');
    }
}