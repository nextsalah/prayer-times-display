import Theme from '$themes/logic/handler';
import { error, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from '../sources/$types';

export const load = (async ({ url }: { url: URL }) => {
    try {
        const [theme, availableThemes] = await Promise.all([
            Theme.loadTheme('default'),
            Theme.getThemesList()
        ]);
        if (theme instanceof Error) {
            return {
                availableThemes,
                error: theme.message,
                themeName: 'default',
                themeTemplate: null,
                customSettings: null
            };
        }
 
        // Handle theme reset
        if (url.searchParams.get('reset') === 'true') {
            const defaultSettings = theme.themeSettings;
            throw redirect(302, '/theme');
        }
 
        return {
            error: null,
            availableThemes,
        };
    } catch (err) {
        console.error('Failed to load theme:', err);
        throw error(500, 'Failed to load theme configuration');
    }
}) satisfies PageServerLoad;

export const actions: Actions = {
    select: async ({ request }) => {
        try {
            const data = await request.formData();
            const themeFolder = data.get('theme_folder');

            if (!themeFolder) {
                throw error(400, 'No theme was selected');
            }

            // if (!(await Theme.isValidTheme(themeFolder.toString()))) {
            //     throw error(400, 'The selected theme is not valid');
            // }

            console.log('Selected theme:', themeFolder);

            return {
                status: 200,
                body: {
                    success: true,
                    message: 'Theme Selected'
                }
            };
        } catch (err) {
            console.error('Theme selection failed:', err);
            throw error(500, 'Failed to select theme');
        }
    },

};

async function processFormData(data: FormData, prevSettings: any) {
    const newSettings = { ...prevSettings };
    
    for (const [key, value] of data.entries()) {
        // Skip invalid or special fields
        if (
            !value || 
            key === 'theme_folder' || 
            key === 'touched' || 
            key === 'valid'
        ) {
            continue;
        }

        // Handle file uploads (currently disabled)
        if (value instanceof File) {
            throw error(400, 'File upload is not currently supported');
            
            // Uncomment and modify this section to enable file uploads
            /*
            if (value.size === 0) continue;
            
            const files = [];
            const allFiles = data.getAll(key);
            
            await FileHandler.clearUploadsFolder();
            
            for (const file of allFiles) {
                if (file instanceof File) {
                    try {
                        const uploadedFile = await FileHandler.uploadFile(file);
                        files.push(uploadedFile);
                    } catch (err) {
                        console.error('File upload failed:', err);
                        throw error(400, 'Failed to upload file');
                    }
                }
            }
            
            newSettings[key] = files;
            continue;
            */
        }

        // Handle regular form values
        newSettings[key] = value;
    }

    return newSettings;
}