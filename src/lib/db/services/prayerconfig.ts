// src/lib/db/services/PrayerConfigService.ts
import { SingletonDB } from './base';
import { 
    prayerConfig, 
    type Prayer, 
    type PrayerSettings,
    type SettingsForPrayer,
    type DbPrayerConfig,
    validatePrayerSettings
} from '../schemas';

export class PrayerConfigService extends SingletonDB<DbPrayerConfig> {
    constructor() {
        super(prayerConfig);
    }

    // Get all prayer settings
    async getAll(): Promise<PrayerSettings> {
        const result = await this.get();
        return JSON.parse(result.settings);
    }

    // Get settings for specific prayer with proper typing
    async getPrayer<P extends Prayer>(prayer: P): Promise<SettingsForPrayer<P>> {
        const settings = await this.getAll();
        return settings[prayer] as SettingsForPrayer<P>;
    }

    // Update settings for specific prayer with proper type handling
    async updatePrayer<P extends Prayer>(
        prayer: P, 
        updates: Partial<SettingsForPrayer<P>>
    ): Promise<PrayerSettings> {
        const settings = await this.getAll();
        
        // Create a properly typed update object that includes the prayer type
        const updatedSettings = {
            ...settings[prayer],
            ...updates,
            type: prayer
        };
        
        // Ensure the update matches our schema expectations
        const validatedSettings = validatePrayerSettings(prayer, updatedSettings);
        
        // Update the specific prayer settings
        settings[prayer] = validatedSettings as PrayerSettings[P];
        
        // Save all settings
        await this.update({ settings: JSON.stringify(settings) });
        
        return settings;
    }
}

export const prayerConfigService = new PrayerConfigService();