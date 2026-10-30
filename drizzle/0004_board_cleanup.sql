-- One-time cleanup explicitly requested by the website owner on 2026-09-07.
-- Like buttons remain active; future votes accumulate normally.
DELETE FROM votes WHERE idea_id IN (
  'regional-career-panels',
  'recent-graduate-qa',
  'founders-meetups',
  'accounting-clinics'
);
--> statement-breakpoint
-- Remove the two existing cohort examples from public display without deleting
-- their private records or any linked feedback.
UPDATE ideas SET is_public=0, moderation_status='archived'
WHERE id IN (
  'a7eb230c-9ba5-460b-a6e1-d8374aa81d81',
  'c1105328-1850-4f80-9378-9e1b4e913694'
);
