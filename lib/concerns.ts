/**
 * The Concern Drop Box.
 *
 * Kirtana's note was "Concern drop box - access to us (to be checked weekly)",
 * so the weekly promise is written ON the page: a channel that quietly stops
 * being read is worse than no channel.
 *
 * `form` is a Microsoft Form in INSEAD's tenant (owner: Emilie, created 23 Nov
 * 2026): concerns may name people, and that belongs inside INSEAD. Only INSEAD
 * accounts can respond and names are NOT recorded, so it is anonymous unless
 * the person types their name in the last question.
 *
 * It is linked, not embedded: an INSEAD-only form needs a Microsoft sign-in,
 * and Microsoft's sign-in page refuses to load inside an iframe.
 */
export const form: string | null =
  'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=wPeN2eeJ-Ea3q3L-H22CH5-iuYN6LoxFhjmub00HN9dUMkhFSDg0TTBQVU5EWURaU1lWN0xJS1IxQy4u';

/** Who reads it and how fast — stated plainly, because people will assume. */
export const promise = {
  whoReads: 'The eight of us on the Student Council.',
  howOften: 'Checked every week.',
  anonymous:
    'You can leave your name out. If you do, we cannot come back to you — so include it if you want an answer.',
};

/** When the Council is not the right channel. */
export const escalate = [
  {
    what: 'Anything urgent, or anyone at risk',
    who: 'Do not use this box. Contact INSEAD directly, or emergency services.',
  },
  {
    what: 'Harassment or misconduct',
    who: 'INSEAD has formal channels that can act. We can point you to them, but we cannot investigate.',
  },
  {
    what: 'Academic appeals and grades',
    who: 'These go through the Programme team, not the Council.',
  },
];

/** What the box IS good for. */
export const goodFor = [
  'Something about cohort life that is not working',
  'An idea you would rather raise quietly than in a group chat',
  'Feedback on something the Council has done',
  'Something you have noticed that we have not',
];
