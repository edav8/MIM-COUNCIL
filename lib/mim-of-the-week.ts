/**
 * MIM of the Week — one classmate the cohort wants to thank.
 *
 * EDIT THIS FILE each week. Set `current` to the person being recognised, and
 * move the previous one into `past`. Set `current` to null and the homepage
 * section disappears entirely rather than showing a stale name.
 *
 *   name    as they write it
 *   week    what the page shows, e.g. 'Week of 3 November'
 *   why     one or two sentences: what they actually did
 *   photo   OPTIONAL, under /public/images/. Falls back to their initials.
 *   nominatedBy OPTIONAL — leave out if the nominator would rather not be named.
 */
export type MimOfTheWeek = {
  name: string;
  week: string;
  why: string;
  photo?: string;
  nominatedBy?: string;
};

export const current: MimOfTheWeek | null = null;

export const past: MimOfTheWeek[] = [];

/** 'Jane Doe' -> 'JD' */
export function initialsOf(name: string) {
  return name.split(/\s+/).slice(0, 2).map((p) => p.charAt(0)).join('').toUpperCase();
}
