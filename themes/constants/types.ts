import type { ApiData } from '../interfaces/api';
import type { IField } from '@ismail424/svelte-formly';
import path from 'path';

export const UPLOAD_BASE_PATH = path.join(process.cwd(), 'static', 'uploads');

export interface prayerTimes{
    id: number;
    date: Date;
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
};
export type ScreenPageServerLoad<T extends IField[]> = {
    prayerTimes: {
        today: prayerTimes;
        tomorrow: prayerTimes;
        dayAfterTomorrow: prayerTimes;
    };
    componentPath: string;
    apiData: ApiData<T>;
};
