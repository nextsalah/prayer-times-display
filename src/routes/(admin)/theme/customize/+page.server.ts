import { Theme } from '$themes/logic/handler';
import { error, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';
import { ThemeService } from '$lib/db';
import type {  ThemeUserSettings } from '$themes/interfaces/types';
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
            let newSettings = { ...currentSettings };

            // Process form entries
            for (const [key, value] of formData.entries()) {
                // Skip empty or special fields
                if (
                    value == null ||
                    value === undefined ||
                    value === '' ||
                    key === 'theme_folder' ||
                    key === 'touched' ||
                    key === 'valid'
                ) {
                    continue;
                }

                // Handle file uploads
                if (value instanceof File) {
                    throw error(400, 'File upload is not supported');
                }

                // Store the value
                newSettings[key] = value;
            }

            // Save updated settings
            await ThemeService.update({
                customSettings: JSON.stringify(newSettings)
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
    }
} satisfies Actions;