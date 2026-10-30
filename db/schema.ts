import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core';
export const ideas = sqliteTable('ideas', {
  id: text('id').primaryKey(),
  idea: text('idea').notNull(),
  title: text('title').notNull().default(''),
  isPublic: integer('is_public').notNull().default(0),
  sourceIdea: text('source_idea').notNull().default(''),
  name: text('name').notNull().default(''),
  contact: text('contact').notNull().default(''),
  createdAt: integer('created_at').notNull(),
  moderationStatus: text('moderation_status').notNull().default('legacy'),
  moderationReason: text('moderation_reason').notNull().default(''),
  requestHash: text('request_hash').notNull().default(''),
});

export const votes = sqliteTable('votes', { ideaId:text('idea_id').notNull(), voterId:text('voter_id').notNull(), createdAt:integer('created_at').notNull() }, table => [primaryKey({columns:[table.ideaId,table.voterId]})]);

export const submissionLimits = sqliteTable('submission_limits', {
  key: text('key').primaryKey(),
  count: integer('count').notNull(),
  expiresAt: integer('expires_at').notNull(),
});

// Immutable notification payloads stay in the private database, never the board API.
export const emailOutbox = sqliteTable('email_outbox', {
  ideaId: text('idea_id').primaryKey(),
  payload: text('payload').notNull(),
  createdAt: integer('created_at').notNull(),
  status: text('status').notNull().default('pending'),
  attempts: integer('attempts').notNull().default(0),
  firstAttemptAt: integer('first_attempt_at').notNull().default(0),
  nextAttemptAt: integer('next_attempt_at').notNull().default(0),
  leaseUntil: integer('lease_until').notNull().default(0),
  providerId: text('provider_id').notNull().default(''),
  lastError: text('last_error').notNull().default(''),
});

// Delivery metadata only; club messages and reply details are not stored here.
export const clubsHandoffs=sqliteTable('clubs_handoffs',{
 id:text('id').primaryKey(),fingerprint:text('fingerprint').notNull(),owner:text('owner').notNull(),state:text('state').notNull(),firstAttemptAt:integer('firstAttemptAt').notNull(),leaseUntil:integer('leaseUntil').notNull(),retryBefore:integer('retryBefore').notNull(),providerId:text('providerId'),
});
export const clubsLimits=sqliteTable('clubs_limits',{
 key:text('key').primaryKey(),count:integer('count').notNull().default(0),expiresAt:integer('expiresAt').notNull(),
},table=>[index('clubs_limits_expiry').on(table.expiresAt)]);
