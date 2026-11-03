/**
 * MIM of the Week — nominations, voting, and who is being recognised now.
 *
 * WEEKLY ROUTINE (about two minutes):
 *   1. read the nominations in Qualtrics
 *   2. set `current` below to the winner
 *   3. move last week's entry to the top of `past`
 *   4. push — the homepage and /mim-of-the-week/ update on the next build
 *
 * Set `current` to null and the homepage section disappears rather than showing
 * a stale name. Nothing here needs touching on a week nobody is named.
 *
 * THE FORMS. A static site cannot count votes, so both forms live in INSEAD's
 * own Qualtrics and are embedded in the page — people never leave mim28.com, and
 * nominations about named classmates stay inside the school's tenant rather than
 * a third-party inbox. Create them from
 * docs/mim-of-the-week-qualtrics-import.txt, then paste the links below.
 */
export type MimOfTheWeek = {
  name: string;
  week: string;
  why: string;
  photo?: string;
  nominatedBy?: string;
};

/** Whoever is being recognised right now. null = nothing shown anywhere. */
export const current: MimOfTheWeek | null = null;

/** Most recent first. Shown on /mim-of-the-week/ once there is a history. */
export const past: MimOfTheWeek[] = [];

/**
 * Paste the Qualtrics links here once the forms exist.
 * `nominate` collects names; `vote` is the following week's shortlist.
 * Leave either null and the page shows a short "opens soon" note instead of an
 * empty frame.
 */
export const forms: { nominate: string | null; vote: string | null } = {
  nominate: null,
  vote: null,
};

/** How it works, shown on the page so the rules are public rather than folklore. */
export const howItWorks = [
  'Anyone in MIM’28 can nominate anyone else — classmates, not the Council.',
  'Say what they actually did. One specific thing beats three adjectives.',
  'Nominations close Sunday evening. Voting opens Monday on the shortlist.',
  'The most-voted name goes up on Tuesday, and earns a Contributor Badge.',
  'You cannot nominate yourself, and the Council does not pick the winner.',
];

/** 'Jane Doe' -> 'JD' */
export function initialsOf(name: string) {
  return name.split(/\s+/).slice(0, 2).map((p) => p.charAt(0)).join('').toUpperCase();
}
