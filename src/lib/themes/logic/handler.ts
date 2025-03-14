import { Glob } from 'bun';
import { v4 as uuidv4 } from 'uuid';
import { unlink } from 'node:fs/promises';
import { 
    isThemeCustomizationForm,
    type ThemeManifest, 
    type ThemeUserSettings,
    type Theme as ThemeType,
    type ThemeList,
    isThemeManifest,
    type FileMetadata,
    type ThemeBasicInfo,
} from '$lib/themes/interfaces/types';

// Import with fallback for BUILT_IN_THEMES
let BUILT_IN_THEMES: string[] = [];
try {
    const collections = await import('$lib/themes/collections');
    BUILT_IN_THEMES = collections.BUILT_IN_THEMES || ['default'];
} catch (e) {
    console.warn('Could not load theme collections, using fallback', e);
    BUILT_IN_THEMES = ['default'];
}

import path from 'node:path';
import { existsSync, mkdirSync } from "fs";
import type { IField } from '@ismail424/svelte-formly';

const UPLOAD_BASE_PATH = path.join(process.cwd(), 'static', 'uploads');
const getRootPath = () => path.resolve(process.cwd());

// Cache for theme list to avoid redundant filesystem access
let themeListCache: ThemeBasicInfo[] | null = null;
let themeCacheExpiry = 0;
const CACHE_TTL = 60000; // 1 minute cache

class FileManager {
    static async createUploadFolder(): Promise<void> {
        try {
            // Check if the folder exists
            if (!existsSync(UPLOAD_BASE_PATH)) {
                // Create the folder if it doesn't exist
                mkdirSync(UPLOAD_BASE_PATH, { recursive: true });
            } 
        } catch (error) {
            console.error("Failed to create uploads folder:", error);
        }
    }

    static async saveFile(file: File) {
        await this.createUploadFolder();

        const id = uuidv4();
        const filename = `${id}-${file.name}`;
        const path = `${UPLOAD_BASE_PATH}/${filename}`;

        await Bun.write(path, file);

        return {
            id,
            name: file.name,
            type: file.type,
            path
        };
    }

    static async deleteFile(path: string) {
        const fullPath = `${UPLOAD_BASE_PATH}/${path}`;
        try {
            await unlink(fullPath);
        } catch (error) {
            console.error(`Cannot delete file: ${fullPath}`, error);
        }
    }

    static async clearUploads() {
        try {
            const glob = new Glob("*");
            const files = await Array.fromAsync(glob.scan({ cwd: UPLOAD_BASE_PATH }));
            
            await Promise.all(files.map(file => 
                Bun.write(`${UPLOAD_BASE_PATH}/${file}`, '')
            ));
        } catch (error) {
            console.error('Cannot clear uploads folder', error);
        }
    }
}

class MediaService {
    static async uploadFile(file: File) {
        try {
            // Maximum file size in byte, 10MB
            const maxSize =  10 * 1024 * 1024;
            if (file.size > maxSize) {
                throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
            }

            // Upload file
            const uploadResult = await FileManager.saveFile(file);

            const relativePath = uploadResult.path.replace(UPLOAD_BASE_PATH, '/uploads');

            // Prepare metadata
            const fileMetadata = {
                id: uploadResult.id,
                name: uploadResult.name,
                path: relativePath,
                fullPath: uploadResult.path,
                type: uploadResult.type,
                size: file.size,
                uploadedAt: new Date().toISOString()
            } as FileMetadata;
            // Retrieve current settings
            return fileMetadata;
        } catch (error) {
            console.error('File upload failed:', error);
            throw error;
        }
    }

    static async deleteFile(path: string) {
        try {
            await FileManager.deleteFile(path);
        } catch (error) {
            console.error('File deletion failed:', error);
            throw error;
        }
    }

    static async clearUploads() {
        try {
            await FileManager.clearUploads();
        } catch (error) {
            console.error('Failed to clear uploads:', error);
            throw error;
        }
    }
}

class Theme {
    private readonly folderPath: string;
    private readonly manifest: ThemeManifest;
    private readonly customizationForm: IField[];

    private constructor(
        folderPath: string,
        manifest: ThemeManifest,
        customizationForm: IField[],
    ) {
        this.folderPath = folderPath;
        this.manifest = manifest;
        this.customizationForm = customizationForm;
    }

    static async load(name: string): Promise<Theme | Error> {
        if (!(await this.exists(name))) {
            return new Error(`Theme "${name}" not found`);
        }

        try {
            const manifest = await this.loadManifest(name);
            const customizationForm = await this.loadCustomizationForm(name);

            if (!isThemeManifest(manifest)) {
                return new Error(`Invalid manifest for theme "${name}"`);
            }

            if (!isThemeCustomizationForm(customizationForm)) {
                return new Error(`Invalid customization form for theme "${name}"`);
            }

            return new Theme(name, manifest, customizationForm);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'unknown error';
            return new Error(`Failed to load theme "${name}": ${message}`);
        }
    }

