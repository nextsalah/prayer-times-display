import type { AppData, PrayerOptionType } from '$lib/db/services/appDataService';
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

// Create stores with consistent naming
export const { subscribe: countdownToTextSubscribe, set: countdownToTextSet } = writable<string>('--:--:--');
export const { subscribe: nextPrayerTimeSubscribe, set: nextPrayerTimeSet } = writable<PrayerTimeItem>(DEFAULT_PRAYER_TIME);
export const { subscribe: allPrayerTimesSubscribe, set: allPrayerTimesSet } = writable<PrayerTimeItem[]>([]);
// Add an error store to expose errors to the UI
export const { subscribe: errorMessageSubscribe, set: errorMessageSet } = writable<string | null>(null);

type PrayerKeys = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
type PrayerKeysWithSunrise = PrayerKeys | 'sunrise';

class PrayerTimeCalculator {
    public apiData: AppData<any>;
    public prayerTimes: PrayerTimeItem[] = [];
    private prayerTimesKeys: PrayerKeysWithSunrise[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    private updateInterval: ReturnType<typeof setInterval> | null = null;
    private _nextPrayerTime: PrayerTimeItem = DEFAULT_PRAYER_TIME;
    private _nextPrayerTimeCountdown: number = 0;
    private _errorMessage: string | null = null;

    constructor(data: AppData<any>) {
        try {
            if (!data) {
                this.handleError('Missing prayer time data. Please check your configuration.');
                throw new Error('Valid API data is required for PrayerTimeCalculator');
            }
            
            if (!data.prayerTimes) {
                this.handleError('Missing prayer times in data. Please check the prayer times database.');
                throw new Error('Missing prayerTimes property in API data');
            }
            
            if (!data.prayerTimes.today) {
                this.handleError('Today\'s prayer times are missing. Using default prayer times.');
                console.error('Today\'s prayer times missing:', data.prayerTimes);
            }

       
            this.apiData = data;
            this.initializePrayerTimes();
            this.updateNextPrayerTime();
            
            // Clear any existing interval to prevent memory leaks
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
            }
            
            this.updateInterval = setInterval(this.updateNextPrayerTime.bind(this), 1000);
        } catch (error) {
            this.handleError(`Failed to initialize prayer times: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error('Constructor error:', error);
            // Still create the API data to prevent further errors
            this.apiData = data;
            // Create fallback prayer times even on error
            this.createFallbackPrayerTimes();
        }
    }

    get nextPrayerTime(): PrayerTimeItem {
        return this._nextPrayerTime;
    }

    get nextPrayerTimeCountdown(): number {
        return this._nextPrayerTimeCountdown;
    }
    
    get errorMessage(): string | null {
        return this._errorMessage;
    }

    private handleError(message: string): void {
        console.error(message);
        this._errorMessage = message;
        errorMessageSet(message);
    }

    private clearError(): void {
        this._errorMessage = null;
        errorMessageSet(null);
    }

    public updateData(data: AppData<any>): void {
        try {
            this.apiData = data;
            this.initializePrayerTimes();
            this.updateNextPrayerTime();
        }
        catch (error) {
            this.handleError(`Failed to update prayer times: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error('Error updating prayer times:', error);
        }
    }

    private initializePrayerTimes(): void {
        try {
            this.clearError();
            this.prayerTimes = [];
            
            // Check for required data
            if (!this.apiData.prayerTimes?.today) {
                this.handleError('Cannot get today\'s prayer times. Using default times.');
                this.createFallbackPrayerTimes();
                return;
            }
            
            // Add today's prayer times
            this.prayerTimesKeys.forEach((key) => {
                try {
                    if (key !== 'sunrise' && key in this.apiData.prayer_options) {
                        this.prayerTimes.push(this.createPrayerTimeItem(
                            key, 
                            this.apiData.prayerTimes.today, 
                            this.apiData.prayer_options[key as keyof typeof this.apiData.prayer_options]
                        ));
                    } else {
                        this.prayerTimes.push(this.createPrayerTimeItem(key, this.apiData.prayerTimes.today));
                    }
                } catch (error) {
                    console.error(`Error creating prayer time for ${key}:`, error);
                    // Create a fallback prayer time
                    this.prayerTimes.push(this.createFallbackPrayerTime(key));
                }
            });
            
            // Add tomorrow's Fajr
            if (this.apiData.prayerTimes.tomorrow && 'fajr' in this.apiData.prayer_options) {
                try {
                    this.prayerTimes.push(
                        this.createPrayerTimeItem(
                            'fajr', 
                            this.apiData.prayerTimes.tomorrow, 
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
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                this.prayerTimes.push(this.createFallbackPrayerTime('fajr', tomorrow, 'fajr_tomorrow'));
            }
            
   
            // Update the store with all prayer times
            allPrayerTimesSet(this.prayerTimes);
            
        } catch (error) {
            this.handleError(`Failed to initialize prayer times: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error('Failed to initialize prayer times:', error);
            // Create fallback prayer times for all prayers
            this.createFallbackPrayerTimes();
        }
    }

    private createFallbackPrayerTimes(): void {
        try {
            this.prayerTimes = [];
            const today = new Date();
            
            this.prayerTimesKeys.forEach(key => {
                this.prayerTimes.push(this.createFallbackPrayerTime(key, today));
            });
            
            // Add tomorrow's Fajr
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            this.prayerTimes.push(this.createFallbackPrayerTime('fajr', tomorrow, 'fajr_tomorrow'));
            
            allPrayerTimesSet(this.prayerTimes);
        } catch (error) {
            this.handleError('Critical error creating fallback prayer times. Please reload the page.');
            console.error('Error in createFallbackPrayerTimes:', error);
        }
    }

    private createFallbackPrayerTime(
        key: PrayerKeysWithSunrise, 
        date: Date = new Date(), 
        customId?: string
    ): PrayerTimeItem {
        try {
            const defaultTime = DEFAULT_TIMES[key] || '12:00';
            // Try to get the name from the language settings, fallback to capitalized key
            const prayerName = this.apiData?.localization?.language?.[key] || 
                               key.charAt(0).toUpperCase() + key.slice(1);
            
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
        } catch (error) {
            console.error(`Error creating fallback prayer time for ${key}:`, error);
            // Return a guaranteed safe fallback
            return {
                id: customId || key,
                name: key.charAt(0).toUpperCase() + key.slice(1),
                time: new Date(),
                time_readable: DEFAULT_TIMES[key] || '12:00',
                iqamah: undefined,
                iqamah_readable: undefined,
                showIqamah: false
            };
        }
    }

    private createPrayerTimeItem(
        key: PrayerKeysWithSunrise,
        day: PrayerTime & { sunrise?: string },
        option?: PrayerOptionType,
        customKey?: PrayerTimeItem['id']
    ): PrayerTimeItem {
        if (!day) {
            console.warn(`Missing day data for prayer ${key}, using fallback`);
            return this.createFallbackPrayerTime(key, new Date(), customKey);
        }
        
        // Get the correct time string for this prayer
        let timeStr: string;
        if (key === 'sunrise') {
            if (!day.sunrise) {
                console.warn('Sunrise time not available, using default');
                timeStr = DEFAULT_TIMES.sunrise;
            } else {
                timeStr = day.sunrise;
            }
        } else if (day[key as PrayerKeys]) {
            timeStr = day[key as PrayerKeys];
        } else {
            console.warn(`${key} time not available, using default`);
            timeStr = DEFAULT_TIMES[key as PrayerKeys];
        }

        // Ensure we have a valid date object
        let dayDate: Date;
        try {
            dayDate = typeof day.date === 'string' ? new Date(day.date) : new Date(day.date);
            if (isNaN(dayDate.getTime())) {
                console.warn('Invalid date, using current date');
                dayDate = new Date();
            }
        } catch (error) {
            console.error(`Invalid date for ${key}, using current date:`, error);
            dayDate = new Date();
        }
        
        const time = this.convertStringToDayjs(timeStr, dayDate);
        
        // Try to get prayer name from language settings with fallbacks
        const prayerName = this.apiData?.localization?.language?.[key] || 
                         this.getPrayerNameFallback(key);
        
        const prayerTimeItem: PrayerTimeItem = {
            id: customKey || key,
            name: prayerName,
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

    private getPrayerNameFallback(key: PrayerKeysWithSunrise): string {
        // Prettier names if language settings are unavailable
        const fallbackNames: Record<PrayerKeysWithSunrise, string> = {
            fajr: 'Fajr',
            sunrise: 'Sunrise',
            dhuhr: 'Dhuhr',
            asr: 'Asr',
            maghrib: 'Maghrib',
            isha: 'Isha'
        };
        
        return fallbackNames[key] || key.charAt(0).toUpperCase() + key.slice(1);
    }

    private applyPrayerOptions(item: PrayerTimeItem, option: PrayerOptionType): void {
        if (!option) return;
        
        try {
            // Apply options in the correct order:
            // 1. Fixed time (overrides base time)
            // 2. Offset (adjusts base time if not fixed)
            // 3. Iqamah (calculates iqamah based on final prayer time)
            
            if (option.isFixed && option.fixedTime) {
                this.applyFixedTimeOption(item, option);
            } else if (option.offset) {
                this.applyOffsetOption(item, option);
            }
            
            // Apply iqamah settings after the final prayer time is determined
            this.applyIqamahOption(item, option);
            
        } catch (error) {
            console.error(`Error applying prayer options for ${item.id}:`, error);
        }
    }

    private applyOffsetOption(item: PrayerTimeItem, option: PrayerOptionType): void {
        if (option.offset === undefined || option.offset === null || isNaN(option.offset)) return;
        
        try {
            const updatedTime = dayjs(item.time).add(option.offset, 'minute');
            if (updatedTime.isValid()) {
                item.time = updatedTime.toDate();
                item.time_readable = updatedTime.format('HH:mm');
            }
        } catch (error) {
            console.error(`Error applying offset for ${item.id}:`, error);
        }
    }

    private applyFixedTimeOption(item: PrayerTimeItem, option: PrayerOptionType): void {
        if (!option.isFixed || !option.fixedTime) return;
        
        try {
            const itemDate = new Date(item.time);
            const fixedTime = this.convertStringToDayjs(option.fixedTime, itemDate);
            
            if (fixedTime.isValid()) {
                item.time = fixedTime.toDate();
                item.time_readable = fixedTime.format('HH:mm');
            }
        } catch (error) {
            console.error(`Error applying fixed time for ${item.id}:`, error);
        }
    }

    private applyIqamahOption(item: PrayerTimeItem, option: PrayerOptionType): void {
        item.showIqamah = !!option.showIqamah;
        
        if (!option.showIqamah) return;
        
        try {
            let iqamahTime: Dayjs;
            
            // Special case for Fajr when calculating from sunrise
            if (item.id === 'fajr' && 'calculateIqamahFromSunrise' in option && option.calculateIqamahFromSunrise) {
                // Find sunrise time
                const sunriseItem = this.prayerTimes.find(p => p.id === 'sunrise');
                if (sunriseItem && sunriseItem.time) {
                    // Apply sunriseOffset (minutes before sunrise)
                    const sunriseOffset = 'sunriseOffset' in option ? option.sunriseOffset : -30;
                    iqamahTime = dayjs(sunriseItem.time).add(sunriseOffset, 'minute');
                } else {
                    // Fallback if sunrise time is not available
                    iqamahTime = dayjs(item.time).add(option.iqamah || 20, 'minute');
                    console.warn('Sunrise time not found for Fajr iqamah calculation, using standard delay');
                }
            } else {
                // Standard iqamah calculation
                iqamahTime = dayjs(item.time).add(option.iqamah || 10, 'minute');
            }
            
            if (iqamahTime.isValid()) {
                item.iqamah = iqamahTime.toDate();
                item.iqamah_readable = iqamahTime.format('HH:mm');
            } else {
                console.warn(`Invalid iqamah time for ${item.id}`);
            }
        } catch (error) {
            console.error(`Error applying iqamah for ${item.id}:`, error);
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
            
            // Filter out invalid prayer times
            const validPrayers = this.prayerTimes.filter(prayer => 
                prayer && prayer.time && dayjs(prayer.time).isValid()
            );
            
            if (validPrayers.length === 0) {
                this.handleError('No valid prayer times found. Please check prayer time settings.');
                this._nextPrayerTime = DEFAULT_PRAYER_TIME;
                this._nextPrayerTimeCountdown = 0;
                nextPrayerTimeSet(DEFAULT_PRAYER_TIME);
                countdownToTextSet('--:--:--');
                return;
            }
            
            // Sort prayers by time to ensure we find the correct next one
            const sortedPrayers = [...validPrayers].sort((a, b) => {
                return dayjs(a.time).valueOf() - dayjs(b.time).valueOf();
            });
            
            const nextPrayer = sortedPrayers.find(item => dayjs(item.time).isAfter(now));

            // If we found a next prayer, update the stores
            if (nextPrayer) {
                // Only update if the prayer has changed
                if (!this._nextPrayerTime || this._nextPrayerTime.id !== nextPrayer.id) {
                    this._nextPrayerTime = nextPrayer;
                    nextPrayerTimeSet(nextPrayer);
                }
                
                // Always update the countdown
                this._nextPrayerTimeCountdown = Math.max(0, dayjs(nextPrayer.time).diff(now, 'second'));
                countdownToTextSet(this.formatSecondsToTime(this._nextPrayerTimeCountdown));
                
                // Clear any errors since we've successfully found the next prayer
                this.clearError();
            } else {
                console.log('No upcoming prayers found for today, checking tomorrow');
                // If no upcoming prayer is found (e.g., all prayers for today have passed)
                // Default to tomorrow's first prayer or keep the current one
                const firstPrayerTomorrow = sortedPrayers.find(item => item.id === 'fajr_tomorrow');
                if (firstPrayerTomorrow) {
                    this._nextPrayerTime = firstPrayerTomorrow;
                    this._nextPrayerTimeCountdown = Math.max(0, dayjs(firstPrayerTomorrow.time).diff(now, 'second'));
                    nextPrayerTimeSet(firstPrayerTomorrow);
                    countdownToTextSet(this.formatSecondsToTime(this._nextPrayerTimeCountdown));
                    this.clearError();
                } else {
                    this.handleError('Could not find any upcoming prayer times. Please check your prayer time settings.');
                    this._nextPrayerTime = DEFAULT_PRAYER_TIME;
                    this._nextPrayerTimeCountdown = 0;
                    nextPrayerTimeSet(DEFAULT_PRAYER_TIME);
                    countdownToTextSet('--:--:--');
                }
            }
        } catch (error) {
            this.handleError(`Error updating next prayer time: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error('Error updating next prayer time:', error);
            this._nextPrayerTime = DEFAULT_PRAYER_TIME;
            this._nextPrayerTimeCountdown = 0;
            nextPrayerTimeSet(DEFAULT_PRAYER_TIME);
            countdownToTextSet('--:--:--');
        }
    }

    public prayerHasPassed(prayerTime: PrayerTimeItem): boolean {
        if (!prayerTime || !prayerTime.time) return false;
        
        try {
            return dayjs(prayerTime.time).isBefore(dayjs());
        } catch (error) {
            console.error(`Error checking if prayer has passed:`, error);
            return false;
        }
    }

    public isPrayerActive(prayerTime: PrayerTimeItem): boolean {
        if (!prayerTime || !prayerTime.time || !this._nextPrayerTime) return false;
        
        try {
            // A prayer is active if it's the current prayer time
            return prayerTime.id === this._nextPrayerTime.id;
        } catch (error) {
            console.error(`Error checking if prayer is active:`, error);
            return false;
        }
    }

    private convertStringToDayjs(time: string, date: Date): Dayjs {
        try {
            // Validate the input time string
            if (!time || typeof time !== 'string' || !time.includes(':')) {
                console.warn(`Invalid time string format: "${time}", using current time`);
                return dayjs();
            }
            
            // Ensure date is a Date object
            const dateObj = new Date(date);
            if (isNaN(dateObj.getTime())) {
                console.warn('Invalid date object, using current date');
                return dayjs();
            }
            
            const [hoursStr, minutesStr] = time.split(':');
            const hours = parseInt(hoursStr, 10);
            const minutes = parseInt(minutesStr, 10);
        
            if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
                console.warn(`Invalid time values: hours=${hours}, minutes=${minutes}`);
                return dayjs();
            }
        
            const newDate = new Date(dateObj);
            newDate.setHours(hours);
            newDate.setMinutes(minutes);
            newDate.setSeconds(0);
            newDate.setMilliseconds(0);
        
            return dayjs(newDate);
        } catch (error) {
            console.error(`Error converting string to dayjs:`, error);
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