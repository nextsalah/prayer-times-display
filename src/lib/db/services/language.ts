import { eq } from "drizzle-orm";
import { db } from "../db.server";
import { languageSettings, type LanguageSchemaType } from "../schemas/language/language.schema";
import { SingletonDB } from "./base";

export class LanguageService extends SingletonDB<LanguageSchemaType> {
    constructor() {
        super(languageSettings);
    }

    async saveCustomizations(code: string, customizations: Partial<LanguageSchemaType>) {
        const existingSettings = await db.query.languageSettings.findFirst({
            where: eq(languageSettings.language_code, code)
        });

        if (existingSettings) {
            // Update existing customizations
            return await db
                .update(languageSettings)
                .set({ ...customizations, language_code: code })
                .where(eq(languageSettings.language_code, code))
                .execute();
        } else {
            // Create new customizations
            return await db
                .insert(languageSettings)
                .values({ ...customizations, language_code: code })
                .execute();
        }
    }

    async getCustomizations(code: string) {
        return await db.query.languageSettings.findFirst({
            where: eq(languageSettings.language_code, code)
        });
    }
}

export const languageService = new LanguageService();