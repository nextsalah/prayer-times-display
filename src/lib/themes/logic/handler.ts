import { isTemplatesType, isCustomTemplatesType, isConfigType } from '../interfaces/types';
import type * as types from '../interfaces/types.ts';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';


export class FileHandler {
	static staticFolderPath = path.resolve('static');

	static async createFolderIfNotExists() {
	  const folderPath = path.join(FileHandler.staticFolderPath, 'uploads');
	  try {
		await fs.promises.access(folderPath, fs.constants.F_OK);
	  } catch {
		await fs.promises.mkdir(folderPath);
	  }
	}
	static async uploadFile(file: File) {
		await FileHandler.createFolderIfNotExists();
	
		const fileID = uuidv4();
		const filePath = path.join(FileHandler.staticFolderPath, 'uploads', `${fileID}-${file.name}`);
	
		const buffer = Buffer.from(await file.arrayBuffer());
		const uint8Array = new Uint8Array(buffer);
		await fs.promises.writeFile(filePath, uint8Array);
		return {
		  id: fileID,
		  name: file.name,
		  type: file.type,
		  url: '/uploads/' + `${fileID}-${file.name}`,
		};
	  }

	// Delete a file from the static folder and return a boolean indicating whether the file was deleted or not
	static async deleteFile(filePath: string) {
		const fullPath = path.join(FileHandler.staticFolderPath, "uploads", filePath);
		try {
			if ( fs.existsSync(fullPath) ) {
				fs.promises.unlink(fullPath);
			}else{
				console.error(`File does not exist: ${fullPath}`);
			}
		} catch {
			console.error(`Failed to delete file: ${fullPath}`);
		}
	}
	static async clearUploadsFolder() {
        const uploadsFolderPath = path.join(FileHandler.staticFolderPath, 'uploads');
        try {
            // Read the contents of the uploads folder
            const files = await fs.promises.readdir(uploadsFolderPath);
            await Promise.all(files.map(async (file) => {
                const filePath = path.join(uploadsFolderPath, file);
                try {
                    await fs.promises.unlink(filePath);
                } catch (error) {
                    console.error(`Failed to delete file: ${filePath}`, error);
                }
            }));
        } catch (error) {
            console.error('Failed to clear uploads folder', error);
        }
    }
}
  
class Theme {
	folderName: string;
	config: types.ConfigType;
	themeTemplates: types.TemplatesType;

	private constructor(
	themeFolderName: string,
	config: types.ConfigType,
	themeTemplates: types.TemplatesType,
	) {
		this.folderName = themeFolderName;
		this.config = config;
		this.themeTemplates = themeTemplates;
	}

	get absoluteFolderPath(): string {
		return path.resolve(path.join('themes', 'theme_files', this.folderName));
	}

	static absoluteFolderPath(themeFolderName: string): string {
		return path.resolve(path.join('themes', 'theme_files', themeFolderName));
	}

	static safeJsonParse<T>(
		guard: (o: unknown) => o is T,
		text: string,
		): types.ParseResult<T> {
			try {
				const parsed = JSON.parse(text);
				return guard(parsed) ? { parsed, hasError: false } : { hasError: true };
			} catch (error) {
				return { hasError: true };
			}
		}
	
		static readFile(folder: string, file: string): string | Error {
			try {
				return fs.readFileSync(path.join('themes', 'theme_files', folder, file), 'utf8');
			} catch (error) {
				return new Error(`Failed to read file: ${folder}/${file}`);
			}
		}
	get folderPath(): string {
		const folderPath = path.join('themes', 'theme_files', this.folderName);
		//remove themes from the path
		return folderPath.replace('themes/', '').replace('theme_files/', '');
	}
	/**
		 * It takes a string, parses it as JSON, and returns the result if it's valid, or an error if it's not
		 * @param {string} customTemplatesInput - string - The stringified JSON object that contains the custom
		 * templates
		* @returns A function that takes a string and returns either a CustomTemplatesType or an Error.
	*/
	public parseCustomTemplates(customTemplatesInput: string): types.CustomTemplatesType | Error {
		const customTemplates = Theme.safeJsonParse<types.CustomTemplatesType>(
			isCustomTemplatesType,
			customTemplatesInput,
		);

		if (customTemplates.hasError) 
			return new Error('Failed to parse custom templates');
		
		return customTemplates.parsed;
	}
	/**
	 * It returns an object with the same keys as the themeTemplates array, but with the values set to
	 * the value of the setting
	 * @returns The defaultTemplates object.
	 */
	get defaultTemplates(): types.DefaultTemplatesType {
		let defaultTemplates: types.DefaultTemplatesType = {};
		for (const setting of this.themeTemplates) {
			if (setting.value == null) { continue; }
			defaultTemplates[setting.name] = setting.value;
		}
		return defaultTemplates;
	}

	static async readFileJson(folder: string, file_name: string):  Promise<any> {
		const file_path = path.join(Theme.absoluteFolderPath(folder), file_name);
		const file = Bun.file(file_path);
		return await JSON.parse(await file.text());
	}

	static async getConfig(folderName: string): Promise<types.ConfigType>{
		const config = await Theme.readFileJson(folderName, 'config.json');
		return config;
	}

	static async getTemplate(folderName: string): Promise<types.TemplatesType> {
		const templates = await Theme.readFileJson(folderName, 'template.json') as types.TemplatesType;
		return templates;
	}

	static async getAllAvailableThemes(): Promise<string[]> {
		const themes = fs.readdirSync(path.join('themes', 'theme_files'));
		return themes;
	}

	/**
	 * It gets all the available themes, gets the config for each theme, and if there's no error, it adds
	 * the theme to the array
	 * @returns An array of objects with the theme name and the theme value.
	 */
	static async AllThemes(): Promise<types.AllThemesType[]> {
		const availableThemes = await Theme.getAllAvailableThemes();
		const allThemes: types.AllThemesType[] = [];
		for (const theme of availableThemes) {
			const config = await this.getConfig(theme);
			allThemes.push({ value: theme, name: config.name });
		}
		return allThemes;
	}

	/**
	 * "Given a theme folder name, return true if the theme is valid, otherwise return false."
	 * 
	 * The function is marked as `async` because it uses the `await` keyword. The `await` keyword is used
	 * to wait for a promise to resolve
	 * @param {string} themeFolderName - The name of the theme folder.
	 * @returns A boolean value.
	 */
	static async isValidTheme(themeFolderName: string): Promise<boolean> {
		const availableThemes = await Theme.getAllAvailableThemes();
		return availableThemes.includes(themeFolderName);
	}

	/**
	 * > It creates a new theme object from a theme folder name
	 * @param {string} themeFolderName - The name of the theme folder.
	 * @returns A promise that resolves to a Theme object or an Error object.
	 */
	static async create(
	themeFolderName: string,
	): Promise<Theme | Error> {
		if (!(await Theme.isValidTheme(themeFolderName))) 
			return new Error('Theme not found with name ' + themeFolderName);
		
		const config = await this.getConfig(themeFolderName);
		const themeTemplates = await this.getTemplate(themeFolderName);
		if (!isConfigType(config)) 
			return new Error('Invalid config file');

		if (!isTemplatesType(themeTemplates))
			return new Error('Invalid template file');

		if (themeTemplates == undefined || themeTemplates == null)
			return new Error('Invalid template file');

		return new Theme(themeFolderName, config, themeTemplates);
	}
}
export default Theme;