CREATE TABLE `votes` (
	`idea_id` text NOT NULL,
	`voter_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`idea_id`, `voter_id`)
);
--> statement-breakpoint
ALTER TABLE `ideas` ADD `title` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `ideas` ADD `is_public` integer DEFAULT 0 NOT NULL;