import type { LanguageSchemaType } from "$lib/db/schemas";
import type { Component } from 'svelte';
import { 
    Gb, Sa, Ba, Tr, Se, Pk, De, Fr, Es, It, Pt, Nl, Pl, Ru, Dk, No, Fi, 
    Id, My, Bn, Th, Kr, Jp, Cn, In
} from 'svelte-flag-icons';

export type LanguageConfig = {
    [key: string]: {
        name: string;
        code: string;
        flag: Component;
        settings: Omit<LanguageSchemaType, 'id' | 'language_code'>;
    }
};

export const languageConfigs: LanguageConfig = {
    english: {
        name: "English",
        code: "en",
        flag: Gb,
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
        flag: Sa,
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
        flag: Ba,
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
        flag: Se,
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
        flag: Tr,
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
        flag: Pk,
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
    },
    german: {
        name: "Deutsch",
        code: "de",
        flag: De,
        settings: {
            fajr: "Fadschr",
            sunrise: "Sonnenaufgang",
            dhuhr: "Dhuhr",
            asr: "Asr",
            maghrib: "Maghrib",
            isha: "Ischa",
            prayer: "Gebet",
            iqamah: "Iqama",
            begins: "Beginnt",
            next: "Nächstes"
        }
    },
    french: {
        name: "Français",
        code: "fr",
        flag: Fr,
        settings: {
            fajr: "Fajr",
            sunrise: "Lever du soleil",
            dhuhr: "Dhuhr",
            asr: "Asr",
            maghrib: "Maghrib",
            isha: "Isha",
            prayer: "Prière",
            iqamah: "Iqama",
            begins: "Commence",
            next: "Suivante"
        }
    },
    spanish: {
        name: "Español",
        code: "es",
        flag: Es,
        settings: {
            fajr: "Fajr",
            sunrise: "Amanecer",
            dhuhr: "Dhuhr",
            asr: "Asr",
            maghrib: "Maghrib",
            isha: "Isha",
            prayer: "Oración",
            iqamah: "Iqama",
            begins: "Comienza",
            next: "Siguiente"
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
export function getLanguageSettings(language: string): Omit<LanguageSchemaType, 'id' | 'language_code'> | undefined {
    return languageConfigs[language]?.settings;
}

// Helper function to get a language config by code
export function getLanguageConfigByCode(code: string) {
    const entry = Object.entries(languageConfigs).find(([_, config]) => config.code === code);
    return entry ? entry[1] : undefined;
}

export const localeImports: { [key: string]: () => Promise<any> } = {
    en: () => import('dayjs/locale/en'),
    sv: () => import('dayjs/locale/sv'),
    tr: () => import('dayjs/locale/tr'),
    ur: () => import('dayjs/locale/ur'),
    de: () => import('dayjs/locale/de'),
    fr: () => import('dayjs/locale/fr'),
    es: () => import('dayjs/locale/es'),
    ar: () => import('dayjs/locale/ar'),
    bs: () => import('dayjs/locale/bs'),
};