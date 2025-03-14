import { getThemeImportMap, isThemeBuiltIn } from '../index';
import type { SvelteComponent } from 'svelte';

/**
 * Dynamically load a theme component by its ID
 * @param themeId The theme ID to load
 * @returns A promise resolving to the theme component or null if not found
 */
export async function loadThemeComponent(themeId: string): Promise<typeof SvelteComponent | null> {
    try {
        // Check if theme is a built-in theme
        if (!isThemeBuiltIn(themeId)) {
            console.warn(`Theme '${themeId}' is not in the built-in themes list`);
            // Fall back to default theme
            themeId = 'default';
        }
        
        const importMap = getThemeImportMap();
        const themePath = importMap[themeId]?.path;
        
        if (!themePath) {
            console.error(`No import path found for theme '${themeId}'`);
            return null;
        }
        
        // Dynamically import the theme component
        const module = await import(/* @vite-ignore */ themePath);
        return module.default;
    } catch (error) {
        console.error(`Failed to load theme component '${themeId}':`, error);
        return null;
    }
}

/**
 * Get a theme component factory that handles errors gracefully
 * @param fallbackThemeId The fallback theme ID if the requested theme fails to load
 * @returns A function that loads a theme component with fallback
 */
export function createThemeLoader(fallbackThemeId = 'default') {
    return async function(themeId: string): Promise<typeof SvelteComponent | null> {
        try {
            const component = await loadThemeComponent(themeId);
            if (component) return component;
            
            // Try fallback if primary theme fails
            if (themeId !== fallbackThemeId) {
                console.warn(`Falling back to ${fallbackThemeId} theme`);
                return await loadThemeComponent(fallbackThemeId);
            }
            
            return null;
        } catch (error) {
            console.error(`Theme loader error:`, error);
            return null;
        }
    }
}

export default {
    loadThemeComponent,
    createThemeLoader
};
