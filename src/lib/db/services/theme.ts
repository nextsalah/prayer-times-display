// src/lib/db/services/themeService.ts
import { SingletonDB } from './base';
import { themeSettings, type ThemeSettings } from '../schemas';

/**
 * Service for managing theme settings
 */
export class ThemeSettingsService extends SingletonDB<ThemeSettings> {
  constructor() {
    super(themeSettings);
  }

  /**
   * Update the theme name
   */
  async updateThemeName(themeName: string): Promise<Omit<ThemeSettings, 'id'>> {
    return this.update({ 
      themeName , 
      updatedAt: new Date() 
    });
  }

  /**
   * Update custom settings (JSON string)
   */
  async updateCustomSettings(customSettings: string): Promise<Omit<ThemeSettings, 'id'>> {
    return this.update({ 
      customSettings,
      updatedAt: new Date()
     });
  }

  /**
   * Update custom settings from object (automatically stringifies)
   */
  async updateCustomSettingsObject(customSettings: Record<string, any>): Promise<Omit<ThemeSettings, 'id'>> {
    return this.update({ 
      customSettings: JSON.stringify(customSettings),
      updatedAt: new Date()
    });
  }

  /**
   * Toggle QR code visibility
   */
  async toggleQrCode(show?: boolean): Promise<Omit<ThemeSettings, 'id'>> {
    const current = await this.get();
    const showQrCode = show !== undefined ? show : !current.showQrCode;
    return this.update({ showQrCode });
  }

  /**
   * Set QR code visibility
   */
  async setQrCodeVisibility(visible: boolean): Promise<Omit<ThemeSettings, 'id'>> {
    return this.update({ showQrCode: visible });
  }


  /**
   * Get parsed custom settings as object
   */
  async getCustomSettingsObject<T = Record<string, any>>(): Promise<T> {
    const settings = await this.get();
    try {
      return JSON.parse(settings.customSettings) as T;
    } catch (error) {
      console.error('Error parsing custom settings:', error);
      return {} as T;
    }
  }

  /**
   * Reset theme to defaults
   */
  async resetToDefaults(): Promise<Omit<ThemeSettings, 'id'>> {
    return this.reset({
      themeName: 'default',
      customSettings: '{}',
      showQrCode: true,
    });
  }

  /**
   * Get default theme settings
   * Used internally for fallbacks
   */
  getDefaultSettings(): Omit<ThemeSettings, 'id'> {
    return {
      themeName: 'default',
      customSettings: '{}',
      showQrCode: true,
      updatedAt: new Date()
    };
  }
}

// Export singleton instance
export const themeService = new ThemeSettingsService();