import { getAvailableThemes, getTheme } from '../index';
import type { ThemeBasicInfo } from '../interfaces/types';

/**
 * Static list of built-in themes - this will be available synchronously
 * without needing to do any async operations
 */
export const BUILT_IN_THEMES = [
    'default',
    'retro',
];

/**
 * Get the total number of available themes
 * @returns Promise with the number of themes
 */
export async function getThemeCount(): Promise<number> {
    const themes = await getAvailableThemes();
    return themes.length;
}

/**
 * Get theme info for all available themes
 * @returns Promise with array of theme info
 */
export async function getAllThemeInfo(): Promise<ThemeBasicInfo[]> {
    return getAvailableThemes();
}

/**
 * Check if a theme with given ID exists in collections
 * @param id The theme ID to check
 * @returns True if the theme exists
 */
export function isBuiltInTheme(id: string): boolean {
    return BUILT_IN_THEMES.includes(id);
}

/**
 * Get a list of themes that match certain criteria
 * @param filterFn Function to filter themes
 * @returns Promise with filtered themes
 */
export async function filterThemes(
    filterFn: (theme: ThemeBasicInfo) => boolean
): Promise<ThemeBasicInfo[]> {
    const themes = await getAvailableThemes();
    return themes.filter(filterFn);
}

// Helper for theme imports
export type ThemeImport = {
    name: string;
    path: string;
};

// Create a map of theme imports to help with dynamic imports
export const themeImportMap: Record<string, ThemeImport> = {};

// Populate the import map with built-in themes
BUILT_IN_THEMES.forEach(themeId => {
    themeImportMap[themeId] = {
        name: themeId,
        path: `./${themeId}/page.svelte`
    };
});

// Default export for easier imports
export default {
    BUILT_IN_THEMES,
    getThemeCount,
    getAllThemeInfo,
    isBuiltInTheme,
    filterThemes,
    themeImportMap
};
