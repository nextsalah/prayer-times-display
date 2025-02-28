import { MediaService, Theme } from '$themes/logic/handler';
import { error, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ThemeService } from '$lib/db';
import type { FileMetadata, ThemeUserSettings } from '$themes/interfaces/types';
import { logger } from "$lib/server/logger";
import { 
  mergeWithDefaults, 
  validateFormData,
  processFormData,
} from '$themes/logic/theme-settings-manager';

export const load = (async ({ url }: { url: URL }) => {
    // Get stored theme settings
    const storedSettings = await ThemeService.get();
    
    // Load the active theme
    const activeTheme = await Theme.load(storedSettings.themeName);
    if (activeTheme instanceof Error) {
        logger.error('Failed to load theme:', activeTheme);
        throw error(400, 'Failed to load active theme');
    }

    // Parse user settings from database
    const rawUserSettings: ThemeUserSettings = typeof storedSettings.customSettings === 'string'
        ? JSON.parse(storedSettings.customSettings)
        : storedSettings.customSettings || {};
    
    // Handle settings reset request
    if (url.searchParams.get('reset') === 'true') {
        await ThemeService.update({
            customSettings: JSON.stringify(activeTheme.defaultSettings)
        });
        logger.info('Theme settings reset to default');
        throw redirect(303, url.pathname);
    }
    
    // Merge with defaults for any missing values
    const userSettings = mergeWithDefaults(rawUserSettings, activeTheme.customization);
    
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
                ? JSON.parse(storedSettings.customSettings) || {}
                : storedSettings.customSettings || {};
            
            // Load theme for validation
            const activeTheme = await Theme.load(storedSettings.themeName);
            if (activeTheme instanceof Error) {
                throw error(400, 'Invalid theme configuration');
            }

            // Validate the form data
            const validation = validateFormData(
                Object.fromEntries(formData), 
                activeTheme.customization
            );
            
            if (!validation.valid) {
                return {
                    status: 400,
                    body: {
                        success: false,
                        errors: validation.errors
                    }
                };
            }

            // Process the form data with file uploads
            const processedData = await processFormData(
                formData, 
                activeTheme.customization,
                // File uploader function
                async (file: File) => await MediaService.uploadFile(file)
            );

            // Merge with current settings
            const updatedSettings = {
                ...currentSettings,
                ...processedData
            };

            // Save updated settings
            await ThemeService.update({
                customSettings: JSON.stringify(updatedSettings)
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
                ? JSON.parse(storedSettings.customSettings) || {}
                : storedSettings.customSettings || {};
                
            // Load theme for field definitions
            const activeTheme = await Theme.load(storedSettings.themeName);
            if (activeTheme instanceof Error) {
                throw error(400, 'Invalid theme configuration');
            }

            // Remove file reference from settings
            if (Array.isArray(currentSettings[fieldName])) {
                currentSettings[fieldName] = currentSettings[fieldName].filter(
                    (file: FileMetadata) => file.path !== fileUrl
                );
                
                // If array is empty, check if we should use default value
                if (currentSettings[fieldName].length === 0) {
                    const defaultValue = activeTheme.customization.find(f => f.name === fieldName)?.value;
                    if (defaultValue !== undefined) {
                        currentSettings[fieldName] = defaultValue;
                    } else {
                        // If no default, remove the property
                        delete currentSettings[fieldName];
                    }
                }
            } else {
                // Check if field has default value
                const defaultValue = activeTheme.customization.find(f => f.name === fieldName)?.value;
                if (defaultValue !== undefined) {
                    currentSettings[fieldName] = defaultValue;
                } else {
                    delete currentSettings[fieldName];
                }
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