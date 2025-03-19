import { json } from '@sveltejs/kit';
import { fileService } from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
     try {
            // Check if a theme name is provided as a query parameter
            const themeName = url.searchParams.get('themeName');
            
            let files;
            if (themeName) {
                files = await fileService.getFilesByTheme(themeName);
            } else {
                files = await fileService.getAllFiles();
            }
            
            return json({
                success: true,
                files
            });
            
        } catch (error) {
            console.error('Error fetching files:', error);
            return json(
                { error: 'Failed to fetch files', details: error instanceof Error ? error.message : 'Unknown error' },
                { status: 500 }
            );
        }
};