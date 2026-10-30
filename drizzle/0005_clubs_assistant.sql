CREATE TABLE IF NOT EXISTS `clubs_handoffs` (
	`id` text PRIMARY KEY NOT NULL,
	`fingerprint` text NOT NULL,
	`owner` text NOT NULL,
	`state` text NOT NULL,
	`firstAttemptAt` integer NOT NULL,
	`leaseUntil` integer NOT NULL,
	`retryBefore` integer NOT NULL,
	`providerId` text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `clubs_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`expiresAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `clubs_limits_expiry` ON `clubs_limits` (`expiresAt`);