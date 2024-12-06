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
CREATE UNIQUE INDEX `prayertimes_date_unique` ON `prayertimes` (`date`);