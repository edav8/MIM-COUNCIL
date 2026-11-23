/**
 * Guidelines on Harassment — who to contact, and what INSEAD's own policy says.
 *
 * SOURCE: INSEAD Anti-Harassment Policy, version 5.0, effective 3 June 2025,
 * approved by the Dean (Office of Diversity & Inclusion), and the Student Life
 * "Policies" page on Canvas (course 9043). Read 23 Nov 2026.
 *
 * The Council does not write policy and cannot investigate. This page points
 * people at INSEAD's channels and quotes INSEAD's own words for the few lines
 * that matter most; everything else links to the policy itself. Quotes are kept
 * short and attributed, and the binding text is always one click away.
 *
 * Personal email addresses are deliberately left off: the site is public. The
 * campus Psychological Services inboxes are shared role addresses.
 */

export const links = {
  policy: 'https://secure.ethicspoint.eu/domain/media/en/gui/105643/harassment.pdf',
  openTalk: 'https://secure.ethicspoint.eu/domain/media/en/gui/105643/whistle.pdf',
  hotline: 'https://secure.ethicspoint.eu/domain/media/en/gui/105643/index.html',
  canvasPolicies: 'https://learn.insead.edu/courses/9043/pages/policies',
};

/** Verbatim from the policy, with the section each comes from. */
export const quotes = [
  {
    from: 'Policy Statement',
    text: 'INSEAD does not tolerate discrimination, bullying, violence, or harassment of any kind',
  },
  {
    from: 'Definitions',
    text: 'Harassment is unwelcome conduct that a reasonable person would consider intimidating, hostile, or abusive',
  },
  {
    from: 'Open Talk and No Retaliation',
    text: 'The institution strictly prohibits retaliation against anyone who reports harassment or participates in an investigation.',
  },
];

/** The forms the policy names. Our one-line paraphrase; the policy defines each. */
export const forms = [
  { name: 'Psychological harassment (bullying)', gist: 'Repeated behaviour that degrades someone’s study or working conditions: silencing, exclusion, ridicule, rumours, threats.' },
  { name: 'Sexual harassment', gist: 'Repeated comments or conduct with sexual connotations, or a single act of serious pressure aimed at obtaining a sexual act.' },
  { name: 'Sexual misconduct', gist: 'Unwelcome behaviour of a sexual nature without consent, or by intimidation, coercion, threat or force.' },
  { name: 'Cyber harassment', gist: 'Bullying, threats or intimidation online. Under French law a single post can be enough if it is public or shareable.' },
];

/** Where it applies, in the policy’s terms. */
export const scope =
  'On campus and on INSEAD business, and also off campus when it disrupts study or work at INSEAD, happens in INSEAD-affiliated activities or relationships formed through INSEAD, or creates a hostile environment for classmates. Parties and group chats are not outside it.';

/** Who to go to, in the order we would suggest. */
export const contacts = [
  {
    who: 'Report it, anonymously if you want',
    how: 'INSEAD’s Open Talk hotline, run by EthicsPoint. Online or by phone, and you can choose to stay anonymous.',
    href: links.hotline,
    cta: 'Open the hotline',
  },
  {
    who: 'Just want to talk it through?',
    how: 'Psychological Services offers confidential conversations, whether or not you want to raise a case.',
    email: 'AHPstudentcontact.FB@insead.edu',
    note: 'Fontainebleau. Singapore: AHPstudentcontact.SG@insead.edu',
  },
  {
    who: 'Student Life team',
    how: 'Katja Boytler (Fontainebleau) and Karen Ukil (Singapore). Their addresses are on the Student Life “Policies” page on Canvas.',
    href: links.canvasPolicies,
    cta: 'Policies on Canvas',
  },
  {
    who: 'The Council',
    how: 'Any of us will listen and help you find the right door. We cannot investigate or sanction, and we will not keep a list of names: that is INSEAD’s job, with a fair process for everyone involved.',
    team: true,
  },
];

export const emergency =
  'If anyone is in danger right now, call 112 (European emergency number) or 17 (police in France). Do not wait for a form.';
