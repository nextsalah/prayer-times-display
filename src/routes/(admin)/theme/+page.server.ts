import { Theme } from '$themes/logic/handler';
import { error, redirect, type Actions } from '@sveltejs/kit';
import { themeService } from '$lib/db';

export const load = (async () => {
    try {
        // Get stored theme settings
        const storedSettings = await themeService.get();
        
        // Load the active theme
        const activeTheme = await Theme.load(storedSettings.themeName);
        if (activeTheme instanceof Error) {
            throw error(400, 'Failed to load active theme');
        }

        // Get all available themes
        const availableThemes = await Theme.getAllThemes();
        if (!availableThemes?.length) {
            throw error(500, 'No themes available');
        }

        // Add QR code and disclaimer settings
        const qrCodeEnabled = storedSettings.showQrCode;
        const disclaimerRemoved = storedSettings.removeDisclaimer;

        return {
            title: 'Theme Settings',
            currentTheme: activeTheme.themeData,
            availableThemes,
            settings: {
                qrCodeEnabled,
                disclaimerRemoved
            }
        };
    } catch (err) {
        console.error('Failed to load theme page:', err);
        throw error(500, 'Failed to load theme settings');
    }
});

export const actions: Actions = {
    // Select a theme
    select: async ({ request }) => {
        try {
            const formData = await request.formData();
            const rawThemeName = formData.get('theme_name');

            if (!rawThemeName || typeof rawThemeName !== 'string') {
                throw error(400, 'Please select a theme');
            }

            // Sanitize theme name
            const themeName = sanitizeThemeName(rawThemeName);
            
            // Verify theme exists and load its defaults
            const theme = await Theme.load(themeName);
            if (theme instanceof Error) {
                throw error(400, 'Selected theme is not available');
            }

            // Update theme settings
            await themeService.updateThemeName(themeName);
            
            // Reset custom settings to theme defaults
            await themeService.updateCustomSettingsObject(theme.defaultSettings || {});

            return {
                success: true,
                message: `Theme "${theme.name}" has been applied`
            };
        } catch (err) {
            console.error('Theme selection failed:', err);
            throw error(500, getErrorMessage(err));
        }
    },
    
    // Toggle QR code visibility
    toggleQR: async () => {
        try {
            await themeService.toggleQrCode();
            return {
                success: true,
                message: 'QR code setting updated'
            };
        } catch (err) {
            console.error('Failed to toggle QR code setting:', err);
            throw error(500, getErrorMessage(err));
        }
    },
    
    // Toggle disclaimer visibility
    toggleDisclaimer: async () => {
        try {
            await themeService.toggleDisclaimer();
            return {
                success: true,
                message: 'Disclaimer setting updated'
            };
        } catch (err) {
            console.error('Failed to toggle disclaimer setting:', err);
            throw error(500, getErrorMessage(err));
        }
    },
    
    // Reset theme to defaults
    resetTheme: async () => {
        try {
            await themeService.resetToDefaults();
            return {
                success: true,
                message: 'Theme settings have been reset to defaults'
            };
        } catch (err) {
            console.error('Failed to reset theme:', err);
            throw error(500, getErrorMessage(err));
        }
    },
    
    // Update custom settings
    updateCustomSettings: async ({ request }) => {
        try {
            const formData = await request.formData();
            const rawSettings = formData.get('custom_settings');
            
            if (!rawSettings || typeof rawSettings !== 'string') {
                throw error(400, 'Invalid custom settings');
            }
            
            try {
                // Parse and validate JSON
                const customSettings = JSON.parse(rawSettings);
                await themeService.updateCustomSettingsObject(customSettings);
                
                return {
                    success: true,
                    message: 'Custom settings updated successfully'
                };
            } catch (jsonError) {
                throw error(400, 'Invalid JSON format for custom settings');
            }
        } catch (err) {
            console.error('Failed to update custom settings:', err);
            throw error(500, getErrorMessage(err));
        }
    }
};

// Helper functions
function sanitizeThemeName(name: string): string {
    return name.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
}

function getErrorMessage(err: unknown): string {
    return err instanceof Error ? err.message : 'Failed to update theme';
}