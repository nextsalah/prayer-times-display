import type { SettingsFromFields } from '$themes/logic/theme-settings-manager';
import type { IField } from '@ismail424/svelte-formly';

export interface ApiData<T extends IField[]> {
    prayertimes:     Prayertimes;
    custom_settings: SettingsFromFields<T>;
    prayer_options:  PrayerOptions;
    settings:        Settings;
    language:        Language;
}

export interface Language {
    id:      number;
    fajr:    string;
    sunrise: string;
    dhuhr:   string;
    asr:     string;
    maghrib: string;
    isha:    string;
    prayer:  string;
    iqamah:  string;
    begins:  string;
    next:    string;
}

export interface PrayerOptions {
    fajr:    SinglePrayerOption;
    dhuhr:   SinglePrayerOption;
    asr:     SinglePrayerOption;
    maghrib: SinglePrayerOption;
    isha:    SinglePrayerOption;
}

export interface SinglePrayerOption {
    id:                number;
    name:              string;
    showIqamah:        boolean;
    iqamah:            number;
    iqamahAfterPrayer: boolean;
    offset:            number;
    isFixed:           boolean;
    fixedTime:         string;
    createdAt:         Date;
    updatedAt:         Date;
}

export interface Prayertimes {
    today:         PrayerTimeDay;
    tomorrow:      PrayerTimeDay;
    afterTomorrow: PrayerTimeDay;
}

export interface PrayerTimeDay {
    id:        number;
    fajr:      string;
    dhuhr:     string;
    asr:       string;
    maghrib:   string;
    isha:      string;
    date:      Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface Settings {
    id:         number;
    showQRCode: boolean;
    dateFormat: string;
    timeFormat: string;
    createdAt:  Date;
    updatedAt:  Date;
}