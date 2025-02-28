CREATE TABLE `language_settings` (
	`id` integer PRIMARY KEY NOT NULL,
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
