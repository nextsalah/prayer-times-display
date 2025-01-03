import { Glob } from 'bun';
import { v4 as uuidv4 } from 'uuid';
import { readdir } from "node:fs/promises";
import type { 
  ThemeManifest, 
  ThemeCustomizationForm,
  ThemeUserSettings,
  Theme as ThemeType,
  ThemeList
} from '../interfaces/types';
import { 
  isThemeManifest, 
  isThemeCustomizationForm 
} from '../interfaces/types';
import path from 'node:path';


export const UPLOAD_BASE_PATH = process.env.UPLOADS_PATH || path.join(process.cwd(), 'uploads');
const getRootPath = () => path.resolve(process.cwd());

class FileManager {

    static async createUploadFolder() {
        try {
            await Bun.file(UPLOAD_BASE_PATH).exists();
        } catch {
            await Bun.write(UPLOAD_BASE_PATH, '');
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
            path: `/uploads/${filename}`,
        };
    }

    static async deleteFile(path: string) {
        const fullPath = `${UPLOAD_BASE_PATH}/${path}`;
        try {
            const file = Bun.file(fullPath);
            if (await file.exists()) {
                await Bun.write(fullPath, '');
            }
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
    static async listMedia() {
        try {
            // Implement logic to list media files
            // This might involve reading from a database or file system
            return [];
        } catch (error) {
            return [];
        }
    }

    static async uploadMedia(file: File) {
        try {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
            if (!validTypes.includes(file.type)) {
                throw new Error('Invalid file type');
            }

            // Validate file size (e.g., max 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                throw new Error('File size exceeds 10MB limit');
            }

            // Upload file using FileManager
            const uploadResult = await FileManager.saveFile(file);

            // Store media metadata (you'll need to implement this)
            await this.storeMediaMetadata(uploadResult);

            return uploadResult;
        } catch (error) {
            throw error;
        }
    }

    static async storeMediaMetadata(uploadResult: { 
        id: string; 
        name: string; 
        path: string; 
        type: string; 
    }) {
        // Implement method to store media metadata in your database
        // This is a placeholder - you'll need to adapt this to your specific database
        console.log('Storing media metadata:', uploadResult);
    }

    static async deleteMedia(mediaId: string) {
        try {
            // Retrieve media metadata
            const media = await this.getMediaMetadata(mediaId) as { path: string } | null;
            
            if (!media) {
                throw new Error('Media not found');
            }

            // Delete file from uploads
            await FileManager.deleteFile(media.path.split('/').pop()!);

            // Remove metadata from database (implement this method)
            await this.removeMediaMetadata(mediaId);

            return { success: true };
        } catch (error) {
            throw error;
        }
    }

    static async getMediaMetadata(mediaId: string) {
        // Implement method to retrieve media metadata from your database
        // This is a placeholder
        return null;
    }

    static async removeMediaMetadata(mediaId: string) {
        // Implement method to remove media metadata from your database
        // This is a placeholder
        console.log('Removing media metadata:', mediaId);
    }
}

class Theme {
    private readonly folderPath: string;
    private readonly manifest: ThemeManifest;
    private readonly customizationForm: ThemeCustomizationForm;

    private constructor(
        folderPath: string,
        manifest: ThemeManifest,
        customizationForm: ThemeCustomizationForm,
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

    static async list(): Promise<string[]> {
        try {
            const themePath = `${getRootPath()}/themes/collections`;
            return await readdir(themePath);            
        } catch (error) {
            console.error('Failed to read themes directory:', error);
            return [];
        }
    }

    static async exists(name: string): Promise<boolean> {
        const themes = await this.list();
        return themes.includes(name);
    }

    static async loadManifest(name: string): Promise<ThemeManifest> {
        try {
            return await this.readJson(name, 'manifest.json') as ThemeManifest;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'unknown error';
            throw new Error(`Failed to read manifest: ${message}`);
        }
    }

    static async loadCustomizationForm(name: string): Promise<ThemeCustomizationForm> {
        try {
            const form = await this.readJson(name, 'customization.json');
            if (!isThemeCustomizationForm(form)) {
                throw new Error('Invalid customization form format');
            }
            return form;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'unknown error';
            throw new Error(`Failed to read customization form: ${message}`);
        }
    }

    static async getAllThemes(): Promise<ThemeList> {
        const themes = await this.list();
        return await Promise.all(
            themes.map(async name => {
                const manifest = await this.loadManifest(name);
                return { 
                    value: name,
                    name: manifest.name,
                    description: manifest.description 
                };
            })
        );
    }

    get folderName(): string {
        return this.folderPath;
    }

    get absolutePath(): string {
        return `${getRootPath()}/themes/collections/${this.folderPath}`;
    }

    get name(): string {
        return this.manifest.name;
    }

    get description(): string {
        return this.manifest.description;
    }

    get customization(): ThemeCustomizationForm {
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

    private static async readJson(name: string, file: string): Promise<unknown> {
        const path = `${getRootPath()}/themes/collections/${name}/${file}`;
        try {
            return await Bun.file(path).json();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'unknown error';
            throw new Error(`Failed to read ${file}: ${message}`);
        }
    }
}

export { Theme, FileManager , MediaService };