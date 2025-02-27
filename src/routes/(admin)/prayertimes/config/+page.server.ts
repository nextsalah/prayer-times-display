import type { PageServerLoad } from './$types';
import { PrayerConfigService } from '$lib/db';
export const load = (async () => {
    const prayerConfigService = new PrayerConfigService();
    const settings = await prayerConfigService.getAll();
    return {
        title: 'Config',
        settings
    };
}) satisfies PageServerLoad;