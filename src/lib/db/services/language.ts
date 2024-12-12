import { languageSettings, type LanguageSettings } from '../schemas/language/language.schema';
import { SingletonDB } from './base';

export const LanguageService = new SingletonDB<LanguageSettings>(
    languageSettings,
);