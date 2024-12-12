import { SingletonDB } from './base';
import { themeSettings, type ThemeSettings } from '../schemas';

export const ThemeDB = new SingletonDB<ThemeSettings>(
    themeSettings,
);