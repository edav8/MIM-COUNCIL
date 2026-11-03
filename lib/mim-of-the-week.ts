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
  /** true = sample content, rendered with a visible 'placeholder' flag. */
  placeholder?: boolean;
};

export const current: MimOfTheWeek | null = {
  // PLACEHOLDER — replace with a real nomination, or set this back to null to
  // hide the section. It is deliberately obvious so it cannot ship by accident.
  name: 'Nobody yet',
  week: 'Week of 3 November',
  why: 'This is a placeholder. Nominate a classmate who did something good for the cohort and their name goes here.',
  placeholder: true,
};

export const past: MimOfTheWeek[] = [];

/** 'Jane Doe' -> 'JD' */
export function initialsOf(name: string) {
  return name.split(/\s+/).slice(0, 2).map((p) => p.charAt(0)).join('').toUpperCase();
}
