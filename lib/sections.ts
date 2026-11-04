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
 * `accent` and `tint` are the category colours from The Salamanders brand
 * guide: Academic blue, Student Life (Community) orange, Careers yellow and
 * Well Being pink. The accent is the guide's text shade; the tint is a pale
 * version of its chip fill.
 */
export type Pillar = { title: string; items: PillarItem[]; accent: string; tint: string };

export const pillars: Pillar[] = [
  {
    title: 'Academic',
    accent: '#429EC5',
    tint: '#E9F6FD',
    items: [
      { label: 'Reflection Survey' },
      { label: 'MIM2MIM Tutoring', href: '/tutoring/', note: 'Offer it, receive it, or both' },
      { label: 'MIM' },
      { label: 'Course Hub', href: 'https://edav8.github.io/MIM28/' },
    ],
  },
  {
    title: 'Student Life',
    accent: '#E07927',
    tint: '#FDEEDE',
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
    accent: '#B49400',
    tint: '#FFF8DA',
    items: [
      { label: 'Careers calendar', href: '/careers/', note: 'CDC sessions, employer visits, club offers' },
      { label: 'Raza Consulting Club — MIM offer' },
      { label: 'Open Door Hours', note: 'Daniel and Kimi' },
    ],
  },
  {
    title: 'Well Being',
    accent: '#CF7185',
    tint: '#FDEEEF',
    items: [
      {
        label: 'Concern Drop Box',
        href: '/concerns/',
        note: 'Tell us quietly — checked weekly',
      },
      {
        label: 'Contributor Badge',
        href: '/contributor-badge/',
        note: 'What it recognises, and how to earn one',
      },
      {
        label: 'Guidelines on Harassment',
        note: 'Who to contact at INSEAD and on the Council',
      },
      {
        label: 'MIM of the Week',
        href: '/mim-of-the-week/',
        note: 'Nominate someone, or vote',
      },
    ],
  },
];
