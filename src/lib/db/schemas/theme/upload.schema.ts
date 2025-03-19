import { text, integer, blob, sqliteTable } from "drizzle-orm/sqlite-core";
import { themeSettings } from "./theme.schema";


// New table for uploaded files
export const uploadedFiles = sqliteTable("uploaded_files", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    type: text("type").notNull(),
    description: text("description"),
    themeName: text("theme_name").notNull(), // Name of the theme associated with the file
    data: blob("data").notNull(), // Store the file as a blob
    size: integer("size").notNull(), // Size in bytes
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .$default(() => new Date()),
});

// Base type from schema
export type UploadedFile = typeof uploadedFiles.$inferSelect;

// For file uploads - omits id, data, and createdAt which are auto-generated or handled during upload
export type FileUploadInput = Omit<UploadedFile, 'id' | 'data' | 'createdAt'> & {
    data: File;
};
// Metadata for returning file info without the blob data
export type FileMetadata = Omit<UploadedFile, 'data'>;

