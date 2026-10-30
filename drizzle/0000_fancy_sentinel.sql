CREATE TABLE `ideas` (
	`id` text PRIMARY KEY NOT NULL,
	`idea` text NOT NULL,
	`source_idea` text DEFAULT '' NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`contact` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL
);
