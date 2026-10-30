# Direct feedback email

Set `RESEND_API_KEY`, `FEEDBACK_EMAIL_FROM` (a verified Resend sender) and
`FEEDBACK_EMAIL_TO` in private Sites runtime settings, then deploy to apply them.
The recipient is fixed by server configuration; submitters cannot choose it.
All three values are required. Until then, existing feedback collection works and
direct email is disabled. Never commit real credentials or recipient details.

New submissions and their private notification payload are stored atomically.
Public ideas are emailed after their AI review; private messages bypass AI.
If review is interrupted, the initial private pending notification becomes
eligible after two minutes and flags the submission for attention. Exact
duplicates do not create a new submission or notification.

Delivery runs in `after()` background work. Resend receives an immutable plain-text
payload and an idempotency key derived from the submission ID. Database leases
prevent concurrent requests from sending the same queued message. Provider
acceptance, rather than guaranteed inbox delivery, sets the outbox status to `sent`.

Temporary failures receive up to three bounded attempts. Unsent messages remain in
`email_outbox`; later board visits or submission retries resume them after a
one-minute delay. This is request-triggered recovery, not an independently running
managed queue: after all immediate attempts fail, recovery needs another visit.
No Codex task or open Mac is needed for normal delivery.

Permanent provider errors and uncertain attempts older than 23 hours are marked
`attention` for reconciliation. Do not blindly retry after Resend's 24-hour
idempotency window; check its delivery log first to avoid duplicate email.
Use the authenticated Sites database viewer to inspect the private queue. The
public board API never returns this table or private submission fields.

Test provider delivery and a complete website submission before retiring the
previous scheduled alert. Historical submissions are not automatically backfilled.
