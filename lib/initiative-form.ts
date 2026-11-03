/**
 * The "Propose an initiative" form.
 *
 * Mirrors the Council's own three-part Initiative Proposal template exactly —
 * 01 The Proposal, 02 The Two-Week Plan, 03 Community Support — so a proposal
 * sent from this page arrives in the shape the Council already reviews. The
 * printable PDF of the same template is at /docs/initiative-proposal-template.pdf.
 *
 * The page has no server: on submit it composes the proposal as plain text and
 * hands it to the sender's mail app, addressed to the Council. Nothing is sent
 * to any third-party form service.
 */
export type Field = {
  id: string;
  label: string;
  hint?: string;
  type: 'text' | 'email' | 'date' | 'textarea';
  required?: boolean;
  rows?: number;
  half?: boolean;
};
export type FormSection = {
  part: string;
  heading: string;
  blurb?: string;
  fields: Field[];
  supporters?: boolean;
};

export const formSections: FormSection[] = [
  {
    part: '01 / The proposal',
    heading: 'Your initiative',
    blurb: 'Keep responses concise; attach extra detail if needed.',
    fields: [
      { id: 'title', label: 'Initiative title', type: 'text', required: true },
      { id: 'your_name', label: 'Your name', type: 'text', required: true, half: true },
      { id: 'contact', label: 'Email / contact', type: 'email', required: true, half: true },
      { id: 'timeline', label: 'Proposed date or timeline', type: 'text', required: true },
      {
        id: 'summary',
        label: 'Summary of the idea',
        hint: 'In 2–4 sentences, describe the initiative and what it aims to achieve.',
        type: 'textarea',
        rows: 4,
        required: true,
      },
      {
        id: 'purpose',
        label: 'Purpose & impact',
        hint: 'Who will benefit? What need does it address, or what experience does it create?',
        type: 'textarea',
        rows: 4,
        required: true,
      },
      {
        id: 'resources',
        label: 'Resources & support needed',
        hint: 'Include estimated budget and currency, spaces, materials, and support needed from the Council.',
        type: 'textarea',
        rows: 4,
        required: true,
      },
      {
        id: 'team',
        label: 'Organising team / collaborators',
        hint: 'List names and responsibilities, if applicable.',
        type: 'textarea',
        rows: 3,
      },
    ],
  },
  {
    part: '02 / The two-week plan',
    heading: 'From idea to delivery',
    blurb: 'Define what success looks like and how you will get there.',
    fields: [
      { id: 'plan_start', label: 'Plan start date', type: 'date', half: true },
      { id: 'plan_end', label: 'Plan end date', type: 'date', half: true },
      {
        id: 'objectives',
        label: 'Objectives',
        hint: 'Set 2–3 concrete goals. Include the intended audience and a measure of success.',
        type: 'textarea',
        rows: 4,
        required: true,
      },
      {
        id: 'week1',
        label: 'Week 1 — preparation, outreach, logistics',
        hint: 'Actions or deliverables, who is responsible, and when.',
        type: 'textarea',
        rows: 4,
      },
      {
        id: 'week2',
        label: 'Week 2 — execution, delivery, follow-through',
        hint: 'Actions or deliverables, who is responsible, and when.',
        type: 'textarea',
        rows: 4,
      },
      {
        id: 'blockers',
        label: 'Dependencies / potential blockers',
        type: 'textarea',
        rows: 3,
      },
      {
        id: 'values',
        label: 'Values & vision',
        hint: 'What should participants take away, how does it enrich MIM’28, and how will you know it worked?',
        type: 'textarea',
        rows: 4,
        required: true,
      },
    ],
  },
  {
    part: '03 / Community support',
    heading: 'People behind the idea',
    blurb:
      'List ten supporters willing to be named. They may be classmates, teachers or community members — they affirm the idea is relevant and worthwhile, and do not need to volunteer their time. They may be asked to confirm their interest.',
    fields: [],
    supporters: true,
  },
];

/** The checklist from the template's "Before submitting" box. */
export const checklist = [
  'Proposal details and resource needs are complete.',
  'Two-week plan includes objectives, actions, owners and values / vision.',
  'Ten supporters are listed and have agreed to be named.',
];
