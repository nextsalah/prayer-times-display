import type { IField } from "@ismail424/svelte-formly";

// When parsing user uploads/inputs
export type ParseResult<T> = 
  | { data: T; success: true; error?: never }
  | { data?: never; success: false; error: unknown };

// The user's theme customization values
export type ThemeUserSettings = Record<string, string | number | boolean | FileMetadata[] | null | undefined>;

export function isThemeUserSettings(value: unknown): value is ThemeUserSettings {
  return typeof value === 'object' && value !== null;
}

// Basic theme listing shown in UI
export type ThemeBasicInfo = {
  value: string;
  name: string;
  description: string;
};

export type ThemeList = ThemeBasicInfo[];

// The manifest.json file that describes the theme
export type ThemeManifest = {
  name: string;
  description: string;
  version: string;
  authors: {
    name: string;
    github_profile: string;
  }[];
};

export function isThemeManifest(value: unknown): value is ThemeManifest {
  if (typeof value !== 'object' || value === null) return false;

  const manifest = value as ThemeManifest;
  
  return typeof manifest.name === 'string' &&
         typeof manifest.description === 'string' &&
         typeof manifest.version === 'string' &&
         Array.isArray(manifest.authors) &&
         manifest.authors.length > 0 &&
         manifest.authors.every(author => 
           typeof author.name === 'string' && 
           typeof author.github_profile === 'string'
         );
}


// A complete loaded theme with all its files/info
export type Theme = {
  value: string;
  name: string;
  description: string;
  customizationForm: IField[];
  manifest: ThemeManifest;
};

// Default values for theme settings
export type ThemeDefaults = Record<string, string | number | boolean | null | undefined>;

// Prayer-specific types
export type PrayerName = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha" | "fajr_tomorrow";

export type Prayer = {
  id: PrayerName;
  name: string;
  time_readable: string;
  time: Date;
  iqamah_readable: string | null;
  iqamah: Date | null;    
  showIqamah: boolean;
};

export interface PrayerTimeItem {
    id: string;
    name: string;
    time: Date;
    time_readable: string;
    iqamah?: Date;        // Changed from null to optional undefined
    iqamah_readable?: string;  // Changed from null to optional undefined
    showIqamah: boolean;
}

export function isThemeCustomizationForm(value: unknown): value is IField[] {
  if (!Array.isArray(value) || value.length === 0) return false;

  return value.every(field => 
    typeof field === 'object' &&
    field !== null &&
    'type' in field &&
    'name' in field &&
    'attributes' in field &&
    typeof field.type === 'string' &&
    typeof field.name === 'string' &&
    typeof field.attributes === 'object'
  );
}

export type FileMetadata = {
  id: string,
  name: string,
  path: string,
  fullPath: string,
  type: string,
  size: number,
  uploadedAt: string
};