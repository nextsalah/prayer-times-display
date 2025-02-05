import { MediaService, Theme } from '$themes/logic/handler';
import { error, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';
import { ThemeService } from '$lib/db';
import type {  FileMetadata, ThemeUserSettings } from '$themes/interfaces/types';
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
        await ThemeService.update({
            customSettings: JSON.stringify(activeTheme.defaultSettings)
        });
        logger.info('Theme settings reset to default');
        throw redirect(303, url.pathname);
    }
    
    return {
        title: 'Customize Theme',
        theme: {
            name: activeTheme.name,
            customizationForm: activeTheme.customization,
        },
        userSettings,
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    save: async ({ request }) => {
        try {
            // Get form data
            const formData = await request.formData();
            
            // Get current settings and theme
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
            const updatedSetting = { ...currentSettings };
            
            // Process form entries
            const processedKeys = new Set<string>();

            // Process form entries
            for (const [key, value] of formData.entries()) {
                if (!value || key === 'touched' || key === 'valid') {
                    continue;
                }

                // Avoid processing the same key multiple times
                if (processedKeys.has(key)) {
                    continue;
                }
                processedKeys.add(key);

                try {
                    if (value instanceof File && value.size > 0) {
                        const FileMetadata = await MediaService.uploadFile(value);
                        
                        if (Array.isArray(updatedSetting[key])) {
                            updatedSetting[key].push(FileMetadata);
                        } else {
                            updatedSetting[key] = [FileMetadata];
                        }
                    } else {
                        updatedSetting[key] = value.toString();
                    }
                } catch (uploadError) {
                    logger.error(`Error uploading file(s) for key: ${key}`, uploadError);
                    throw error(400, `Error uploading file(s) for key: ${key}`);
                }
            }
            // Save updated settings
            await ThemeService.update({
                customSettings: JSON.stringify(updatedSetting)
            });

            logger.info('Theme settings updated successfully');

            return {
                status: 200,
                body: {
                    success: true,
                    message: 'Theme Settings Saved'
                }
            };

        } catch (err) {
            logger.error('Failed to save theme settings:', err);
            throw error(500, err instanceof Error ? err.message : 'Failed to save settings');
        }
    },
    delete: async ({ request }) => {
        try {
            const formData = await request.formData();
            const fileUrl = formData.get('fileUrl')?.toString();
            const fieldName = formData.get('fieldName')?.toString();
            
            if (!fileUrl || !fieldName) {
                throw error(400, 'File URL and field name are required');
            }

            // Get current settings
            const storedSettings = await ThemeService.get();
            const currentSettings = typeof storedSettings.customSettings === 'string' 
                ? JSON.parse(storedSettings.customSettings) 
                : storedSettings.customSettings;

            // Remove file reference from settings
            if (Array.isArray(currentSettings[fieldName])) {
                currentSettings[fieldName] = currentSettings[fieldName].filter(
                    (file: FileMetadata) => file.path !== fileUrl
                );
            } else {
                currentSettings[fieldName] = null;
            }

            // Delete physical file
            await MediaService.deleteFile(fileUrl.replace('/uploads/', ''));
            
            // Update settings in database
            await ThemeService.update({
                customSettings: JSON.stringify(currentSettings)
            });

            return {
                status: 200,
                body: { success: true }
            };
        } catch (err) {
            logger.error('Failed to delete file:', err);
            throw error(500, err instanceof Error ? err.message : 'Failed to delete file');
        }
    }
} satisfies Actions;