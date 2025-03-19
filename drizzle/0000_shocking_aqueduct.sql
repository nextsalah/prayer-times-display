CREATE TABLE `prayertimes` (
	`id` integer PRIMARY KEY NOT NULL,
	`date` integer NOT NULL,
	`fajr` text NOT NULL,
	`sunrise` text NOT NULL,
	`dhuhr` text NOT NULL,
	`asr` text NOT NULL,
	`maghrib` text NOT NULL,
	`isha` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `prayer_config` (
	`id` integer PRIMARY KEY NOT NULL,
	`settings` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `theme_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`theme_name` text NOT NULL,
	`custom_settings` text NOT NULL,
	`show_qr_code` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `uploaded_images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`filename` text NOT NULL,
	`mime_type` text NOT NULL,
	`description` text,
	`theme_name` text NOT NULL,
	`data` blob NOT NULL,
	`size` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `date_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`date_format` text DEFAULT 'DD/MM/YYYY' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `language_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`language_code` text DEFAULT 'en' NOT NULL,
	`fajr` text DEFAULT 'Fajr' NOT NULL,
	`sunrise` text DEFAULT 'Sunrise' NOT NULL,
	`dhuhr` text DEFAULT 'Dhuhr' NOT NULL,
	`asr` text DEFAULT 'Asr' NOT NULL,
	`maghrib` text DEFAULT 'Maghrib' NOT NULL,
	`isha` text DEFAULT 'Isha' NOT NULL,
	`prayer` text DEFAULT 'Prayer' NOT NULL,
	`iqamah` text DEFAULT 'Iqamah' NOT NULL,
	`begins` text DEFAULT 'Begins' NOT NULL,
	`next` text DEFAULT 'Next' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `time_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`time_format` text DEFAULT '24h' NOT NULL,
	`show_seconds` integer DEFAULT true NOT NULL,
	`use_24_hour` integer DEFAULT true NOT NULL,
	`time_style` text DEFAULT 'medium' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `prayertimes_date_unique` ON `prayertimes` (`date`);