import { MediaService, Theme } from '$lib/themes/logic/handler';
import { error,  type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { themeService } from '$lib/db';
import type { FileMetadata, ThemeUserSettings } from '$lib/themes/interfaces/types';
import { logger } from "$lib/server/logger";
import { 
  mergeWithDefaults, 
  validateFormData,
  processFormData,
} from '$lib/themes/logic/theme-settings-manager';
import { sseService } from '$lib/server/sse/service';

export const load = (async ({ url }: { url: URL }) => {
    try {
        // Get stored theme settings
        const storedSettings = await themeService.get();
        
        // Load the active theme
        const activeTheme = await Theme.load(storedSettings.themeName);
        if (activeTheme instanceof Error) {
            logger.error('Failed to load theme:', activeTheme);
            throw error(400, 'Failed to load active theme');
        }
        // Parse user settings from database
        let rawUserSettings: ThemeUserSettings;
        try {
            rawUserSettings = await themeService.getCustomSettingsObject<ThemeUserSettings>();
        } catch (e) {
            logger.error('Failed to parse custom settings, using empty object', e);
            rawUserSettings = {};
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
    } catch (err) {
        logger.error('Failed to load theme customization:', err);
        throw error(500, 'Failed to load theme settings');
    }
}) satisfies PageServerLoad;

export const actions: Actions = {
    save: async ({ request }) => {
        try {
            // Get form data
            const formData = await request.formData();
            
            // Get current theme
            const storedSettings = await themeService.get();
            
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

            // Get current custom settings
            const currentSettings = await themeService.getCustomSettingsObject();

            // Merge with current settings
            const updatedSettings = {
                ...currentSettings,
                ...processedData
            };

            // Save updated settings
            await themeService.updateCustomSettingsObject(updatedSettings);
            
            logger.info('Theme settings updated successfully');
            sseService.updateContent('Theme settings updated');
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
            const currentSettings = await themeService.getCustomSettingsObject();
                
            // Load theme for field definitions
            const storedSettings = await themeService.get();
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
            await themeService.updateCustomSettingsObject(currentSettings);

            sseService.updateContent('File deleted');

            return {
                status: 200,
                body: { success: true }
            };
        } catch (err) {
            logger.error('Failed to delete file:', err);
            throw error(500, err instanceof Error ? err.message : 'Failed to delete file');
        }
    },
    reset: async () => {
        try {
            // Get stored theme settings
            const storedSettings = await themeService.get();
            
            // Load the active theme
            const activeTheme = await Theme.load(storedSettings.themeName);
            if (activeTheme instanceof Error) {
                throw error(400, 'Failed to load active theme');
            }
            
            // Reset custom settings to theme defaults
            await themeService.updateCustomSettingsObject(activeTheme.defaultSettings || {});
            logger.info('Theme settings reset to default');
            
            sseService.updateContent('Theme settings reset to default');

            return {
                success: true,
                message: 'Theme settings reset to defaults'
            };
        } catch (err) {
            logger.error('Failed to reset theme settings:', err);
            return {
                success: false,
                message: err instanceof Error ? err.message : 'Failed to reset theme settings'
            };
        }
    },
} satisfies Actions;