    /**
     * List all available themes from the built-in list
     */
    static async list(): Promise<string[]> {
        // Just return the built-in themes list
        return [...BUILT_IN_THEMES];
    }

    static async exists(name: string): Promise<boolean> {
        // Check if the theme is in the built-in list
        return BUILT_IN_THEMES.includes(name);
    }

    static async loadManifest(name: string): Promise<ThemeManifest> {
        try {
            // Only import from the codebase, not from the filesystem
            const manifestModule = await import(`$lib/themes/collections/${name}/manifest.ts`);
            return manifestModule.default;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'unknown error';
            throw new Error(`Failed to read manifest: ${message}`);
        }
    }

    static async loadCustomizationForm(name: string): Promise<IField[]> {
        try {
            // Only import from the codebase, not from the filesystem
            const customizationModule = await import(`$lib/themes/collections/${name}/customization.ts`);
            const form = customizationModule.default;
            if (!isThemeCustomizationForm(form)) {
                throw new Error('Invalid customization form format');
            }
            return form;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'unknown error';
            throw new Error(`Failed to read customization form: ${message}`);
        }
    }

    /**
     * Get full information for all available themes with caching
     */
    static async getAllThemes(): Promise<ThemeList> {
        // Use cache if available and not expired
        if (themeListCache && Date.now() < themeCacheExpiry) {
            return themeListCache;
        }
        
        const themes = await this.list();
        const themeList = await Promise.all(
            themes.map(async name => {
                try {
                    const manifest = await this.loadManifest(name);
                    return { 
                        value: name,
                        name: manifest.name,
                        description: manifest.description 
                    };
                } catch (error) {
                    console.error(`Error loading theme "${name}":`, error);
                    return { 
                        value: name,
                        name: name,
                        description: `Error loading theme: ${error instanceof Error ? error.message : 'unknown error'}` 
                    };
                }
            })
        );
        
        // Update cache
        themeListCache = themeList;
        themeCacheExpiry = Date.now() + CACHE_TTL;
        
        return themeList;
    }

    /**
     * Get a specific theme by ID with error handling
     */
    static async getTheme(id: string): Promise<ThemeType | null> {
        const theme = await this.load(id);
        if (theme instanceof Error) {
            console.error(`Failed to load theme "${id}":`, theme.message);
            return null;
        }
        return theme.themeData;
    }

    /**
     * Get the default theme
     */
    static async getDefaultTheme(): Promise<ThemeType | null> {
        const DEFAULT_THEME_ID = 'default';
        return this.getTheme(DEFAULT_THEME_ID);
    }

    get folderName(): string {
        return this.folderPath;
    }

    get name(): string {
        return this.manifest.name;
    }

    get description(): string {
        return this.manifest.description;
    }

    get customization(): IField[] {
        return this.customizationForm;
    }

    get configuration(): ThemeManifest {
        return this.manifest;
    }

    get defaultSettings(): ThemeUserSettings {
        return Object.fromEntries(
            this.customizationForm
                .filter(setting => setting.value != null)
                .map(setting => [setting.name, setting.value])
        );
    }

    get themeData(): ThemeType {
        return {
            value: this.folderName,
            name: this.name,
            description: this.description,
            customizationForm: this.customizationForm,
            manifest: this.manifest,
        };
    }
    
    hasFileUploadSupport(): boolean {
        return this.customizationForm.some(field => field.type === 'file');
    }
}

/**
 * Simple API for accessing themes
 */
const ThemeManager = {
    /**
     * Get list of all available themes
     */
    getAllThemes: async (): Promise<ThemeBasicInfo[]> => {
        return Theme.getAllThemes();
    },
    
    /**
     * Get a specific theme by its ID
     */
    getTheme: async (id: string): Promise<ThemeType | null> => {
        return Theme.getTheme(id);
    },
    
    /**
     * Get the default theme
     */
    getDefaultTheme: async (): Promise<ThemeType | null> => {
        return Theme.getDefaultTheme(); 
    },
    
    /**
     * Check if a theme exists
     */
    themeExists: async (id: string): Promise<boolean> => {
        return Theme.exists(id);
    },
    
    /**
     * Clear the theme cache
     */
    clearCache: (): void => {
        themeListCache = null;
        themeCacheExpiry = 0;
    },
    
    /**
     * Get built-in theme IDs defined in collections/index.ts
     */
    getBuiltInThemeIds: (): string[] => {
        return [...BUILT_IN_THEMES];
    }
};

export { Theme, FileManager, MediaService, ThemeManager };