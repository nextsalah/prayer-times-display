import type { ApiData, AppDataResult, SinglePrayerOption } from '$lib/db/services/appDataService';
import type { PrayerTimeItem } from '../interfaces/types';
import { type PrayerTime } from '$lib/db/schemas/prayer/prayer-times.schema';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { writable } from 'svelte/store';

// Default empty prayer time item for initialization
const DEFAULT_PRAYER_TIME: PrayerTimeItem = {
    id: 'none',
    name: '',
    time: new Date(),
    time_readable: '--:--',
    iqamah: undefined,
    iqamah_readable: undefined,
    showIqamah: false
};

// Default prayer times if values are missing
const DEFAULT_TIMES: Record<string, string> = {
    fajr: '05:00',
    sunrise: '06:30',
    dhuhr: '12:00',
    asr: '15:30',
    maghrib: '18:00',
    isha: '19:30'
};

export const { subscribe: countdownToTextSubscribe, set: countdownToTextSet } = writable<string>('--:--:--');
export const { subscribe: nextPrayerTimeSubscribe, set: nextPrayerTimeSet } = writable<PrayerTimeItem>(DEFAULT_PRAYER_TIME);
export const { subscribe: allPrayerTimesSubscribe, set: allPrayerTimesSet } = writable<PrayerTimeItem[]>([]);

type PrayerKeys = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
type PrayerKeysWithSunrise = PrayerKeys | 'sunrise';

