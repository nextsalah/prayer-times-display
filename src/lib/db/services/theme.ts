import { SingletonDB } from './base';
import { themeSettings, type ThemeSettings } from '../schemas';

export const ThemeService = new SingletonDB<ThemeSettings>(
    themeSettings,
);