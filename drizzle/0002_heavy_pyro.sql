CREATE TABLE `submission_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `ideas` ADD `moderation_status` text DEFAULT 'legacy' NOT NULL;--> statement-breakpoint
ALTER TABLE `ideas` ADD `moderation_reason` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `ideas` ADD `request_hash` text DEFAULT '' NOT NULL;