import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const themeSettings = sqliteTable("theme_settings", {
    id: integer("id").primaryKey().$default(() => 1),
    themeName: text("theme_name").notNull().$default(() => "default"),
    customSettings: text("custom_settings").notNull().$default(() => "{}"),
    showQrCode: integer("show_qr_code", { mode: "boolean" }).notNull().$default(() => true),
    removeDisclaimer: integer("remove_disclaimer", { mode: "boolean" }).notNull().$default(() => false),
    updatedAt: integer("updated_at", { mode: "timestamp" })
        .notNull()
        .$default(() => new Date()),
});

// Base type from schema
export type ThemeSettings = typeof themeSettings.$inferSelect;

// Partial theme settings - omits id and updatedAt which are auto-generated
export type PartialThemeSettings = Omit<ThemeSettings, 'id' | 'updatedAt'>;

// Theme settings for updates - all fields are optional
export type ThemeSettingsUpdate = Partial<PartialThemeSettings>;

// Input type for creating a new theme settings record
export type ThemeSettingsInput = PartialThemeSettings;