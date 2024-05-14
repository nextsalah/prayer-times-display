export type ScreenPageServerLoad = {
    prayerTimes: {
        id: number;
        date: Date;
        fajr: string;
        sunrise: string;
        dhuhr: string;
        asr: string;
        maghrib: string;
        isha: string;
    }[];
    componentPath: string;
};

