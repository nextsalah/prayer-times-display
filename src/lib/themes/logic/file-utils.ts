import { fileService } from '$lib/db';
import type { IField } from '@ismail424/svelte-formly';
import type { FileMetadata } from '$lib/themes/interfaces/types';

/**
 * Interface for file objects used in the UI
 */
interface EnhancedFileMetadata {
  /** Unique identifier of the file */
  id: string;
  /** Display name of the file */
  name: string;
  /** URL to access the file */
  url: string;
  /** MIME type of the file */
  type: string;
  /** Size of the file in bytes */
  size: number;
  /** ISO timestamp when the file was uploaded */
  uploadedAt: string;
  /** Flag indicating this is a stored file */
  isStoredFile: boolean;
  /** Additional preview URL if available */
  previewUrl?: string;
}

/**
 * Enhances user settings by loading complete file metadata for any file fields
 * @param userSettings The user settings object to enhance
 * @param customizationFields The theme customization fields
 * @param themeName The current theme name
 * @returns Enhanced settings with complete file metadata
 */
export async function enhanceFileMetadata(
  userSettings: Record<string, any>,
  customizationFields: IField[],
  themeName: string
): Promise<Record<string, any>> {
  // Only process if there are file fields
  const fileFields = customizationFields.filter(field => field.type === 'file');
  if (fileFields.length === 0) return userSettings;

  try {
    // Get all files for this theme
    const themeFiles = await fileService.getFilesByTheme(themeName);
    if (themeFiles.length === 0) return userSettings;

    // Create a clone of the settings to avoid mutating the original
    const enhancedSettings = { ...userSettings };

    // Process each file field
    for (const field of fileFields) {
      const fileValues = enhancedSettings[field.name] || [];
      if (!fileValues || !Array.isArray(fileValues)) {
        enhancedSettings[field.name] = [];
      }

      // Get IDs of files already referenced in settings
      const existingFileIds = new Set(
        (Array.isArray(fileValues) ? fileValues : [])
          .filter((fileRef): fileRef is { id: string | number } => 
            fileRef && 
            typeof fileRef === 'object' && 
            'id' in fileRef && 
            (typeof fileRef.id === 'string' || typeof fileRef.id === 'number')
          )
          .map(fileRef => fileRef.id.toString())
      );

      // Convert existing file references to include full metadata
      const enhancedFiles = (Array.isArray(fileValues) ? fileValues : [])
        .filter((fileRef): fileRef is { id: string | number } => 
          fileRef && 
          typeof fileRef === 'object' && 
          'id' in fileRef && 
          (typeof fileRef.id === 'string' || typeof fileRef.id === 'number')
        )
        .map(fileRef => {
          const fileMetadata = themeFiles.find(f => f.id.toString() === fileRef.id.toString());
          
          if (!fileMetadata) return null;
          
          // Convert DB metadata to the format expected by the UI
          const enhancedFile: EnhancedFileMetadata = {
            id: fileMetadata.id.toString(),
            name: fileMetadata.name,
            url: `/api/files/${fileMetadata.id}`,
            type: fileMetadata.type,
            size: fileMetadata.size,
            uploadedAt: fileMetadata.createdAt.toISOString(),
            isStoredFile: true,
            previewUrl: `/api/files/${fileMetadata.id}`
          };
          
          return enhancedFile;
        })
        .filter((file): file is EnhancedFileMetadata => file !== null);

      // Include all theme files that aren't already referenced
      const additionalFiles = themeFiles
        .filter(fileMetadata => !existingFileIds.has(fileMetadata.id.toString()))
        .map(fileMetadata => ({
          id: fileMetadata.id.toString(),
          name: fileMetadata.name,
          url: `/api/files/${fileMetadata.id}`,
          type: fileMetadata.type,
          size: fileMetadata.size,
          uploadedAt: fileMetadata.createdAt.toISOString(),
          isStoredFile: true,
          previewUrl: `/api/files/${fileMetadata.id}`
        }));

      // Update the settings with both enhanced references and additional files
      enhancedSettings[field.name] = [...enhancedFiles, ...additionalFiles];
    }

    return enhancedSettings;
  } catch (error) {
    console.error('Error enhancing file metadata:', error);
    // Return original settings if enhancement fails
    return userSettings;
  }
}