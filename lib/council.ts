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
 *   linkedin OPTIONAL. Full profile URL. Shown as a LinkedIn link.
 *   photo  OPTIONAL. A path under /public/images/, e.g. '/images/council/kimi.jpg'.
 *          Falls back to initials when absent. Use a photo the person SENT YOU.
 *          Do not lift one from LinkedIn: the photo is theirs, not ours.
 */
export type CouncilMember = {
  name: string;
  role: string;
  email?: string;
  linkedin?: string;
  photo?: string;
};

/** The shared inbox. Use this when the question is for the Council, not a person. */
export const councilEmail = 'mim.council@insead.edu';

export const council: CouncilMember[] = [
  {
    name: 'Kimi Nakamura',
    role: 'President',
    email: 'kimi.nakamura@insead.edu',
  },
  {
    name: 'Constantine Kotsikonas',
    role: 'Treasurer',
    email: 'constantine.kotsikonas@insead.edu',
  },
  {
    name: 'Amanda Causin',
    role: 'Academic',
    email: 'amanda.causin@insead.edu',
  },
  {
    name: 'Antoine Hamaïde',
    role: 'Brand',
    email: 'antoine.hamaide@insead.edu',
  },
  {
    name: 'Daniel Spokauskas',
    role: 'Careers',
    email: 'daniel.spokauskas@insead.edu',
  },
  {
    name: 'Timothy Schweins',
    role: 'Clubs & Events',
    email: 'timothy.schweins@insead.edu',
  },
  {
    name: 'Kirtana Anantharaman',
    role: 'Digital & Communication',
    email: 'kirtana.anantharaman@insead.edu',
  },
  {
    name: 'Emilie David',
    role: 'Student Life',
    email: 'emilie.david@insead.edu',
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
