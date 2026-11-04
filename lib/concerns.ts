/**
 * The Concern Drop Box.
 *
 * Kirtana's note was "Concern drop box - access to us (to be checked weekly)",
 * so the weekly promise is written ON the page: a channel that quietly stops
 * being read is worse than no channel.
 *
 * `form` takes the Qualtrics link once it exists. Until then the page says the
 * box is being set up and points at the Council inbox, rather than showing a
 * button that goes nowhere.
 *
 * Qualtrics rather than a third-party form: concerns may name people, and that
 * belongs inside INSEAD's tenant.
 */
export const form: string | null = null;

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
