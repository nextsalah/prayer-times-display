import Theme from '$themes/logic/handler';
import { error, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';
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

    return {
        title: 'Customize Theme',
        currentThemeName: currentTheme.name,
        themeTemplate: currentTheme.themeTemplate,
        customSettings: customSettings
    };
}) satisfies PageServerLoad;
