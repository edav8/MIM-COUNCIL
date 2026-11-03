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
export type Pillar = { title: string; items: PillarItem[] };

export const pillars: Pillar[] = [
  {
    title: 'Academic',
    items: [
      { label: 'Reflection Survey' },
      { label: 'M2M Tutoring', note: 'MIM-to-MIM peer tutoring' },
      { label: 'MIM' },
      { label: 'Course Hub', href: 'https://edav8.github.io/MIM28/' },
    ],
  },
  {
    title: 'Student Life',
    items: [
      {
        label: 'Ski Trip',
        href: 'https://edav8.github.io/insead-ski-trip/',
        note: 'Les Ménuires, from 4 Jan',
      },
      { label: "What's on", href: '#whats-on', note: 'All cohort events' },
      { label: 'New Initiative Form' },
    ],
  },
  {
    title: 'Careers',
    items: [
      { label: 'Calendar', href: '#whats-on', note: 'CareerGlobe, clubs and events' },
      { label: 'Raza Consulting Club — MIM offer' },
      { label: 'Open Door Hours', note: 'Daniel and Kimi' },
    ],
  },
  {
    title: 'Well Being',
    items: [
      {
        label: 'Guidelines on Harassment',
        note: 'Who to contact at INSEAD and on the Council',
      },
      { label: 'Nominate a MIM Contributor' },
    ],
  },
];
