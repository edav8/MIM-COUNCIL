/**
 * The four pillars at the top of the site: Academic, Student Life, Careers, Well Being.
 *
 * EDIT THIS FILE to change what appears up there. Each item either has an `href`
 * (and becomes a link) or has none (and renders greyed out with "coming soon"),
 * so the structure can go live before every page behind it exists.
 *
 *   href: '/...'  a page on this site
 *   href: 'https://...'  opens in a new tab
 *   note: optional second line
 *
 * Nothing here invents a URL. An item without an href is one nobody has given us
 * a link for yet — fill it in and push, and it goes live on the next build.
 */
export type PillarItem = { label: string; href?: string; note?: string };
/**
 * `accent` and `tint` colour-code the pillar. Both are taken from the Student
 * Life Town Hall deck of 30 Oct 2026, read out of the slides themselves:
 * deep green #133b34, brand green #00684b, orange #f28b32 and pale green
 * #e6f2e7 are the colours that deck is actually built from.
 */
export type Pillar = { title: string; items: PillarItem[]; accent: string; tint: string };

export const pillars: Pillar[] = [
  {
    title: 'Academic',
    accent: '#00684b',
    tint: '#e6f2e7',
    items: [
      { label: 'Reflection Survey' },
      { label: 'MIM2MIM Tutoring', href: '/tutoring/', note: 'Offer it, receive it, or both' },
      { label: 'MIM' },
      { label: 'Course Hub', href: 'https://edav8.github.io/MIM28/' },
    ],
  },
  {
    title: 'Student Life',
    accent: '#f28b32',
    tint: '#fdeede',
    items: [
      {
        label: 'Ski Trip',
        href: 'https://edav8.github.io/insead-ski-trip/',
        note: 'Les Ménuires, from 4 Jan',
      },
      { label: "What's on", href: '/student-life/', note: 'Every event, month by month' },
      { label: 'Propose an initiative', href: '/initiatives/', note: 'What to include, and how we decide' },
    ],
  },
  {
    title: 'Careers',
    accent: '#133b34',
    tint: '#e4ebe8',
    items: [
      { label: 'Careers calendar', href: '/careers/', note: 'CDC sessions, employer visits, club offers' },
      { label: 'Raza Consulting Club — MIM offer' },
      { label: 'Open Door Hours', note: 'Daniel and Kimi' },
    ],
  },
  {
    title: 'Well Being',
    accent: '#087357',
    tint: '#e6f2e7',
    items: [
      {
        label: 'Guidelines on Harassment',
        note: 'Who to contact at INSEAD and on the Council',
      },
      { label: 'Nominate a MIM Contributor' },
    ],
  },
];
