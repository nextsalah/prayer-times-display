import { SingletonDB } from './base';
import { themeSettings, type ThemeSettings } from '../schemas';

export const Theme = new SingletonDB<ThemeSettings>(
    themeSettings,
);