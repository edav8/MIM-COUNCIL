/**
 * Build the static MIM'28 Council site for GitHub Pages.
 *
 *   node tools/build-static.mjs        -> writes dist-static/
 *
 * WHY THIS EXISTS. The original app is a Cloudflare Worker: it has server routes
 * (app/api/*) for the idea board, which GitHub Pages cannot run. Pages serves files
 * and executes nothing. The board was dropped, and what remains — the hero, the
 * cohort calendar, the council and the links — is entirely static, so it is rendered
 * to plain HTML here.
 *
 * WHAT YOU EDIT. Content lives in two files and nowhere else:
 *     lib/events.ts    the What's on calendar
 *     lib/council.ts   the eight council members
 * Change those, push, and the GitHub Action rebuilds and publishes. You should not
 * need to touch this file to change a date, a name or a link.
 *
 * The stylesheet is app/globals.css with its Tailwind directives stripped: the page
 * markup uses only custom classes, so the rest of the file is already plain CSS.
 */
import { mkdir, writeFile, readFile, cp, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist-static');

const { upcoming, pillarOf, pillarColours } = await import(join(root, 'lib/events.ts'));
const { council, initials } = await import(join(root, 'lib/council.ts'));
const { pillars } = await import(join(root, 'lib/sections.ts'));

/** Escape text for HTML. Content comes from our own data files, but never assume. */
const e = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const ARROW =
  '<svg class="arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';

const HUB = 'https://edav8.github.io/MIM28/';
const SKI = 'https://edav8.github.io/insead-ski-trip/';

function head(title, description, prefix) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(title)}</title>
<meta name="description" content="${e(description)}">
<link rel="icon" href="${prefix}favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="${prefix}apple-touch-icon.png">
<meta name="theme-color" content="#006848">
<link rel="stylesheet" href="${prefix}styles.css?v=${CSS_HASH}">
</head>
<body>`;
}

function header(prefix, active) {
  // Menus open on hover (CSS) and on keyboard focus (:focus-within). A button is
  // used rather than <details> because <details> cannot open on hover; the small
  // script below adds tap-to-open for touch devices, where hover does not exist.
  const menus = pillars
    .map(
      (p, i) => `      <div class="menu${i >= pillars.length - 2 ? ' menu-right' : ''}" style="--accent:${e(p.accent)};--tint:${e(p.tint)}">
        <button type="button" class="menu-trigger" aria-expanded="false">${e(p.title)}</button>
        <div class="menu-panel">
${p.items
  .map((it) => {
    const inner = `${e(it.label)}${it.note ? `<span class="menu-note">${e(it.note)}</span>` : ''}`;
    if (!it.href) return `          <span class="menu-soon">${inner}<em>coming soon</em></span>`;
    const ext = it.href.startsWith('http');
    const href = it.href.startsWith('#') ? `${prefix}${it.href}` : it.href;
    return `          <a href="${e(href)}"${ext ? ' target="_blank" rel="noreferrer"' : ''}>${inner}</a>`;
  })
  .join('\n')}
        </div>
      </div>`,
    )
    .join('\n');
  return `<header class="site-header">
  <a href="${prefix || './'}" class="wordmark">
    <img src="${prefix}brand/wordmark-transparent.png" alt="MIM’28 Student Council" width="577" height="320">
  </a>
  <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="site-nav">
    <span class="nav-toggle-bars" aria-hidden="true"></span>
    <span class="sr-only">Menu</span>
  </button>
  <nav class="site-nav" id="site-nav">
${menus}
      <a class="nav-plain" href="${prefix}team/"${active === 'team' ? ' aria-current="page"' : ''}>Meet the team</a>
  </nav>
