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
export type ScreenPageServerLoad = {
    prayerTimes: {
        today: prayerTimes;
        tomorrow: prayerTimes;
        dayAfterTomorrow: prayerTimes;
    };
    componentPath: string;
};
