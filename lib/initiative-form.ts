/**
 * The fields of the "Propose an initiative" form.
 *
 * The page has no server — GitHub Pages runs no code — so the form composes a
 * formatted email and hands it to the sender's mail app, addressed to the
 * Council. Nothing is transmitted anywhere else, and no third-party form
 * service is involved.
 *
 * Edit this list to change the form. `label` is what the proposer sees;
 * `heading` groups fields into the sections of a proposal.
 */
export type Field = {
  id: string;
  label: string;
  hint?: string;
  type: 'text' | 'email' | 'textarea' | 'select';
  options?: string[];
  required?: boolean;
  rows?: number;
};
export type FormSection = { heading: string; blurb?: string; fields: Field[] };

export const formSections: FormSection[] = [
  {
    heading: '1. What it is',
    fields: [
      { id: 'title', label: 'Name of the initiative', type: 'text', required: true },
      {
        id: 'what',
        label: 'Describe it',
        hint: 'A short paragraph, as if to someone who has never heard of it. What happens, and who is it for?',
        type: 'textarea',
        rows: 4,
        required: true,
      },
      {
        id: 'cadence',
        label: 'How often would it run?',
        type: 'select',
        options: ['One-off', 'Weekly', 'Every two weeks', 'Monthly', 'Once a period', 'Other'],
      },
      { id: 'period', label: 'Over what period?', hint: 'e.g. P2–P3, or November to June', type: 'text' },
      {
        id: 'before',
        label: 'Has it run before?',
        type: 'select',
        options: ['No, this would be the first time', 'Yes, here at INSEAD', 'Yes, at another campus or cohort'],
      },
    ],
  },
  {
    heading: '2. Who is running it',
    fields: [
      { id: 'team', label: 'Who is on the team?', type: 'textarea', rows: 2, required: true },
      {
        id: 'experience',
        label: 'What has each of you run before, and at what scale?',
        hint: 'Relevant experience matters more than enthusiasm.',
        type: 'textarea',
        rows: 3,
      },
      { id: 'contact', label: 'Who should we contact?', type: 'text', required: true },
      { id: 'contact_email', label: 'Their INSEAD email', type: 'email', required: true },
    ],
  },
  {
    heading: '3. Where you are now',
    fields: [
      {
        id: 'secured',
        label: 'What is already secured?',
        hint: 'A venue, a speaker, a partner, a confirmed date — anything concrete.',
        type: 'textarea',
        rows: 3,
      },
      { id: 'blocked', label: 'What is blocked, and on what?', type: 'textarea', rows: 2 },
    ],
  },
  {
    heading: '4. What you are asking for',
    blurb:
      'Set the budget out line by line, not as a single number — what it is, unit price, how many, subtotal.',
    fields: [
      {
        id: 'budget',
        label: 'Budget, line by line',
        hint: 'e.g. Guest travel — 7 × €40 = €280',
        type: 'textarea',
        rows: 5,
        required: true,
      },
      { id: 'total', label: 'Total requested (€)', type: 'text', required: true },
      { id: 'participants', label: 'What do participants pay themselves?', type: 'textarea', rows: 2 },
      {
        id: 'smaller',
        label: 'Could you start with less than the full amount?',
        type: 'select',
        options: ['Yes — a smaller amount would still let us begin', 'No — the full amount is needed to start', 'Not sure'],
      },
      { id: 'smaller_detail', label: 'If yes, how much, and what would it cover?', type: 'textarea', rows: 2 },
    ],
  },
  {
    heading: '5. Timing',
    fields: [
      { id: 'first_date', label: 'When would the first session be?', type: 'text' },
      { id: 'decision_by', label: 'When do you need an answer by?', type: 'text' },
      {
        id: 'decision_why',
        label: 'Why that date?',
        hint: 'Say so plainly if dates cannot be fixed until funding is confirmed.',
        type: 'textarea',
        rows: 2,
      },
      { id: 'anything_else', label: 'Anything else we should know?', type: 'textarea', rows: 2 },
    ],
  },
];
