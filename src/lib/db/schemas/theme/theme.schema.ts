import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const themeSettings = sqliteTable("theme_settings", {
    id: integer("id").primaryKey(),
    themeFolder: text("theme_folder").notNull(),
    customSettings: text("custom_settings").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
        .notNull(),
});

export type ThemeSettings = typeof themeSettings.$inferSelect;