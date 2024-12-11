import type { ApiData, PrayerTimeDay, SinglePrayerOption } from '../interfaces/api';
import type { PrayerTimeItem } from '../interfaces/types';
import dayjs, { Dayjs } from 'dayjs';
import { writable } from 'svelte/store';

export const { subscribe: countdownToTextSubscribe, set: countdownToTextSet } = writable<string | null>(null);
export const { subscribe: nextPrayerTimeSubscribe, set: nextPrayerTimeSet } = writable<PrayerTimeItem | null>(null);

type PrayerKeys = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

class PrayerTimeCalculator {
	private apiData: ApiData;
	public prayerTimes: PrayerTimeItem[] = [];
	private PRAYERTIMES_KEYS:PrayerKeys[]=  ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

	constructor(apiData: ApiData) {
		if (!apiData) {
			throw new Error('Api data is required');
		}
		this.apiData = apiData;
		this.initializePrayerTimes();
		this.updateNextPrayerTime();
		setInterval(this.updateNextPrayerTime.bind(this), 1000);
	}

	private initializePrayerTimes(): void {
		this.PRAYERTIMES_KEYS.forEach((key) => {
			this.prayerTimes.push(this.createPrayerTimeItem(key, this.apiData.prayertimes.today, this.apiData.prayer_options[key]));
		});
		this.prayerTimes.push(this.createPrayerTimeItem('fajr', this.apiData.prayertimes.tomorrow, this.apiData.prayer_options['fajr'], 'fajr_tomorrow'));
	}

	private createPrayerTimeItem(
		key: PrayerKeys,
		day: PrayerTimeDay,
		option?: SinglePrayerOption,
		customKey?: PrayerTimeItem['id']
	): PrayerTimeItem {
		const time = this.convertStringToDayjs(day[key], day.date);
		const prayerTimeItem: PrayerTimeItem = {
			id: customKey || key,
			name: this.apiData.language[key],
			time:  new Date(time.toDate()),
			time_readable: day[key],
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
		if (!option.showIqamah || option.isFixed || item.id === 'sunrise' || option.iqamah === 0) {
			item.showIqamah = false;
			return;
		}
	
		if (option.iqamahAfterPrayer) {
			const iqamahTime = dayjs(item.time).add(option.iqamah, 'minute');
			item.iqamah = iqamahTime.toDate();
			item.iqamah_readable = iqamahTime.format('HH:mm');
			item.showIqamah = true;
		} else {
			const iqamahTime = dayjs(item.time).subtract(option.iqamah, 'minute');
			item.iqamah = iqamahTime.toDate();
			item.iqamah_readable = iqamahTime.format('HH:mm');
			item.showIqamah = true;
		}
	}
	
	private  formatSecondsToTime(seconds) {
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
		const nextPrayer = this.prayerTimes.find((item) =>  dayjs(item.time).isAfter(dayjs()));

		// if new prayer time  is found, run nextPrayerTimeSet
		if( nextPrayer && this._nextPrayerTime && this._nextPrayerTime.id !== nextPrayer.id){
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


	private convertStringToDayjs(time: string, date: Date): dayjs.Dayjs {
		// Split the time string into hours and minutes
		const [hoursStr, minutesStr] = time.split(':');
		const hours = parseInt(hoursStr, 10);
		const minutes = parseInt(minutesStr, 10);
	  
		// Set the hours and minutes of the date object
		date.setHours(hours);
		date.setMinutes(minutes);
	  
		// Create a Day.js object from the modified date
		const dayjsObj = dayjs(date);
	  
		return dayjsObj;
	  }
}

export default PrayerTimeCalculator;