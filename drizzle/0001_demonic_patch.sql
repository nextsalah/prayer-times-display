CREATE TABLE `theme_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`theme_name` text NOT NULL,
	`custom_settings` text NOT NULL,
	`updated_at` integer NOT NULL
);
