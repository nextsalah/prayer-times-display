// src/lib/db/services/PrayerConfigService.ts
import { SingletonDB } from './base';
import { 
    prayerConfig, 
    type Prayer, 
    type PrayerSettings,
    type SettingsForPrayer,
    type DbPrayerConfig
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

    // Get settings for specific prayer
    async getPrayer<P extends Prayer>(prayer: P): Promise<SettingsForPrayer<P>> {
        const settings = await this.getAll();
        return settings[prayer];
    }

    // Update settings for specific prayer
    async updatePrayer<P extends Prayer>(
        prayer: P, 
        updates: Partial<SettingsForPrayer<P>>
    ): Promise<PrayerSettings> {
        const settings = await this.getAll();
        settings[prayer] = { 
            ...settings[prayer], 
            ...updates 
        };
        
        await this.update({ settings: JSON.stringify(settings) });
        return settings;
    }
}

export const prayerConfigService = new PrayerConfigService();