import { languageSettings, type LanguageSchemaType } from '../schemas/language/language.schema';
import { SingletonDB } from './base';

export const LanguageService = new SingletonDB<LanguageSchemaType>(
    languageSettings,
);