class PrayerTimeCalculator {
    private apiData: ApiData;
    public prayerTimes: PrayerTimeItem[] = [];
    private PRAYERTIMES_KEYS: PrayerKeysWithSunrise[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    private updateInterval: ReturnType<typeof setInterval> | null = null;

    constructor(data: AppDataResult) {
        if (!data || !data.apiData) {
            console.error('Invalid API data provided to PrayerTimeCalculator', data);
            throw new Error('Valid API data is required for PrayerTimeCalculator');
        }
        
        console.log('PrayerTimeCalculator initialized with data:', {
            today: data.apiData.prayertimes.today,
            tomorrow: data.apiData.prayertimes.tomorrow
        });
        
        this.apiData = data.apiData;
        this.initializePrayerTimes();
        this.updateNextPrayerTime();
        
        // Clear any existing interval to prevent memory leaks
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.updateInterval = setInterval(this.updateNextPrayerTime.bind(this), 1000);
    }

    private initializePrayerTimes(): void {
        try {
            console.log('Initializing prayer times with data:', {
                todayDate: this.apiData.prayertimes.today.date,
                todayFajr: this.apiData.prayertimes.today.fajr,
                tomorrowDate: this.apiData.prayertimes.tomorrow?.date
            });
            
            this.prayerTimes = [];
            
            // Add today's prayer times
            this.PRAYERTIMES_KEYS.forEach((key) => {
                try {
                    if (key !== 'sunrise' && key in this.apiData.prayer_options) {
                        this.prayerTimes.push(this.createPrayerTimeItem(
                            key, 
                            this.apiData.prayertimes.today, 
                            this.apiData.prayer_options[key as keyof typeof this.apiData.prayer_options]
                        ));
                    } else {
                        this.prayerTimes.push(this.createPrayerTimeItem(key, this.apiData.prayertimes.today));
                    }
                } catch (error) {
                    console.error(`Error creating prayer time for ${key}:`, error);
                    // Create a fallback prayer time
                    this.prayerTimes.push(this.createFallbackPrayerTime(key));
                }
            });
            
            // Add tomorrow's Fajr
            if (this.apiData.prayertimes.tomorrow && 'fajr' in this.apiData.prayer_options) {
                try {
                    this.prayerTimes.push(
                        this.createPrayerTimeItem(
                            'fajr', 
                            this.apiData.prayertimes.tomorrow, 
                            this.apiData.prayer_options.fajr, 
                            'fajr_tomorrow'
                        )
                    );
                } catch (error) {
                    console.error('Error creating tomorrow\'s fajr time:', error);
                    // Create a fallback prayer time for tomorrow's fajr
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    this.prayerTimes.push(this.createFallbackPrayerTime('fajr', tomorrow, 'fajr_tomorrow'));
                }
            } else {
                console.warn('Tomorrow\'s fajr data not available, creating fallback');
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                this.prayerTimes.push(this.createFallbackPrayerTime('fajr', tomorrow, 'fajr_tomorrow'));
            }
            
            console.log('Successfully initialized prayer times:', this.prayerTimes);
            
            // Update the store with all prayer times
            allPrayerTimesSet(this.prayerTimes);
            
        } catch (error) {
            console.error('Failed to initialize prayer times:', error);
            // Create fallback prayer times for all prayers
            this.createFallbackPrayerTimes();
        }
    }

    private createFallbackPrayerTimes(): void {
        this.prayerTimes = [];
        const today = new Date();
        
        this.PRAYERTIMES_KEYS.forEach(key => {
            this.prayerTimes.push(this.createFallbackPrayerTime(key, today));
        });
        
        // Add tomorrow's Fajr
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        this.prayerTimes.push(this.createFallbackPrayerTime('fajr', tomorrow, 'fajr_tomorrow'));
        
        console.log('Created fallback prayer times:', this.prayerTimes);
        allPrayerTimesSet(this.prayerTimes);
    }

    private createFallbackPrayerTime(
        key: PrayerKeysWithSunrise, 
        date: Date = new Date(), 
        customId?: string
    ): PrayerTimeItem {
        const defaultTime = DEFAULT_TIMES[key] || '12:00';
        const prayerName = this.apiData?.language?.[key] || key.charAt(0).toUpperCase() + key.slice(1);
        
        const time = this.convertStringToDayjs(defaultTime, date);
        
        return {
            id: customId || key,
            name: prayerName,
            time: time.toDate(),
            time_readable: defaultTime,
            iqamah: undefined,
            iqamah_readable: undefined,
            showIqamah: false
        };
    }

    private createPrayerTimeItem(
        key: PrayerKeysWithSunrise,
        day: PrayerTime & { sunrise?: string },
        option?: SinglePrayerOption,
        customKey?: PrayerTimeItem['id']
    ): PrayerTimeItem {
        if (!day) {
            throw new Error(`Invalid day data for prayer ${key}`);
        }
        
        // Get the correct time string for this prayer
        let timeStr: string;
        if (key === 'sunrise') {
            if (!day.sunrise) {
                console.warn(`Sunrise time not available for ${day.date}, using default`);
                timeStr = DEFAULT_TIMES.sunrise;
            } else {
                timeStr = day.sunrise;
            }
        } else {
            if (!day[key as PrayerKeys]) {
                console.warn(`${key} time not available for ${day.date}, using default`);
                timeStr = DEFAULT_TIMES[key as PrayerKeys];
            } else {
                timeStr = day[key as PrayerKeys];
            }
        }

        // Ensure we have a valid date object
        let dayDate: Date;
        try {
            dayDate = typeof day.date === 'string' ? new Date(day.date) : new Date(day.date);
            if (isNaN(dayDate.getTime())) {
                throw new Error('Invalid date');
            }
        } catch (error) {
            console.error(`Invalid date for ${key}, using current date:`, error);
            dayDate = new Date();
        }
        
        const time = this.convertStringToDayjs(timeStr, dayDate);
        const prayerTimeItem: PrayerTimeItem = {
            id: customKey || key,
            name: this.apiData.language[key] || key.charAt(0).toUpperCase() + key.slice(1),
            time: time.toDate(),
            time_readable: timeStr,
            iqamah: undefined,
            iqamah_readable: undefined,
            showIqamah: false
        };

        if (option) {
            this.applyPrayerOptions(prayerTimeItem, option);
        }
        return prayerTimeItem;
    }

    private applyPrayerOptions(item: PrayerTimeItem, option: SinglePrayerOption): void {
        if (!option) return;
        
        try {
            this.applyOffsetOption(item, option);
            this.applyFixedTimeOption(item, option);
            this.applyIqamahOption(item, option);
        } catch (error) {
            console.error(`Error applying prayer options for ${item.id}:`, error);
        }
    }

    private applyOffsetOption(item: PrayerTimeItem, option: SinglePrayerOption): void {
        if (option.offset) {
            try {
                const updatedTime = dayjs(item.time).add(option.offset, 'minute');
                item.time = updatedTime.toDate();
                item.time_readable = updatedTime.format('HH:mm');
            } catch (error) {
                console.error(`Error applying offset for ${item.id}:`, error);
            }
        }
    }

    private applyFixedTimeOption(item: PrayerTimeItem, option: SinglePrayerOption): void {
        if (option.isFixed && option.fixedTime) {
            try {
                const itemDate = new Date(item.time);
                const fixedTime = this.convertStringToDayjs(option.fixedTime, itemDate);
                item.time = fixedTime.toDate();
                item.time_readable = fixedTime.format('HH:mm');
            } catch (error) {
                console.error(`Error applying fixed time for ${item.id}:`, error);
            }
        }
    }

    private applyIqamahOption(item: PrayerTimeItem, option: SinglePrayerOption): void {
        item.showIqamah = !!option.showIqamah;
        
        if (option.showIqamah && option.iqamah) {
            try {
                let iqamahTime: Dayjs;
                
                // Special case for Fajr when calculating from sunrise
                if (item.id === 'fajr' && option.calculateIqamahFromSunrise && option.sunriseOffset) {
                    const sunriseItem = this.prayerTimes.find(pt => pt.id === 'sunrise');
                    if (sunriseItem) {
                        iqamahTime = dayjs(sunriseItem.time).add(option.sunriseOffset, 'minute');
                    } else {
                        iqamahTime = dayjs(item.time).add(option.iqamah, 'minute');
                    }
                } else {
                    iqamahTime = dayjs(item.time).add(option.iqamah, 'minute');
                }
                
                item.iqamah = iqamahTime.toDate();
                item.iqamah_readable = iqamahTime.format('HH:mm');
            } catch (error) {
                console.error(`Error applying iqamah for ${item.id}:`, error);
            }
        }
    }

    private formatSecondsToTime(seconds: number): string {
        try {
            if (isNaN(seconds) || seconds < 0) {
                return '--:--:--';
            }
            
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const remainingSeconds = Math.floor(seconds % 60);
        
            const formattedHours = hours.toString().padStart(1, '0');
            const formattedMinutes = minutes.toString().padStart(2, '0');
            const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
        
            return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
        } catch (error) {
            console.error('Error formatting seconds to time:', error);
            return '--:--:--';
        }
    }

    private updateNextPrayerTime(): void {
        try {
            const now = dayjs();
            
            // Sort prayers by time to ensure we find the correct next one
            const sortedPrayers = [...this.prayerTimes].sort((a, b) => {
                return dayjs(a.time).valueOf() - dayjs(b.time).valueOf();
            });
            
            const nextPrayer = sortedPrayers.find((item) => {
                return dayjs(item.time).isAfter(now);
            });

            // If we found a next prayer, update the stores
            if (nextPrayer) {
                // Only update if the prayer has changed
                if (!this._nextPrayerTime || this._nextPrayerTime.id !== nextPrayer.id) {
                    console.log('Setting new next prayer:', nextPrayer);
                    this._nextPrayerTime = nextPrayer;
                    nextPrayerTimeSet(nextPrayer);
                }
                
                // Always update the countdown
                this._nextPrayerTimeCountdown = Math.max(0, dayjs(nextPrayer.time).diff(now, 'second'));
                countdownToTextSet(this.formatSecondsToTime(this._nextPrayerTimeCountdown));
            } else {
                console.warn('No next prayer found, using default');
                this._nextPrayerTime = DEFAULT_PRAYER_TIME;
                this._nextPrayerTimeCountdown = 0;
                nextPrayerTimeSet(DEFAULT_PRAYER_TIME);
                countdownToTextSet('--:--:--');
            }
        } catch (error) {
            console.error('Error updating next prayer time:', error);
            this._nextPrayerTime = DEFAULT_PRAYER_TIME;
            this._nextPrayerTimeCountdown = 0;
            nextPrayerTimeSet(DEFAULT_PRAYER_TIME);
            countdownToTextSet('--:--:--');
        }
    }

    private _nextPrayerTime: PrayerTimeItem = DEFAULT_PRAYER_TIME;
    get nextPrayerTime(): PrayerTimeItem {
        return this._nextPrayerTime;
    }

    private _nextPrayerTimeCountdown: number = 0;
    get nextPrayerTimeCountdown(): number {
        return this._nextPrayerTimeCountdown;
    }

    public prayerHasPassed(prayerTime: PrayerTimeItem): boolean {
        if (!prayerTime || !prayerTime.time) return false;
        return dayjs(prayerTime.time).isBefore(dayjs());
    }

    public isPrayerActive(prayerTime: PrayerTimeItem): boolean {
        if (!prayerTime || !prayerTime.time) return false;
        
        // A prayer is active if it's the current prayer time
        return prayerTime.id === this._nextPrayerTime.id;
    }

    private convertStringToDayjs(time: string, date: Date): Dayjs {
        try {
            // Validate the input time string
            if (!time || typeof time !== 'string' || !time.includes(':')) {
                console.error(`Invalid time format: ${time}, using current time instead`);
                return dayjs();
            }
            
            // Ensure date is a Date object
            const dateObj = new Date(date);
            if (isNaN(dateObj.getTime())) {
                console.error(`Invalid date: ${date}, using current date instead`);
                return dayjs();
            }
            
            const [hoursStr, minutesStr] = time.split(':');
            const hours = parseInt(hoursStr, 10);
            const minutes = parseInt(minutesStr, 10);
        
            if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
                console.error(`Invalid time components: hours=${hours}, minutes=${minutes}, using current time instead`);
                return dayjs();
            }
        
            const newDate = new Date(dateObj);
            newDate.setHours(hours);
            newDate.setMinutes(minutes);
            newDate.setSeconds(0);
            newDate.setMilliseconds(0);
        
            return dayjs(newDate);
        } catch (error) {
            console.error(`Error converting string to dayjs: ${time}, ${date}`, error);
            return dayjs();
        }
    }
    
    // Call this method to clean up when the component is destroyed
    public destroy(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

export default PrayerTimeCalculator;