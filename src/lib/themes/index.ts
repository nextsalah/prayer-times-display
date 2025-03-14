import { ThemeManager } from './logic/handler';
import type { ThemeBasicInfo, Theme, ThemeManifest } from './interfaces/types';
import { 
    BUILT_IN_THEMES, 
    themeImportMap, 
    getAllThemeInfo, 
    isBuiltInTheme 
} from './collections';

/**
 * Get list of all available themes
 * @returns Array of theme info
 * @example
 * // Get all available themes
 * const themes = await getAvailableThemes();
 */
export async function getAvailableThemes(): Promise<ThemeBasicInfo[]> {
    return ThemeManager.getAllThemes();
}

/**
 * Get a specific theme by ID
 * @param id The theme ID 
 * @returns Theme data or null if not found
 * @example
 * // Get a specific theme
 * const theme = await getTheme('dark-mode');
 */
export async function getTheme(id: string): Promise<Theme | null> {
    return ThemeManager.getTheme(id);
}

/**
 * Get the default theme
 * @returns The default theme or null if not available
 * @example
 * // Get the default theme
 * const defaultTheme = await getDefaultTheme();
 */
export async function getDefaultTheme(): Promise<Theme | null> {
    return ThemeManager.getDefaultTheme();
}

/**
 * Check if a specific theme exists
 * @param id The theme ID to check
 * @returns True if the theme exists
 * @example
 * // Check if theme exists
 * if (await themeExists('custom-theme')) {
 *   // Theme exists
 * }
 */
export async function themeExists(id: string): Promise<boolean> {
    return ThemeManager.themeExists(id);
}

/**
 * Get a list of all built-in theme IDs without loading them
 * @returns Array of built-in theme IDs
 */
export function getBuiltInThemeIds(): string[] {
    return ThemeManager.getBuiltInThemeIds();
}

/**
 * Get the import map for themes for dynamic imports
 * @returns Record mapping theme IDs to import paths
 */
export function getThemeImportMap() {
    return themeImportMap;
}

/**
 * Check if a theme is built-in (part of the static collection)
 * @param id Theme ID to check
 * @returns True if the theme is built-in
 */
export function isThemeBuiltIn(id: string): boolean {
    return isBuiltInTheme(id);
}

export type { Theme, ThemeBasicInfo, ThemeManifest };
export { BUILT_IN_THEMES };

// Default export for easier imports
export default {
    getAvailableThemes,
    getTheme,
    getDefaultTheme,
    themeExists,
    getBuiltInThemeIds,
    getThemeImportMap,
    isThemeBuiltIn,
    BUILT_IN_THEMES
};
