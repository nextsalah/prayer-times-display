import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const themeSettings = sqliteTable("theme_settings", {
    id: integer("id").primaryKey().$default(() => 1),
    themeName: text("theme_name").notNull().$default(() => "default"),
    customSettings: text("custom_settings").notNull().$default(() => "{}"),
    updatedAt: integer("updated_at", { mode: "timestamp" })
        .notNull()
        .$default(() => new Date()),
});

export type ThemeSettings = typeof themeSettings.$inferSelect;