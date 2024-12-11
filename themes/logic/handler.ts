import { Glob } from 'bun';
import { isTemplatesType, isConfigType, isCustomTemplatesType } from '../interfaces/types';
import type * as types from '../interfaces/types.ts';
import { v4 as uuidv4 } from 'uuid';
import { readdir } from "node:fs/promises";

// Get the current working directory
function getBasePath(): string {
    return process.cwd();
}

export class FileHandler {
    static staticFolderPath = `${getBasePath()}/static`;

    static async createFolderIfNotExists() {
        const folderPath = `${FileHandler.staticFolderPath}/uploads`;
        try {
            await Bun.file(folderPath).exists();
        } catch {
            await Bun.write(folderPath, '');
        }
    }

    static async uploadFile(file: File) {
        await FileHandler.createFolderIfNotExists();

        const fileID = uuidv4();
        const fileName = `${fileID}-${file.name}`;
        const filePath = `${FileHandler.staticFolderPath}/uploads/${fileName}`;

        await Bun.write(filePath, file);

        return {
            id: fileID,
            name: file.name,
            type: file.type,
            url: `/uploads/${fileName}`,
        };
    }

    static async deleteFile(filePath: string) {
        const fullPath = `${FileHandler.staticFolderPath}/uploads/${filePath}`;
        try {
            const file = Bun.file(fullPath);
            if (await file.exists()) {
                await Bun.write(fullPath, ''); // Bun's way to delete
            }
        } catch (error) {
            console.error(`Failed to delete file: ${fullPath}`, error);
        }
    }

	static async clearUploadsFolder() {
		try {
			const uploadsFolderPath = `${FileHandler.staticFolderPath}/uploads`;
			const glob = new Glob("*");
			const files = await Array.fromAsync(glob.scan({ cwd: uploadsFolderPath }));
			
			await Promise.all(files.map(file => 
				Bun.write(`${uploadsFolderPath}/${file}`, '')
			));
		} catch (error) {
			console.error('Failed to clear uploads folder', error);
		}
	}
}
class Theme {
    private folderName: string;
    private config: types.ConfigType;
    private themeTemplates: types.TemplatesType;

    private constructor(
        themeFolderName: string,
        config: types.ConfigType,
        themeTemplates: types.TemplatesType,
    ) {
        this.folderName = themeFolderName;
        this.config = config;
        this.themeTemplates = themeTemplates;
    }

    // Renamed from create to loadTheme to better reflect what it does
    static async loadTheme(themeName: string): Promise<Theme | Error> {
        if (!(await Theme.isThemeAvailable(themeName))) {
            return new Error(`Theme "${themeName}" not found`);
        }

        try {
            const themeConfig = await this.loadThemeConfig(themeName);
            const themeTemplates = await this.loadThemeTemplates(themeName);

            if (!isConfigType(themeConfig)) {
                return new Error(`Invalid configuration for theme "${themeName}"`);
            }

            if (!isTemplatesType(themeTemplates)) {
                return new Error(`Invalid templates for theme "${themeName}"`);
            }

            return new Theme(themeName, themeConfig, themeTemplates);
        } catch (error) {
            if (error instanceof Error) {
                return new Error(`Failed to load theme "${themeName}": ${error.message}`);
            }
            return new Error(`Failed to load theme "${themeName}": unknown error`);
        }
    }

    // Renamed from getAllAvailableThemes to listInstalledThemes
    static async listInstalledThemes(): Promise<string[]> {
        try {
            const themesPath = `${getBasePath()}/themes/collections`;
            const themeDirectories = await readdir(themesPath);
            return themeDirectories;            
        } catch (error) {
            console.error('Error scanning themes directory:', error);
            return [];
        }
    }

    // Renamed from isValidTheme to isThemeAvailable
    static async isThemeAvailable(themeName: string): Promise<boolean> {
        const installedThemes = await Theme.listInstalledThemes();
        return installedThemes.includes(themeName);
    }

    // Renamed from getConfig to loadThemeConfig
    static async loadThemeConfig(themeName: string): Promise<types.ConfigType> {
        try {
            return await Theme.readFileJson(themeName, 'config.json');
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to load config for theme "${themeName}": ${error.message}`);
            }
            throw new Error(`Failed to load config for theme "${themeName}": unknown error`);
        }
    }

    // Renamed from getTemplate to loadThemeTemplates
    static async loadThemeTemplates(themeName: string): Promise<types.TemplatesType> {
        try {
            const templates = await Theme.readFileJson(themeName, 'template.json');
            if (!isTemplatesType(templates)) {
                throw new Error('Invalid template format');
            }
            return templates;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to load templates for theme "${themeName}": ${error.message}`);
            }
            throw new Error(`Failed to load templates for theme "${themeName}": unknown error`);
        }
    }

    // Renamed from AllThemes to getThemesList for consistency
    static async getThemesList(): Promise<types.AllThemesType[]> {
        const availableThemes = await Theme.listInstalledThemes();
        return await Promise.all(
            availableThemes.map(async themeName => {
                const config = await Theme.loadThemeConfig(themeName);
                return { value: themeName, name: config.name };
            })
        );
    }

    // Getters with more descriptive names
    get themePath(): string {
        return this.folderName;
    }

    get themeAbsolutePath(): string {
        return `${getBasePath()}/themes/collections/${this.folderName}`;
    }

    get themeSettings(): types.DefaultTemplatesType {
        return Object.fromEntries(
            this.themeTemplates
                .filter(setting => setting.value != null)
                .map(setting => [setting.name, setting.value])
        );
    }

     // Utility method for reading and parsing JSON files
     private static async readFileJson(themeName: string, fileName: string): Promise<any> {
        const filePath = `${getBasePath()}/themes/collections/${themeName}/${fileName}`;
        try {
            const file = Bun.file(filePath);
            return await file.json();
        } catch (error) {
            throw new Error(`Failed to read ${fileName} for theme "${themeName}": ${error instanceof Error ? error.message : 'unknown error'}`);
        }
    }

    // Utility method for reading text files
    private static async readFile(themeName: string, fileName: string): Promise<string> {
        const filePath = `${getBasePath()}/themes/collections/${themeName}/${fileName}`;
        try {
            const file = Bun.file(filePath);
            return await file.text();
        } catch (error) {
            throw new Error(`Failed to read ${fileName} for theme "${themeName}": ${error instanceof Error ? error.message : 'unknown error'}`);
        }
    }

    // Utility method for safe JSON parsing with type checking
    private static async safeJsonParse<T>(
        guard: (o: unknown) => o is T,
        text: string,
    ): Promise<types.ParseResult<T>> {
        try {
            const parsed = JSON.parse(text);
            return guard(parsed) ? { parsed, hasError: false } : { hasError: true };
        } catch {
            return { hasError: true };
        }
    }
}

export default Theme;