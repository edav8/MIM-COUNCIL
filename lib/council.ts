/**
 * The MIM'28 Student Council.
 *
 * Confirmed in writing by Degree Programmes on Fri 18 Sep 2026. Eight members.
 *
 * Edit this file to change the roster; the /team page reads it.
 *
 *   name   as the person writes it
 *   role   their portfolio on the council
 *   email  OPTIONAL. Shown as a mailto link. Leave it out and no link appears.
 *          Only add an address the person is happy to have on a public page —
 *          this site is read by the whole cohort.
 *   photo  OPTIONAL. A path under /public/images/, e.g. '/images/council/kimi.jpg'.
 *          Falls back to initials when absent. Use a photo the person SENT YOU.
 *          Do not lift one from LinkedIn: the photo is theirs, not ours.
 */
export type CouncilMember = {
  name: string;
  role: string;
  email?: string;
  photo?: string;
};

export const council: CouncilMember[] = [
  { name: 'Kimi Nakamura', role: 'President' },
  { name: 'Constantine Kotsikonas', role: 'Treasurer' },
  { name: 'Amanda Causin', role: 'Academic' },
  { name: 'Antoine Hamaïde', role: 'Brand' },
  { name: 'Daniel Spokauskas', role: 'Careers' },
  { name: 'Timothy Schweins', role: 'Clubs & Events' },
  { name: 'Kirtana Anantharaman', role: 'Digital & Communication' },
  {
    name: 'Emilie David',
    role: 'Student Life',
    photo: '/images/council/emilie-david.jpg',
  },
];

/** 'Kirtana Anantharaman' -> 'KA'. Used when a member has no photo. */
export function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}
