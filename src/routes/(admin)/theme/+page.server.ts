import Theme from '$themes/logic/handler';
import { error, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from '../sources/$types';
import { ThemeService } from '$lib/db';

export const load = (async ({ url }: { url: URL }) => {
    // Get current theme settings
    const themeSettings = await ThemeService.get();
    
    // Load the current theme
    const currentTheme = await Theme.load(themeSettings.themeName);
    if (currentTheme instanceof Error) {
        throw error(400, 'Invalid theme');
    }

    // Get list of all available themes
    const themes = await Theme.getAll();
    if (!themes) {
        throw error(500, 'Could not load themes');
    }
    // Parse custom settings if they're stored as a string
    const customSettings = typeof themeSettings.customSettings === 'string' 
        ? JSON.parse(themeSettings.customSettings) 
        : themeSettings.customSettings;
    
    // Handle reset request
    if (url.searchParams.get('reset') === 'true') {
        await ThemeService.update({ 
            customSettings: JSON.stringify(currentTheme.defaults) 
        });
        throw redirect(302, '/theme');
    }

    // Check if theme supports file uploads
    const supportsFileUpload = currentTheme.hasFileUploadSupport();

    return {
        title: 'Themes',
        themes: themes,
        currentThemeName: currentTheme.name,
        currentThemeDescription: currentTheme.description,
        themeTemplate: currentTheme.themeTemplate,
        customSettings: customSettings,
        supportsFileUpload: supportsFileUpload
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    // Handle theme selection
    select: async ({ request }) => {
        try {
            const formData = await request.formData();
            let themeName = formData.get('theme_name');
            if (!themeName || typeof themeName !== 'string') {
                throw error(400, 'Please select a valid theme');
            }

            // lowercase the name, trim and do some basic validation
            themeName = themeName.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');

            // Load the new theme to verify it exists and get defaults
            const newTheme = await Theme.load(themeName);
            if (newTheme instanceof Error) {
                throw error(400, 'Invalid theme selected');
            }

            // Update theme settings with new theme and its default settings
            await ThemeService.update({
                themeName: themeName,
                customSettings: JSON.stringify(newTheme.defaults)
            });

            return { status: 200, body: { message: 'Theme updated' } };
        } catch (err) {
            console.error('Failed to switch theme:', err);
            if (err instanceof Error) {
                throw error(500, err.message);
            }
            throw error(500, 'Failed to switch theme');
        }
    },
};
