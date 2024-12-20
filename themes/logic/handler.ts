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

function getRootPath(): string {
    return process.cwd();
}

class FileManager {
    private static uploadPath = `${getRootPath()}/static/uploads`;

    static async createUploadFolder() {
        try {
            await Bun.file(this.uploadPath).exists();
        } catch {
            await Bun.write(this.uploadPath, '');
        }
    }

    static async saveFile(file: File) {
        await this.createUploadFolder();

        const id = uuidv4();
        const filename = `${id}-${file.name}`;
        const path = `${this.uploadPath}/${filename}`;

        await Bun.write(path, file);

        return {
            id,
            name: file.name,
            type: file.type,
            path: `/uploads/${filename}`,
        };
    }

    static async deleteFile(path: string) {
        const fullPath = `${this.uploadPath}/${path}`;
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
            const files = await Array.fromAsync(glob.scan({ cwd: this.uploadPath }));
            
            await Promise.all(files.map(file => 
                Bun.write(`${this.uploadPath}/${file}`, '')
            ));
        } catch (error) {
            console.error('Cannot clear uploads folder', error);
        }
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

export { Theme, FileManager };