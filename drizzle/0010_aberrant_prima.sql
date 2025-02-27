CREATE TABLE `date_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`date_format` text DEFAULT 'DD/MM/YYYY' NOT NULL
);
--> statement-breakpoint
ALTER TABLE `time_settings` DROP COLUMN `date_format`;