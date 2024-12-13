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
        title: 'Themes',
        themes: themes,
        currentThemeName: currentTheme.name,
        themeTemplate: currentTheme.themeTemplate,
        customSettings: customSettings
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    // Handle theme selection
    changeTheme: async ({ request }) => {
        try {
            const formData = await request.formData();
            const themeName = formData.get('theme_name');

            if (!themeName) {
                throw error(400, 'Please select a theme');
            }

            console.log('Changing theme to:', themeName);

            return {
                status: 200,
                body: {
                    success: true,
                    message: 'Theme changed'
                }
            };
        } catch (err) {
            console.error('Failed to change theme:', err);
            throw error(500, 'Could not change theme');
        }
    },
};

// Process theme settings form
async function updateThemeSettings(formData: FormData, oldSettings: any) {
    const newSettings = { ...oldSettings };
    
    for (const [key, value] of formData.entries()) {
        // Skip empty values and system fields
        if (
            !value || 
            key === 'theme_name' || 
            key === 'touched' || 
            key === 'valid'
        ) {
            continue;
        }

        // Handle file uploads (currently disabled)
        if (value instanceof File) {
            throw error(400, 'Files cannot be uploaded right now');
            
            /* File upload code (for future use)
            if (value.size === 0) continue;
            
            const files = [];
            const uploadFiles = formData.getAll(key);
            
            await FileManager.clearFiles();
            
            for (const file of uploadFiles) {
                if (file instanceof File) {
                    try {
                        const savedFile = await FileManager.saveFile(file);
                        files.push(savedFile);
                    } catch (err) {
                        console.error('Upload failed:', err);
                        throw error(400, 'Could not upload file');
                    }
                }
            }
            
            newSettings[key] = files;
            continue;
            */
        }

        // Save the form value
        newSettings[key] = value;
    }

    return newSettings;
}