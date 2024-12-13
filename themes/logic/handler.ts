import { Glob } from 'bun';
import { isTemplatesType, isConfigType, isCustomTemplatesType } from '../interfaces/types';
import type * as types from '../interfaces/types.ts';
import { v4 as uuidv4 } from 'uuid';
import { readdir } from "node:fs/promises";

function getRootPath(): string {
    return process.cwd();
}

export class Files {
    static uploadPath = `${getRootPath()}/static/uploads`;

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
    private folder: string;
    private config: types.ConfigType;
    private template: types.TemplatesType;

    private constructor(
        folder: string,
        config: types.ConfigType,
        template: types.TemplatesType,
    ) {
        this.folder = folder;
        this.config = config;
        this.template = template;
    }

    static async load(name: string): Promise<Theme | Error> {
        if (!(await this.exists(name))) {
            return new Error(`Theme "${name}" not found`);
        }

        try {
            const config = await this.loadConfig(name);
            const template = await this.loadTemplate(name);

            if (!isConfigType(config)) {
                return new Error(`Bad config for theme "${name}"`);
            }

            if (!isTemplatesType(template)) {
                return new Error(`Bad template for theme "${name}"`);
            }

            return new Theme(name, config, template);
        } catch (error) {
            if (error instanceof Error) {
                return new Error(`Cannot load theme "${name}": ${error.message}`);
            }
            return new Error(`Cannot load theme "${name}"`);
        }
    }

    static async list(): Promise<string[]> {
        try {
            const themePath = `${getRootPath()}/themes/collections`;
            return await readdir(themePath);            
        } catch (error) {
            console.error('Cannot read themes folder:', error);
            return [];
        }
    }

    static async exists(name: string): Promise<boolean> {
        const themes = await this.list();
        return themes.includes(name);
    }

    static async loadConfig(name: string): Promise<types.ConfigType> {
        try {
            return await this.readJson(name, 'config.json');
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Cannot read config: ${error.message}`);
            }
            throw new Error('Cannot read config');
        }
    }

    static async loadTemplate(name: string): Promise<types.TemplatesType> {
        try {
            const template = await this.readJson(name, 'template.json');
            if (!isTemplatesType(template)) {
                throw new Error('Bad template format');
            }
            return template;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Cannot read template: ${error.message}`);
            }
            throw new Error('Cannot read template');
        }
    }

    static async getAll(): Promise<types.AllThemesType[]> {
        const themes = await this.list();
        return await Promise.all(
            themes.map(async name => {
                const config = await this.loadConfig(name);
                return { value: name, name: config.name, description: config.description };
            })
        );
    }

    get folderName(): string {
        return this.folder;
    }

    get fullPath(): string {
        return `${getRootPath()}/themes/collections/${this.folder}`;
    }

    get name(): string {
        return this.config.name;
    }

    get description(): string {
        return this.config.description;
    }

    get themeTemplate(): types.TemplatesType {
        return this.template;
    }

    get themeConfig(): types.ConfigType {
        return this.config;
    }

    get defaults(): types.DefaultSettingsType {
        return Object.fromEntries(
            this.template
                .filter(setting => setting.value != null)
                .map(setting => [setting.name, setting.value])
        );
    }

    private static async readJson(name: string, file: string): Promise<any> {
        const path = `${getRootPath()}/themes/collections/${name}/${file}`;
        try {
            return await Bun.file(path).json();
        } catch (error) {
            throw new Error(`Cannot read ${file}: ${error instanceof Error ? error.message : 'unknown error'}`);
        }
    }

    private static async readText(name: string, file: string): Promise<string> {
        const path = `${getRootPath()}/themes/collections/${name}/${file}`;
        try {
            return await Bun.file(path).text();
        } catch (error) {
            throw new Error(`Cannot read ${file}: ${error instanceof Error ? error.message : 'unknown error'}`);
        }
    }

    private static async checkJson<T>(
        isValid: (o: unknown) => o is T,
        text: string,
    ): Promise<types.ParseResult<T>> {
        try {
            const data = JSON.parse(text);
            return isValid(data) ? { parsed: data, hasError: false } : { hasError: true };
        } catch {
            return { hasError: true };
        }
    }
}

export default Theme;