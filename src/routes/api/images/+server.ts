import { json } from '@sveltejs/kit';
import { imageService } from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
     try {
            // Check if a theme ID is provided as a query parameter
            const themeId = url.searchParams.get('themeId');
            
            let images;
            if (themeId) {
                images = await imageService.getImagesByTheme(parseInt(themeId));
            } else {
                images = await imageService.getAllImages();
            }
            
            return json({
                success: true,
                images
            });
            
        } catch (error) {
            console.error('Error fetching images:', error);
            return json(
                { error: 'Failed to fetch images', details: error instanceof Error ? error.message : 'Unknown error' },
                { status: 500 }
            );
        }
};