</header>`;
}

const NAV_SCRIPT = `<script>
// Hover and keyboard focus are handled in CSS. This adds the two things CSS
// cannot do: tap-to-open on touch devices, and Escape to close.
(() => {
  const menus = [...document.querySelectorAll('.menu')];
  const close = (m) => { m.classList.remove('open'); m.querySelector('.menu-trigger').setAttribute('aria-expanded','false'); };
  for (const m of menus) {
    m.querySelector('.menu-trigger').addEventListener('click', (ev) => {
      ev.preventDefault();
      const wasOpen = m.classList.contains('open');
      menus.forEach(close);
      if (!wasOpen) { m.classList.add('open'); m.querySelector('.menu-trigger').setAttribute('aria-expanded','true'); }
    });
  }
  document.addEventListener('click', (ev) => {
    for (const m of menus) if (!m.contains(ev.target)) close(m);
  });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') menus.forEach(close); });

  // Small screens: the whole nav collapses behind one button.
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  if (toggle && header) {
    toggle.addEventListener('click', () => {
      const open = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(open));
      if (!open) menus.forEach(close);
    });
  }
})();
</script>`;

function footer(prefix) {
  return `<footer>
  <strong>We <u>listen.</u> We <u>serve.</u> We <u>execute.</u></strong>
  <a href="${prefix}team/" class="footer-team-link">Meet the team ${ARROW}</a>
  <nav class="footer-links">
    <a href="${HUB}" target="_blank" rel="noreferrer">Course Hub ${ARROW}</a>
    <a href="${SKI}" target="_blank" rel="noreferrer">Ski trip ${ARROW}</a>
  </nav>
</footer>
${NAV_SCRIPT}
</body>
</html>`;
}

function eventRow(ev, withCta = true) {
  const c = pillarColours[pillarOf(ev)];
  return `<li class="event-row" style="--accent:${c.accent};--tint:${c.tint}">
  <span class="event-when">${e(ev.when)}<span class="event-pillar">${e(c.label)}</span></span>
  <div class="event-body">
    <h3>${e(ev.title)}</h3>
    ${ev.where ? `<p class="event-where">${e(ev.where)}</p>` : ''}
    ${ev.note ? `<p class="event-note">${e(ev.note)}</p>` : ''}
  </div>
  ${
    withCta && ev.href
      ? `<a class="event-cta" href="${e(ev.href)}" target="_blank" rel="noreferrer">${e(ev.cta || 'Open')} ${ARROW}</a>`
      : ''
  }
</li>`;
}

function indexPage() {
  const cohort = upcoming('cohort');
  const careers = upcoming('careers');
  const prefix = '';
  return `${head(
    'The Salamanders · MIM’28',
    'The MIM’28 Student Council at INSEAD — what’s on, who we are, and how to reach us.',
    prefix,
  )}
<main>
${header(prefix, 'home')}
<section class="campaign-intro" aria-labelledby="campaign-title">
  <div class="campaign-copy">
    <h1 id="campaign-title">The Salamanders</h1>
    <p class="campaign-mission">We <em>listen</em> to your concerns and turn <em>your ideas</em> into action, bridging our cohort with Student Life to make the most of MIM’28.</p>
    <div class="first-day">
      <div class="first-day-heading"><h2>Our Approach</h2></div>
      <div class="first-day-steps"><img src="images/salamander-poster.png" alt="" width="2120" height="742">
      <ol>
        <li><strong><span>01</span> Survey</strong><p>Share your needs and ideas.</p></li>
        <li><strong><span>02</span> Collaborate</strong><p>Choose feasible ideas with key stakeholders.</p></li>
        <li><strong><span>03</span> Implement</strong><p>Work with students and partners to deliver.</p></li>
      </ol></div>
    </div>
  </div>
  <figure class="campaign-photo">
    <img src="images/team-september-2026-v2.jpg" alt="Members of the MIM’28 Student Council at the INSEAD sign in Fontainebleau" width="2000" height="982">
    <figcaption><span>The Salamanders</span><a href="team/">Meet the team ${ARROW}</a></figcaption>
  </figure>
</section>

<section class="whats-on" id="whats-on" aria-labelledby="whats-on-title">
  <div class="whats-on-heading">
    <p class="eyebrow">WHAT’S ON</p>
    <h2 id="whats-on-title">Next up for the cohort</h2>
    <p class="whats-on-intro">Everything coming up that everyone can join. Dates move — where something is not yet confirmed, it says so.</p>
  </div>
  <ul class="event-list">
