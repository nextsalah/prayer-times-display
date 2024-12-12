ALTER TABLE `prayer_config` ADD `settings` text NOT NULL;--> statement-breakpoint
ALTER TABLE `prayer_config` DROP COLUMN `show_iqamah`;--> statement-breakpoint
ALTER TABLE `prayer_config` DROP COLUMN `iqamah`;--> statement-breakpoint
ALTER TABLE `prayer_config` DROP COLUMN `iqamah_after_prayer`;--> statement-breakpoint
ALTER TABLE `prayer_config` DROP COLUMN `offset`;--> statement-breakpoint
ALTER TABLE `prayer_config` DROP COLUMN `is_fixed`;--> statement-breakpoint
ALTER TABLE `prayer_config` DROP COLUMN `fixed_time`;--> statement-breakpoint
ALTER TABLE `prayer_config` DROP COLUMN `specific_settings`;