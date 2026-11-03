/**
 * What a funding proposal to the Council has to contain.
 *
 * The shape is taken from a proposal that worked: it told the Council what the
 * thing is, who is running it, what already exists, and exactly what it costs,
 * itemised. Those are the four things needed to say yes or no without a meeting.
 *
 * Edit this file to change the guidance; /initiatives/ is generated from it.
 */
export type GuideSection = { heading: string; blurb: string; asks: string[] };

export const sections: GuideSection[] = [
  {
    heading: '1. What it is',
    blurb:
      'Describe the initiative in a short paragraph, as if to someone who has never heard of it. Say who it is for and how often it runs.',
    asks: [
      'What happens, and who attends',
      'How often, and over what period',
      'Whether it has run before — here or at another campus',
    ],
  },
  {
    heading: '2. Who is running it',
    blurb:
      'Name everyone involved and say why this team can deliver it. Relevant experience beats enthusiasm.',
    asks: [
      'Names of the organisers',
      'What each person has run before, and at what scale',
      'Who the Council should contact',
    ],
  },
  {
    heading: '3. Where you are now',
    blurb:
      'What already exists. A proposal with something confirmed is far easier to support than one that is still an idea.',
    asks: [
      'Anything already secured — a venue, a speaker, a partner',
      'What is in progress',
      'What is blocked, and on what',
    ],
  },
  {
    heading: '4. What you are asking for',
    blurb:
      'An itemised budget, not a single number. Show unit cost × quantity for each line, then the total. State what participants pay themselves.',
    asks: [
      'Each cost line: what it is, unit price, how many, subtotal',
      'The total, and the currency and rate if anything is not in euros',
      'What is covered by participants rather than the Council',
      'Whether a smaller amount would still let you start',
    ],
  },
  {
    heading: '5. Timing',
    blurb:
      'When you need an answer, and what that answer unblocks. Say plainly if dates cannot be fixed until funding is confirmed.',
    asks: [
      'The date of the first session',
      'When you need a decision by, and why',
    ],
  },
];

/** Shown as the budget example. Deliberately generic — no real proposal's numbers. */
export const budgetExample = {
  caption: 'Set the budget out line by line, like this:',
  rows: [
    ['Guest travel', '7 × €40', '€280'],
    ['Gifts', '7 × €12', '€84'],
    ['Meals', '7 × €50', '€350'],
  ],
  total: ['Total', '', '€714'],
  note: 'Break it down per location or per term if the initiative runs in more than one.',
};
