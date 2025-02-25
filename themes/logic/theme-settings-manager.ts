import type { IField } from '@ismail424/svelte-formly';
import type { FileMetadata } from '../interfaces/types';

/**
 * Extracts TypeScript types from form field definitions
 */
export type SettingsFromFields<T extends readonly IField[]> = {
  [K in Extract<T[number], { name: string }>['name']]?: 
    Extract<T[number], { name: K }>['type'] extends 'file' ? FileMetadata[] :
    Extract<T[number], { name: K }>['type'] extends 'checkbox' ? boolean :
    Extract<T[number], { name: K }>['type'] extends 'input' ? 
      Extract<T[number], { name: K }>['attributes'] extends { type: 'number' } ? number : string :
    Extract<T[number], { name: K }>['type'] extends 'select' ? string :
    Extract<T[number], { name: K }>['type'] extends 'textarea' ? string :
    Extract<T[number], { name: K }>['type'] extends 'color' ? string :
    string;
};

/**
 * Get default settings from form fields
 */
export function getDefaultSettings<T extends IField[]>(formFields: T): SettingsFromFields<T> {
  const defaults: Record<string, any> = {};
  
  formFields.forEach(field => {
    if (field.value !== undefined && field.value !== null) {
      defaults[field.name] = field.value;
    }
  });
  
  return defaults as SettingsFromFields<T>;
}

/**
 * Merge user settings with default values
 */
export function mergeWithDefaults<T extends IField[]>(
  userSettings: Record<string, any> | null | undefined,
  formFields: T
): SettingsFromFields<T> {
  const defaults = getDefaultSettings(formFields);
  const settings = { ...defaults };

  // If user settings exist, override defaults
  if (userSettings) {
    Object.keys(userSettings).forEach(key => {
      if (userSettings[key] !== undefined && userSettings[key] !== null && userSettings[key] !== 'null') {
        settings[key as keyof SettingsFromFields<T>] = userSettings[key];
      }
    });
  }

  return settings as SettingsFromFields<T>;
}

/**
 * Validate form data against field rules
 */
export function validateFormData<T extends IField[]>(
  formData: Record<string, any>,
  formFields: T
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  formFields.forEach(field => {
    const value = formData[field.name];
    
    // Check required fields
    if (field.rules?.includes('required') && (value === undefined || value === null || value === '')) {
      errors[field.name] = `${field.name} is required`;
    }
    
    // Check type constraints
    if (value !== undefined && value !== null) {
      if (field.type === 'input' && field.attributes?.type === 'number' && isNaN(Number(value))) {
        errors[field.name] = `${field.name} must be a number`;
      }
    }
  });
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Process form data into settings object
 */
export async function processFormData<T extends IField[]>(
  formData: FormData,
  formFields: T,
  fileUploader: (file: File) => Promise<FileMetadata>
): Promise<SettingsFromFields<T>> {
  const result: Record<string, any> = {};
  const processedKeys = new Set<string>();
  
  // Process form entries
  for (const [key, value] of formData.entries()) {
    if (!value || key === 'touched' || key === 'valid') {
      continue;
    }

    // Avoid processing the same key multiple times
    if (processedKeys.has(key)) {
      continue;
    }
    processedKeys.add(key);

    // Get field definition
    const fieldDef = formFields.find(f => f.name === key);
    
    if (!fieldDef) continue;

    if (value instanceof File && value.size > 0) {
      const fileMetadata = await fileUploader(value);
      
      if (Array.isArray(result[key])) {
        result[key].push(fileMetadata);
      } else {
        result[key] = [fileMetadata];
      }
    } else {
      // Convert to appropriate type based on field definition
      if (fieldDef.type === 'checkbox') {
        result[key] = String(value) === 'true';
      } else if (fieldDef.type === 'input' && fieldDef.attributes?.type === 'number') {
        result[key] = Number(value);
      } else {
        result[key] = value.toString();
      }
    }
  }
  
  return result as SettingsFromFields<T>;
}