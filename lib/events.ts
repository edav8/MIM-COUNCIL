/**
 * What's on — the cohort calendar shown on the homepage.
 *
 * THIS IS THE ONLY PLACE EVENT DATES LIVE. Edit this file and the homepage
 * updates; you never need to touch app/page.tsx to change, add or remove one.
 *
 * Fields:
 *   when      what the cohort reads, e.g. 'Sat 7 Nov · 21:00–01:00'
 *   sortKey   YYYY-MM-DD, used only for ordering. Past events drop off on their own.
 *   title     the event name
 *   where     venue, or '' to leave it out
 *   note      one short line; say when something is unconfirmed rather than guessing
 *   href      a link to open, or undefined for no link
 *   cta       the link's label, e.g. 'Tickets'
 *   group     'cohort' (everyone) or 'careers' (CDC / recruiting)
 */
export type CohortEvent = {
  when: string;
  sortKey: string;
  title: string;
  where?: string;
  note?: string;
  href?: string;
  cta?: string;
  group: 'cohort' | 'careers';
  /** Which pillar colour the row uses. Defaults from `group` when left out. */
  pillar?: 'academic' | 'student-life' | 'careers' | 'wellbeing';
};

/**
 * Pillar colours, the same ones as the top menus, taken from the Student Life
 * Town Hall deck of 30 Oct 2026. Keep these and lib/sections.ts in step.
 */
export const pillarColours = {
  academic: { accent: '#00684b', tint: '#e6f2e7', label: 'Academic' },
  'student-life': { accent: '#f28b32', tint: '#fdeede', label: 'Student Life' },
  careers: { accent: '#133b34', tint: '#e4ebe8', label: 'Careers' },
  wellbeing: { accent: '#087357', tint: '#e6f2e7', label: 'Well Being' },
} as const;

/** An event's pillar: explicit if set, otherwise implied by its group. */
export function pillarOf(e: CohortEvent) {
  return e.pillar ?? (e.group === 'careers' ? 'careers' : 'student-life');
}

export const events: CohortEvent[] = [
  {
    when: 'Wed 4 Nov · 19:00',
    sortKey: '2026-11-04',
    title: 'Silly Pitches Evening',
    where: 'Amphi Forster',
    note: 'Acting & Improv Club. Open to the whole cohort.',
    group: 'cohort',
  },
  {
    when: 'Sat 7 Nov · 21:00–01:00',
    sortKey: '2026-11-07',
    title: 'MIM Diwali 2026',
    where: 'La Nef, 1 Rue du Sergent Perrier, Fontainebleau',
    note: 'Bollywood, rangoli and diyas, sparklers and sweets. Indian attire encouraged, BYOB. €10.',
    href: 'https://www.helloasso.com/associations/mim-council-insead/evenements/mim-diwali-2026',
    cta: 'Tickets',
    group: 'cohort',
  },
  {
    when: 'Mon 16 – Fri 20 Nov',
    sortKey: '2026-11-16',
    title: 'Cultural Festival',
    note: 'A week of the cohort’s cultures. Sign-ups have closed.',
    group: 'cohort',
  },
  {
    when: 'Thu 26 Nov',
    sortKey: '2026-11-26',
    title: 'International Food Festival',
    note: 'Date proposed. Venue and time still to be confirmed.',
    group: 'cohort',
  },
  {
    when: 'From Mon 4 Jan 2027',
    sortKey: '2027-01-04',
    title: 'Ski Trip — Les Ménuires',
    note: 'Sold out. Join the waiting list on the trip site.',
    href: 'https://edav8.github.io/insead-ski-trip/',
    cta: 'Trip site',
    group: 'cohort',
  },
  {
    when: 'Tue 3 Nov · 12:30',
    sortKey: '2026-11-03',
    title: 'INSEAD CEO Series — Daniele Schillaci, CEO of Brembo',
    where: 'On campus',
    group: 'careers',
  },
  {
    when: 'Wed 4 Nov · 09:30',
    sortKey: '2026-11-04',
    title: 'Noritual Lab — virtual session',
    note: 'Part of the Virtual Career Fair. Register on CareerGlobe.',
    group: 'careers',
  },
  {
    when: 'Thu 19 Nov · 09:00–11:00',
    sortKey: '2026-11-19',
    title: 'Louis Vuitton Horizon Graduate Programme — info session',
    where: 'On campus',
    note: 'Registration closes at the start.',
    group: 'careers',
  },
];

/** Events still ahead of `today`, earliest first. */
export function upcoming(group: CohortEvent['group'], today = new Date()) {
  const cutoff = today.toISOString().slice(0, 10);
  return events
    .filter((e) => e.group === group && e.sortKey >= cutoff)
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}
