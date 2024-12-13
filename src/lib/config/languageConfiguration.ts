import type { LanguageSettingsWithoutId } from "$lib/db/schemas";
import type { Component } from 'svelte';
import { Gb, Sa, Ba, Tr, Se, Pk} from 'svelte-flag-icons';

type LanguageConfig = {
    [key: string]: {
        name: string;
        code: string;
        flag: Component
        settings: LanguageSettingsWithoutId;
    }
};

export const languageConfigs: LanguageConfig = {
    english: {
        name: "English",
        code: "en",
        flag: Gb,  // UK flag for English
        settings: {
            fajr: "Fajr",
            sunrise: "Sunrise",
            dhuhr: "Dhuhr",
            asr: "Asr",
            maghrib: "Maghrib",
            isha: "Isha",
            prayer: "Prayer",
            iqamah: "Iqamah",
            begins: "Begins",
            next: "Next"
        }
    },
    arabic: {
        name: "العربية",
        code: "ar",
        flag: Sa,  // Saudi Arabia flag for Arabic
        settings: {
            fajr: "الفجر",
            sunrise: "الشروق",
            dhuhr: "الظهر",
            asr: "العصر",
            maghrib: "المغرب",
            isha: "العشاء",
            prayer: "صلاة",
            iqamah: "إقامة",
            begins: "يبدأ",
            next: "التالي"
        }
    },
    bosnian: {
        name: "Bosanski",
        code: "bs",
        flag: Ba,  // Bosnia and Herzegovina flag
        settings: {
            fajr: "Zora",
            sunrise: "Izlazak",
            dhuhr: "Podne",
            asr: "Ikindija",
            maghrib: "Akšam",
            isha: "Jacija",
            prayer: "Namaz",
            iqamah: "Ikamet",
            begins: "Počinje",
            next: "Sljedeći"
        }
    },
    swedish: {
        name: "Svenska",
        code: "sv",
        flag: Se,  // Sweden flag
        settings: {
            fajr: "Fajr",
            sunrise: "Soluppgång",
            dhuhr: "Dhuhr",
            asr: "Asr",
            maghrib: "Maghrib",
            isha: "Isha",
            prayer: "Bön",
            iqamah: "Iqama",
            begins: "Börjar",
            next: "Nästa"
        }
    },
    turkish: {
        name: "Türkçe",
        code: "tr",
        flag: Tr,  // Turkey flag
        settings: {
            fajr: "İmsak",
            sunrise: "Güneş",
            dhuhr: "Öğle",
            asr: "İkindi",
            maghrib: "Akşam",
            isha: "Yatsı",
            prayer: "Namaz",
            iqamah: "İkamet",
            begins: "Başlar",
            next: "Sonraki"
        }
    },
    urdu: {
        name: "اردو",
        code: "ur",
        flag: Pk,  //
        settings: {
            fajr: "فجر",
            sunrise: "طلوع آفتاب",
            dhuhr: "ظہر",
            asr: "عصر",
            maghrib: "مغرب",
            isha: "عشاء",
            prayer: "نماز",
            iqamah: "اقامہ",
            begins: "شروع",
            next: "اگلا"
        }
    }
};

// Helper function to get all available languages with flags
export function getAvailableLanguages() {
    return Object.entries(languageConfigs).map(([key, config]) => ({
        key,
        name: config.name,
        code: config.code,
        flag: config.flag
    }));
}

// Helper function to get settings for a specific language
export function getLanguageSettings(language: string): LanguageSettingsWithoutId | undefined {
    return languageConfigs[language]?.settings;
}