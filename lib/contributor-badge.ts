/**
 * The MIM Contributor Badge.
 *
 * Content from the Student Council Town Hall of 2 Oct 2026, which introduced the
 * badge alongside MIM2MIM Tutoring ("Every tutor earns a Contributor Badge").
 *
 * EDIT HERE to change what counts or how it works. `nominateForm` takes the
 * Qualtrics link once it exists; until then the page says so rather than
 * showing a dead button.
 */
export const nominateForm: string | null = null;

/** What the badge is for, in one paragraph on the page. */
export const intro =
  'The Contributor Badge recognises people who give their time to the cohort. ' +
  'Not the loudest or the most visible — the ones who actually showed up for ' +
  'someone else.';

/** Ways people earn it. Add to this as the Council recognises more. */
export const waysToEarn = [
  {
    title: 'Tutor a classmate',
    detail: 'Every MIM2MIM tutor earns a badge. Run sessions in any subject.',
    href: '/tutoring/',
  },
  {
    title: 'Run an initiative',
    detail: 'Propose something for the cohort and see it through.',
    href: '/initiatives/',
  },
  {
    title: 'Organise an event',
    detail: 'Festivals, trips, socials, sport — anything the cohort turns up to.',
  },
  {
    title: 'Look out for someone',
    detail: 'Quietly helping a classmate counts, and is the easiest to overlook.',
  },
];

/** The checklist, so the standard is public rather than folklore. */
export const checklist = [
  'The contribution was for the cohort, not for yourself.',
  'It took real time or effort — more than a one-off favour.',
  'Someone other than you can vouch for it.',
  'It happened this academic year.',
  'You are not nominating yourself.',
];

/** How a nomination becomes a badge. */
export const process = [
  'Anyone in MIM’28 nominates anyone else.',
  'The Council checks it against the list above.',
  'Badges are awarded at the Town Hall, and the contribution is read out.',
  'Tutors are awarded automatically — no nomination needed.',
];
