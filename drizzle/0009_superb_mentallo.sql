CREATE TABLE `time_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`time_format` text DEFAULT '24h' NOT NULL,
	`date_format` text DEFAULT 'DD/MM/YYYY' NOT NULL,
	`show_seconds` integer DEFAULT true NOT NULL,
	`use_24_hour` integer DEFAULT true NOT NULL,
	`time_style` text DEFAULT 'medium' NOT NULL
);
