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
  /** e.g. 'Weekly' — shown as a tag so a dated row still reads as recurring. */
  repeats?: string;
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
  /**
   * A weekly session. `weekday` is 0=Sunday … 6=Saturday. The date shown rolls
   * forward to the next occurrence, so a weekly fixture does not disappear the
   * day after its first one — which is exactly what happened to rugby training.
   * `until` ends the series, e.g. when the season does.
   */
  repeat?: { weekday: number; until?: string };
};

/** The date an event next falls on: its own, or the next occurrence if weekly. */
export function nextDate(e: CohortEvent, today = new Date()): string | null {
  if (!e.repeat) return e.sortKey;
  const from = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  const start = new Date(`${e.sortKey}T00:00:00Z`);
  const base = start > from ? start : from;
  const shift = (e.repeat.weekday - base.getUTCDay() + 7) % 7;
  const next = new Date(base.getTime() + shift * 86400000);
  const iso = next.toISOString().slice(0, 10);
  if (e.repeat.until && iso > e.repeat.until) return null;
  return iso;
}

/**
 * Category colours, taken from The Salamanders brand guide.
 *
 *   accent  the text shade — borders, and large bold words only. The guide
 *           warns it is about 3:1 on white, so never for small text.
 *   fill    the chip/tag colour, used with ink text on top.
 *   tint    a pale version of the fill, for hover and soft backgrounds.
 */
export const pillarColours = {
  academic: { accent: '#429EC5', fill: '#93D5F6', tint: '#E9F6FD', label: 'Academic' },
  'student-life': { accent: '#E07927', fill: '#F28B32', tint: '#FDEEDE', label: 'Student Life' },
  careers: { accent: '#B49400', fill: '#FED812', tint: '#FFF8DA', label: 'Careers' },
  wellbeing: { accent: '#CF7185', fill: '#F6ADAF', tint: '#FDEEEF', label: 'Well Being' },
} as const;

/** An event's pillar: explicit if set, otherwise implied by its group. */
export function pillarOf(e: CohortEvent) {
  return e.pillar ?? (e.group === 'careers' ? 'careers' : 'student-life');
}

