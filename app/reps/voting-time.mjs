// Canvas schedule, Europe/Paris (CEST, UTC+02:00) on 18 September 2026.
export const OPEN = Date.parse('2026-09-18T07:54:00+02:00');
export const CLOSE = Date.parse('2026-09-18T16:00:00+02:00');
export function votingState(now) {
  const phase = now < OPEN ? 'before' : now < CLOSE ? 'open' : 'closed';
  const seconds = Math.max(0, Math.ceil(((phase === 'before' ? OPEN : CLOSE) - now) / 1000));
  const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor(seconds % 3600 / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return { phase, countdown: `${hours}:${minutes}:${secs}` };
}
