import type { IField } from "./field";

export type ParseResult<T> = 
| { parsed: T; hasError: false; error?: undefined }
| { parsed?: undefined; hasError: true; error?: unknown }

export type CustomTemplatesType = { [key: string]:   string | number | boolean | null | undefined }

export function isCustomTemplatesType(o: unknown): o is CustomTemplatesType {
  if (typeof o !== 'object') return false;
  if (o === null) return false;
  return true;
}

export  type AllThemesType ={ value: string; name: string; }

export interface ConfigType {
  name: string
  description: string
  version: string
  authors: { name: string; github_profile: string }[]
}

export function isConfigType(o: unknown): o is ConfigType {
  if (typeof o !== 'object' || o === null) return false;

  const config = o as ConfigType;

  if (typeof config.name !== 'string') return false;
  if (typeof config.description !== 'string') return false;
  if (typeof config.version !== 'string') return false;
  if (!Array.isArray(config.authors)) return false;
  if (config.authors.length === 0) return false;
  for (const author of config.authors) {
    if (typeof author.name !== 'string') return false;
    if (typeof author.github_profile !== 'string') return false;
  }
  return true;
}

export type TemplatesType = IField[];
export type DefaultTemplatesType = { [key: string]: string | number | boolean | null | undefined };
export type PrayerTimeItem = {
  id: "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha" | "fajr_tomorrow",
  name: string,
  time_readable: string,
  time: Date,
  iqamah_readable: String | null,
  iqamah: Date | null,    
  showIqamah: boolean, 
}

export function isTemplatesType(o: unknown): o is TemplatesType {
  if (!Array.isArray(o)) return false;
  if (o.length === 0) return false;
  for (const input of o) {
    if (
      !input.hasOwnProperty('type') ||
      !input.hasOwnProperty('name') ||
      !input.hasOwnProperty('attributes')
    ) {
      return false;
    }
    if (typeof input.type !== 'string') return false;
    if (typeof input.name !== 'string') return false;
    if (typeof input.attributes !== 'object') return false;
  }

  return true;
}
