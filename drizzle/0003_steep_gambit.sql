CREATE TABLE `prayer_config` (
	`id` integer PRIMARY KEY NOT NULL,
	`show_iqamah` text NOT NULL,
	`iqamah` text NOT NULL,
	`iqamah_after_prayer` text NOT NULL,
	`offset` text NOT NULL,
	`is_fixed` text NOT NULL,
	`fixed_time` text NOT NULL
);
--> statement-breakpoint
DROP TABLE `prayer_options`;