export const events: CohortEvent[] = [
  {
    when: 'Wed 4 Nov · 19:00–21:00',
    sortKey: '2026-11-04',
    title: 'From zero to Claude Code (and Codex)',
    where: 'DT1',
    note: 'First of the AI workshops, run by Cam and Will. For beginners — bring your laptop. Free, but the tools may need a paid plan. More advanced sessions later.',
    href: 'https://luma.com/9lzvjukl',
    cta: 'Sign up',
    group: 'cohort',
    pillar: 'academic',
  },
  {
    when: 'Wed 4 Nov · 23:00–03:00',
    sortKey: '2026-11-04',
    title: 'MIM Night Round 2',
    where: 'Mecano, Fontainebleau',
    note: 'One drink included, our DJs, no phones. Tickets on Shotgun, PIN MIM2028 — no door sales.',
    href: 'https://shotgun.live/events/mim-28-mecano-part-2',
    cta: 'Tickets',
    group: 'cohort',
  },
  {
    when: 'Mon 9 Nov · 19:30–21:00',
    repeats: 'Weekly',
    sortKey: '2026-11-09',
    title: 'Rugby — Gents’ training',
    where: 'Pitch with lights',
    note: 'INSEAD Rugby Club. 50 places a session, 25 MBAs and 25 MIMs. No experience needed.',
    repeat: { weekday: 1 },
    group: 'cohort',
  },
  {
    when: 'Thu 5 Nov · 20:00–21:30',
    repeats: 'Weekly',
    sortKey: '2026-11-05',
    title: 'Rugby — Ladies’ training, then Mimi’s',
    where: 'Pitch with lights, then Mimi’s',
    note: 'Free-flow wine, beer and pizza at Mimi’s afterwards. Tackling negotiable, enthusiasm mandatory.',
    repeat: { weekday: 4 },
    group: 'cohort',
  },
  {
    when: 'All November',
    sortKey: '2026-11-30',
    title: 'Movember',
    note: 'Shave, take a clean picture, and the best moustache wins at the end of the month.',
    group: 'cohort',
  },
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
    when: 'Tue 10 – Thu 12 Nov · evenings',
    sortKey: '2026-11-10',
    title: 'LatAm Career Fair',
    where: 'Virtual',
    note: 'Multi-school. Shopee, World Bank, Itaú, Intercorp, McKinsey, Uber, J&J, Hilti, Monitor Deloitte, Mastercard, MACA. Register on CareerGlobe.',
    group: 'careers',
  },
  {
    when: 'Thu 12 Nov · 12:45–13:30',
    sortKey: '2026-11-12',
    title: 'MIM28: FS & Trends Session',
    where: 'Zoom',
    note: 'Career Development Centre. Registration closes 11:45.',
    group: 'careers',
  },
  {
    when: 'Thu 12 Nov · 16:00–18:00',
    sortKey: '2026-11-12',
    title: 'MIM28: Brand & Pitch Tutorial',
    where: 'Amphi MBA90D',
    note: 'Career Development Centre, on campus. Registration closes the night before.',
    group: 'careers',
  },
  {
    when: 'Thu 12 Nov · 13:30',
    sortKey: '2026-11-12',
    title: 'L’Oréal Brandstorm Competition — Q&A',
    where: 'Virtual',
    group: 'careers',
  },
  {
    when: 'Thu 19 Nov · 11:00–17:00',
    sortKey: '2026-11-19',
    title: 'MIM Virtual Career Fair',
    where: 'Virtual',
    note: 'Tata Group, Gebr. Heinemann, Prophet, Syensqo, OECD, Philips, Simon-Kucher. One company an hour — register per session on CareerGlobe.',
    group: 'careers',
  },
  {
    when: 'Sat 21 Nov · 09:00',
    sortKey: '2026-11-21',
    title: 'J.P. Morgan — info session',
    where: 'Virtual',
    group: 'careers',
  },
  {
    when: 'Tue 24 Nov · 18:00–20:00',
    sortKey: '2026-11-24',
    title: 'Reach Capital — company visit',
    where: 'Paris',
    note: 'Registration closes Sun 15 Nov — nine days before the visit.',
    group: 'careers',
  },
  {
    when: 'Thu 26 Nov · 16:00–16:45',
    sortKey: '2026-11-26',
    title: 'BCG — recruitment info session & Q&A',
    where: 'FBL, Amphi DT2',
    note: 'Registration closes the night before.',
    group: 'careers',
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

/**
 * Events happening within the next `days` days, for the "coming up" strip on the
 * homepage. Month-precision and recurring entries are included when their date
 * falls in range, which is what you want for a weekly session.
 */
export function withinDays(group: CohortEvent['group'], days = 3, today = new Date()) {
  const from = today.toISOString().slice(0, 10);
  const until = new Date(today.getTime() + days * 86400000).toISOString().slice(0, 10);
  return events
    .filter((e) => e.group === group)
    .map((e) => [e, nextDate(e, today)] as const)
    .filter(([, d]) => d !== null && d >= from && d <= until)
    .sort((a, b) => a[1]!.localeCompare(b[1]!))
    .map(([e]) => e);
}

/** Group a list of events by calendar month, in order, for a month-by-month calendar. */
export function byMonth(list: CohortEvent[], today = new Date()) {
  const months = new Map<string, CohortEvent[]>();
  for (const ev of list) {
    const key = (nextDate(ev, today) ?? ev.sortKey).slice(0, 7);
    if (!months.has(key)) months.set(key, []);
    months.get(key)!.push(ev);
  }
  return [...months.entries()].map(([key, events]) => ({
    key,
    label: new Date(`${key}-01T12:00:00Z`).toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }),
    events,
  }));
}

/** Events still ahead of `today`, earliest first. */
export function upcoming(group: CohortEvent['group'], today = new Date()) {
  const cutoff = today.toISOString().slice(0, 10);
  return events
    .filter((e) => e.group === group)
    .map((e) => [e, nextDate(e, today)] as const)
    .filter(([, d]) => d !== null && d >= cutoff)
    .sort((a, b) => a[1]!.localeCompare(b[1]!))
    .map(([e]) => e);
}
