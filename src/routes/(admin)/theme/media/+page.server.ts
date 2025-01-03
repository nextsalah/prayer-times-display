import { Theme, FileManager, MediaService } from '$themes/logic/handler';
import { error, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ThemeService } from '$lib/db';
import type { ThemeUserSettings } from '$themes/interfaces/types';
import { logger } from "$lib/server/logger";

export const load = (async ({ url }: { url: URL }) => {
    // Get stored theme settings
    const storedSettings = await ThemeService.get();
    
    // Load the active theme
    const activeTheme = await Theme.load(storedSettings.themeName);
    if (activeTheme instanceof Error) {
        logger.error('Failed to load theme:', activeTheme);
        throw error(400, 'Failed to load active theme');
    }

    // Parse user settings
    const userSettings: ThemeUserSettings = typeof storedSettings.customSettings === 'string'
        ? JSON.parse(storedSettings.customSettings)
        : storedSettings.customSettings;
    
    // Handle settings reset request
    if (url.searchParams.get('reset') === 'true') {
        const defaultSettings = activeTheme.defaultSettings;
        await ThemeService.update({
            customSettings: JSON.stringify(defaultSettings)
        });
        logger.info('Theme media settings reset to default');
        throw error(303, 'Theme settings reset');
    }

    // if it has no media settings, return 404
    if (!activeTheme.hasFileUploadSupport()) {
        throw error(404, 'Theme has no media settings');
    }

    return {
        title: 'Theme Media Settings',
        theme: {
            name: activeTheme.name,
            mediaSettings: activeTheme.customization,
        },
        userSettings,
        media: await MediaService.listMedia(), // Implement this method to list existing media
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    uploadMedia: async ({ request }) => {
        try {
            const formData = await request.formData();
            const files = formData.getAll('media') as File[];

            if (files.length === 0) {
                return {
                    status: 400,
                    body: { 
                        success: false, 
                        message: 'No files uploaded' 
                    }
                };
            }

            // Upload each file
            const uploadedFiles = await Promise.all(
                files.map(file => MediaService.uploadMedia(file))
            );

            logger.info(`Uploaded ${uploadedFiles.length} files`);

            return {
                status: 200,
                body: {
                    success: true,
                    message: `${uploadedFiles.length} file(s) uploaded successfully`,
                    files: uploadedFiles
                }
            };

        } catch (err) {
            logger.error('Media upload failed:', err);
            throw error(500, err instanceof Error ? err.message : 'Media upload failed');
        }
    },

    deleteMedia: async ({ request }) => {
        try {
            const { mediaId } = await request.json();

            if (!mediaId) {
                return {
                    status: 400,
                    body: { 
                        success: false, 
                        message: 'Media ID is required' 
                    }
                };
            }

            await MediaService.deleteMedia(mediaId);

            return {
                status: 200,
                body: { 
                    success: true, 
                    message: 'Media deleted successfully' 
                }
            };

        } catch (err) {
            logger.error('Media deletion failed:', err);
            throw error(500, err instanceof Error ? err.message : 'Media deletion failed');
        }
    },

    save: async ({ request }) => {
        try {
            // Get form data
            const formData = await request.formData();
            
            // Get current settings
            const storedSettings = await ThemeService.get();
            const currentSettings = typeof storedSettings.customSettings === 'string' 
                ? JSON.parse(storedSettings.customSettings) 
                : storedSettings.customSettings;
            
            // Load theme for validation
            const activeTheme = await Theme.load(storedSettings.themeName);
            if (activeTheme instanceof Error) {
                throw error(400, 'Invalid theme configuration');
            }

            // Build new settings object
            let newSettings = { ...currentSettings };
            let mediaUpdated = false;

            // Process media-related form entries
            for (const [key, value] of formData.entries()) {
                // Skip non-media or special fields
                if (!key.startsWith('media_') || value == null || value === undefined || value === '') {
                    continue;
                }

                // Handle file uploads
                if (value instanceof File) {
                    // Use MediaService to handle file uploads
                    const uploadResult = await MediaService.uploadMedia(value);
                    newSettings[key] = uploadResult.path;
                    mediaUpdated = true;
                } else if (typeof value === 'string') {
                    // Handle regular media settings
                    newSettings[key] = value;
                    mediaUpdated = true;
                }
            }

            if (!mediaUpdated) {
                return {
                    status: 400,
                    body: {
                        success: false,
                        message: 'No media settings were changed'
                    }
                };
            }

            // Save updated settings
            await ThemeService.update({
                customSettings: JSON.stringify(newSettings)
            });

            logger.info('Theme media settings updated successfully');

            return {
                status: 200,
                body: {
                    success: true,
                    message: 'Media Settings Saved'
                }
            };

        } catch (err) {
            logger.error('Failed to save media settings:', err);
            throw error(500, err instanceof Error ? err.message : 'Failed to save media settings');
        }
    }
} satisfies Actions;