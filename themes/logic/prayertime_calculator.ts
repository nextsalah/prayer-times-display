import type { ApiData, AppDataResult, SinglePrayerOption } from '$lib/db/services/appDataService';
import type { PrayerTimeItem } from '../interfaces/types';
import { type PrayerTime } from '$lib/db/schemas/prayer/prayer-times.schema';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { writable } from 'svelte/store';

export const { subscribe: countdownToTextSubscribe, set: countdownToTextSet } = writable<string | null>(null);
export const { subscribe: nextPrayerTimeSubscribe, set: nextPrayerTimeSet } = writable<PrayerTimeItem | null>(null);

type PrayerKeys = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
type PrayerKeysWithSunrise = PrayerKeys | 'sunrise';

class PrayerTimeCalculator {
    private apiData: ApiData<any>;
    public prayerTimes: PrayerTimeItem[] = [];
    private PRAYERTIMES_KEYS: PrayerKeysWithSunrise[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

    constructor(data: AppDataResult<any>) {
        if (!data) {
            throw new Error('Api data is required');
        }
        this.apiData = data.apiData;
        this.initializePrayerTimes();
        this.updateNextPrayerTime();
        setInterval(this.updateNextPrayerTime.bind(this), 1000);
    }

    private initializePrayerTimes(): void {
        this.PRAYERTIMES_KEYS.forEach((key) => {
            if (key !== 'sunrise' && key in this.apiData.prayer_options) {
                this.prayerTimes.push(this.createPrayerTimeItem(key, this.apiData.prayertimes.today, this.apiData.prayer_options[key as keyof typeof this.apiData.prayer_options]));
            } else {
                this.prayerTimes.push(this.createPrayerTimeItem(key, this.apiData.prayertimes.today));
            }
        });
        // Add tomorrow's Fajr
        if ('fajr' in this.apiData.prayer_options) {
            this.prayerTimes.push(this.createPrayerTimeItem('fajr', this.apiData.prayertimes.tomorrow, this.apiData.prayer_options.fajr, 'fajr_tomorrow'));
        }
    }

    private createPrayerTimeItem(
        key: PrayerKeysWithSunrise,
        day: PrayerTime & { sunrise?: string },
        option?: SinglePrayerOption,
        customKey?: PrayerTimeItem['id']
    ): PrayerTimeItem {
        // For sunrise, use a special case since it's not in prayer options
        let timeStr: string;
        if (key === 'sunrise') {
            if (!day.sunrise) {
                throw new Error('Sunrise time not available');
            }
            timeStr = day.sunrise;
        } else {
            timeStr = day[key as PrayerKeys];
        }

        const time = this.convertStringToDayjs(timeStr, day.date);
        const prayerTimeItem: PrayerTimeItem = {
            id: customKey || key,
            name: this.apiData.language[key],
            time: time.toDate(),
            time_readable: timeStr,
            iqamah: null,
            iqamah_readable: null,
            showIqamah: false
        };

        if (option) {
            this.applyPrayerOptions(prayerTimeItem, option);
        }
        return prayerTimeItem;
    }

    private applyPrayerOptions(item: PrayerTimeItem, option: SinglePrayerOption): void {
        this.applyOffsetOption(item, option);
        this.applyFixedTimeOption(item, option);
        this.applyIqamahOption(item, option);
    }

    private applyOffsetOption(item: PrayerTimeItem, option: SinglePrayerOption): void {
        if (option.offset) {
            const updatedTime = dayjs(item.time).add(option.offset, 'minute');
            item.time = updatedTime.toDate();
            item.time_readable = updatedTime.format('HH:mm');
        }
    }

    private applyFixedTimeOption(item: PrayerTimeItem, option: SinglePrayerOption): void {
        if (option.isFixed && option.fixedTime) {
            const fixedTime = this.convertStringToDayjs(option.fixedTime, this.apiData.prayertimes.today.date);
            item.time = fixedTime.toDate();
            item.time_readable = fixedTime.format('HH:mm');
        }
    }

    private applyIqamahOption(item: PrayerTimeItem, option: SinglePrayerOption): void {
        item.showIqamah = option.showIqamah;
        if (option.showIqamah && option.iqamah) {
            const iqamahTime = dayjs(item.time).add(option.iqamah, 'minute');
            item.iqamah = iqamahTime.toDate();
            item.iqamah_readable = iqamahTime.format('HH:mm');
        }
    }

    private formatSecondsToTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
    
        const formattedHours = hours.toString().padStart(1, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
    
        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }

    private updateNextPrayerTime(): void {
        const now = dayjs();
        const nextPrayer = this.prayerTimes.find((item) => dayjs(item.time).isAfter(dayjs()));

        // if new prayer time is found, run nextPrayerTimeSet
        if (nextPrayer && this._nextPrayerTime && this._nextPrayerTime.id !== nextPrayer.id) {
            nextPrayerTimeSet(nextPrayer);
        }
        
        if (nextPrayer) {
            this._nextPrayerTime = nextPrayer;
            this._nextPrayerTimeCountdown = dayjs(nextPrayer.time).diff(now, 'second');
            countdownToTextSet(this.formatSecondsToTime(this._nextPrayerTimeCountdown));
        } else {
            this._nextPrayerTime = null;
            this._nextPrayerTimeCountdown = null;
        }
    }

    private _nextPrayerTime: PrayerTimeItem | null = null;
    get nextPrayerTime(): PrayerTimeItem | null {
        return this._nextPrayerTime;
    }

    private _nextPrayerTimeCountdown: number | null = null;
    get nextPrayerTimeCountdown(): number | null {
        return this._nextPrayerTimeCountdown;
    }

    public prayerHasPassed(prayerTime: PrayerTimeItem): boolean {
        return dayjs(prayerTime.time).isBefore(dayjs());
    }

    private convertStringToDayjs(time: string, date: Date): Dayjs {
        const [hoursStr, minutesStr] = time.split(':');
        const hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);
    
        const newDate = new Date(date);
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
    
        return dayjs(newDate);
    }
}

export default PrayerTimeCalculator;