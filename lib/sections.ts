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
        label: 'Contributor Badge',
        href: '/contributor-badge/',
        note: 'What it recognises, and how to earn one',
      },
      {
        label: 'Guidelines on Harassment',
        href: '/harassment/',
        note: 'Who to contact at INSEAD and on the Council',
      },
    ],
  },
  {
    // Its own menu: proposing something and raising a concern are about the
    // Council listening, not about well-being or events. Both go straight to the form.
    title: 'Your Voice',
    accent: '#1E5E46',
    tint: '#E6F2EC',
    items: [
      { label: 'Propose an initiative', href: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=wPeN2eeJ-Ea3q3L-H22CH5-iuYN6LoxFhjmub00HN9dUQ0VNMlM2WkFUNVo5SFNMWDZMRk5ER1VTSC4u', note: 'Got an idea? The Council’s proposal form' },
      { label: 'Concern Drop Box', href: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=wPeN2eeJ-Ea3q3L-H22CH5-iuYN6LoxFhjmub00HN9dUMkhFSDg0TTBQVU5EWURaU1lWN0xJS1IxQy4u', note: 'Something not working? Anonymous, read weekly' },
    ],
  },
];