${cohort.map((ev) => eventRow(ev)).join('\n')}
  </ul>
${
  careers.length
    ? `  <div class="event-careers">
    <p class="eyebrow">CAREERS &amp; CDC</p>
    <ul class="event-list">
${careers.map((ev) => eventRow(ev, false)).join('\n')}
    </ul>
  </div>`
    : ''
}
</section>
${footer(prefix)}`;
}

function teamPage() {
  const prefix = '../';
  return `${head(
    'Meet the team · The Salamanders',
    'The eight members of the MIM’28 Student Council at INSEAD.',
    prefix,
  )}
<main class="team-page">
${header(prefix, 'team')}
<section class="team-page-intro" aria-labelledby="team-page-title">
  <div>
    <p class="eyebrow">THE SALAMANDERS</p>
    <h1 id="team-page-title">Meet our team</h1>
  </div>
  <figure class="team-page-photo">
    <img src="../images/team-september-2026-v2.jpg" alt="Members of the MIM’28 Student Council at the INSEAD sign in Fontainebleau" width="2000" height="982">
    <figcaption>The Salamanders · MIM’28</figcaption>
  </figure>
</section>
<section class="about-team team-page-details" id="team">
  <div>
    <p class="eyebrow">THE SALAMANDERS · YOUR MIM’28 STUDENT COUNCIL</p>
    <h2>A MIM community where everyone belongs and has the opportunity to contribute.</h2>
    <p><strong>Our VALUE</strong> — We listen, collaborate with your representatives and help turn your ideas into action.</p>
  </div>
  <ul class="council-roster">
${council
  .map(
    (p) => `    <li class="council-member">
      ${
        p.photo
          ? `<img class="council-avatar" src="${e(p.photo)}" alt="" width="96" height="96">`
          : `<span class="council-avatar council-initials" aria-hidden="true">${e(initials(p.name))}</span>`
      }
      <div class="council-text">
        <strong>${e(p.name)}</strong>
        <span class="council-role">${e(p.role)}</span>
        ${p.email ? `<a class="council-email" href="mailto:${e(p.email)}">${e(p.email)}</a>` : ''}
      </div>
    </li>`,
  )
  .join('\n')}
  </ul>
</section>
${footer(prefix)}`;
}

/** app/globals.css minus the Tailwind directives: everything from the first @font-face. */
async function stylesheet() {
  const css = await readFile(join(root, 'app/globals.css'), 'utf8');
  const start = css.indexOf('@font-face');
  if (start === -1) throw new Error('globals.css: no @font-face found — layout would break');
  return (
    `/* Generated by tools/build-static.mjs from app/globals.css. Do not edit. */\n` +
    css.slice(start).replace(/url\('\/fonts\//g, "url('fonts/") +
    `\n.arrow{display:inline-block;vertical-align:-2px}\n`
  );
}

const CSS = await stylesheet();
// A content hash in the stylesheet URL: without it, browsers keep serving a
// cached stylesheet after a deploy and the new layout silently does not apply.
const CSS_HASH = createHash('sha256').update(CSS).digest('hex').slice(0, 8);

await rm(out, { recursive: true, force: true });
await mkdir(join(out, 'team'), { recursive: true });
await cp(join(root, 'public'), out, { recursive: true });
await writeFile(join(out, 'styles.css'), CSS);
await writeFile(join(out, 'index.html'), indexPage());
await writeFile(join(out, 'team/index.html'), teamPage());
await writeFile(join(out, '.nojekyll'), '');
// Tells GitHub Pages which custom domain serves this site. Without it, Pages
// answers on edav8.github.io only and mim28.com gets a 404.
await writeFile(join(out, 'CNAME'), 'mim28.com\n');

console.log(`built dist-static/  (${upcoming('cohort').length} cohort events, ${council.length} council members)`);
