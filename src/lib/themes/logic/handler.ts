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
import { imageService } from '$lib/db/services/upload';

// Import with fallback for BUILT_IN_THEMES
let BUILT_IN_THEMES: string[] = [];
try {
    const collections = await import('$lib/themes/collections');
    BUILT_IN_THEMES = collections.BUILT_IN_THEMES || ['default'];
} catch (e) {
    console.warn('Could not load theme collections, using fallback', e);
    BUILT_IN_THEMES = ['default'];
}

import type { IField } from '@ismail424/svelte-formly';

class MediaService {
    static async uploadFile(file: File) {
        try {
            // Maximum file size in byte, 10MB
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
            }

            // Upload file to database
            const imageMetadata = await imageService.uploadImage(file);

            // Prepare metadata in the format expected by existing code
            const fileMetadata = {
                id: imageMetadata.id.toString(),
                name: imageMetadata.filename,
                type: imageMetadata.mimeType,
                size: imageMetadata.size,
                uploadedAt: imageMetadata.createdAt.toISOString()
            } as FileMetadata;
            
            return fileMetadata;
        } catch (error) {
            console.error('File upload failed:', error);
            throw error;
        }
    }

    static async deleteFile(path: string) {
        try {
            // Extract the ID from the path format "/uploads/db-{id}"
            const matches = path.match(/db-(\d+)$/);
            if (!matches || !matches[1]) {
                throw new Error(`Invalid file path format: ${path}`);
            }
            
            const imageId = parseInt(matches[1], 10);
            await imageService.deleteImage(imageId);
        } catch (error) {
            console.error('File deletion failed:', error);
            throw error;
        }
    }

    static async clearUploads() {
        try {
            // Get all images and delete them one by one
            const allImages = await imageService.getAllImages();
            for (const image of allImages) {
                await imageService.deleteImage(image.id);
            }
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
     * Get built-in theme IDs defined in collections/index.ts
     */
    getBuiltInThemeIds: (): string[] => {
        return [...BUILT_IN_THEMES];
    }
};

export { Theme, MediaService, ThemeManager };