CREATE TABLE `prayer_options` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`show_iqamah` integer DEFAULT true NOT NULL,
	`iqamah` integer DEFAULT 0 NOT NULL,
	`iqamah_after_prayer` integer DEFAULT true NOT NULL,
	`offset` integer DEFAULT 0 NOT NULL,
	`is_fixed` integer DEFAULT false NOT NULL,
	`fixed_time` text NOT NULL
);
