// db/schema.ts
import { text, integer, blob, sqliteTable } from "drizzle-orm/sqlite-core";
import { themeSettings } from "./theme.schema";


// New table for uploaded images
export const uploadedImages = sqliteTable("uploaded_images", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    filename: text("filename").notNull(),
    mimeType: text("mime_type").notNull(),
    description: text("description"),
    themeName: text("theme_name").notNull(), // Name of the theme associated with the image
    data: blob("data").notNull(), // Store the image as a blob
    size: integer("size").notNull(), // Size in bytes
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .$default(() => new Date()),
});

// Base type from schema
export type ThemeSettings = typeof themeSettings.$inferSelect;
export type UploadedImage = typeof uploadedImages.$inferSelect;

// Partial theme settings - omits id and updatedAt which are auto-generated
export type PartialThemeSettings = Omit<ThemeSettings, 'id' | 'updatedAt'>;

// For image uploads - omits id, data, and createdAt which are auto-generated or handled during upload
export type ImageUploadInput = Omit<UploadedImage, 'id' | 'data' | 'createdAt'> & {
    data: File;
};

// Metadata for returning image info without the blob data
export type ImageMetadata = Omit<UploadedImage, 'data'>;

// Theme settings for updates - all fields are optional
export type ThemeSettingsUpdate = Partial<PartialThemeSettings>;

// Input type for creating a new theme settings record
export type ThemeSettingsInput = PartialThemeSettings;