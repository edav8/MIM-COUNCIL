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

const { upcoming, byMonth, pillarOf, pillarColours } = await import(join(root, 'lib/events.ts'));
const { council, initials, councilEmail } = await import(join(root, 'lib/council.ts'));
const { pillars } = await import(join(root, 'lib/sections.ts'));
const { sections: guideSections, budgetExample } = await import(
  join(root, 'lib/initiative-guide.ts')
);

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
${byMonth(cohort)
  .map(
    (m) => `  <div class="event-month">
    <h3 class="month-label">${e(m.label)}</h3>
    <ul class="event-list">
${m.events.map((ev) => eventRow(ev)).join('\n')}
    </ul>
  </div>`,
  )
  .join('\n')}
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
    <p class="reach-out">You can reach out to any of us directly, or write to the whole Council at
      <a href="mailto:${councilEmail}">${councilEmail}</a>.</p>
  </div>
  <ul class="council-roster">
${council
  .map(
    (p) => `    <li class="council-member">
      ${
        p.photo
          ? `<img class="council-avatar" src="${e(prefix + p.photo.replace(/^\//, ''))}" alt="" width="96" height="96" loading="lazy">`
          : `<span class="council-avatar council-initials" aria-hidden="true">${e(initials(p.name))}</span>`
      }
      <div class="council-text">
        <strong>${e(p.name)}</strong>
        <span class="council-role">${e(p.role)}</span>
        <span class="council-links">
          ${p.email ? `<a class="council-email" href="mailto:${e(p.email)}">${e(p.email)}</a>` : ''}
          ${p.linkedin ? `<a class="council-linkedin" href="${e(p.linkedin)}" target="_blank" rel="noreferrer">LinkedIn ${ARROW}</a>` : ''}
        </span>
      </div>
    </li>`,
  )
  .join('\n')}
  </ul>
</section>
${footer(prefix)}`;
}

function tutoringPage() {
  const prefix = '../';
  return `${head(
    'MIM2MIM Tutoring · The Salamanders',
    'Peer tutoring for the MIM’28 cohort — offer tutoring, receive it, or both.',
    prefix,
  )}
<main>
${header(prefix, 'tutoring')}
<section class="page-intro">
  <p class="eyebrow">ACADEMIC</p>
  <h1>MIM2MIM Tutoring</h1>
  <p class="page-tagline">By MIMs. For MIMs. From “huh?” to “aha.”</p>
  <p class="page-lede">
    Work through course concepts with a classmate. Offer tutoring, receive
    tutoring, or both — most people end up doing both, in different subjects.
  </p>
</section>
<section class="guide">
  <ol class="guide-list">
    <li class="guide-step">
      <h2>How it works</h2>
      <p>Say which subjects you can help with and which you would like help in. We match you with someone in the cohort and you arrange a time between you.</p>
      <ul>
        <li>One-to-one or small groups, whatever suits</li>
        <li>No commitment beyond the session you agree to</li>
        <li>Free — this is the cohort helping itself</li>
      </ul>
    </li>
    <li class="guide-step">
      <h2>Subjects so far</h2>
      <p>Started with the two courses people asked for most. If you want a subject that is not listed, say so and we will look for a tutor.</p>
      <ul>
        <li>Marketing</li>
        <li>Data Analysis</li>
      </ul>
    </li>
    <li class="guide-step">
      <h2>Every tutor earns a Contributor Badge</h2>
      <p>Tutoring counts. Time spent helping classmates is recognised through the MIM Contributor Badge.</p>
      <ul>
        <li>Offer a subject, run sessions, earn the badge</li>
      </ul>
    </li>
  </ol>
</section>
<section class="guide-next">
  <h2>Sign up</h2>
  <p>
    Sign up as a tutor, a tutee, or both, for the courses you want. The form is the
    one the Council sent to the cohort — if you filled it in already, you are on the list.
  </p>
  <p class="guide-contact">
    <a class="cta" href="https://insead.eu.qualtrics.com/jfe/form/SV_0UrZ496ElQXohb8" target="_blank" rel="noreferrer">Sign up for tutoring ${ARROW}</a>
  </p>
</section>
${footer(prefix)}`;
}

function initiativesPage() {
  const prefix = '../';
  return `${head(
    'Propose an initiative · The Salamanders',
    'How to propose a student initiative to the MIM’28 Student Council, and what your proposal should contain.',
    prefix,
  )}
<main>
${header(prefix, 'initiatives')}
<section class="page-intro">
  <p class="eyebrow">STUDENT LIFE</p>
  <h1>Propose an initiative</h1>
  <p class="page-lede">
    Got something you want to run for the cohort? The Council can support it, and
    sometimes fund it. This is what we need from you to be able to say yes.
  </p>
</section>
<section class="guide">
  <ol class="guide-list">
${guideSections
  .map(
    (sec) => `    <li class="guide-step">
      <h2>${e(sec.heading)}</h2>
      <p>${e(sec.blurb)}</p>
      <ul>
${sec.asks.map((a) => `        <li>${e(a)}</li>`).join('\n')}
      </ul>
    </li>`,
  )
  .join('\n')}
  </ol>
  <aside class="budget-example">
    <h2>The budget</h2>
    <p>${e(budgetExample.caption)}</p>
    <table>
      <tbody>
${budgetExample.rows
  .map(
    (r) => `        <tr><td>${e(r[0])}</td><td>${e(r[1])}</td><td>${e(r[2])}</td></tr>`,
  )
  .join('\n')}
        <tr class="budget-total"><td>${e(budgetExample.total[0])}</td><td>${e(budgetExample.total[1])}</td><td>${e(budgetExample.total[2])}</td></tr>
      </tbody>
    </table>
    <p class="budget-note">${e(budgetExample.note)}</p>
  </aside>
</section>
<section class="guide-next">
  <h2>What happens next</h2>
  <p>
    Send your proposal to the Council and we will come back to you. If the numbers
    need discussing we will ask to meet rather than simply decline — a proposal that
    is too expensive as written is often workable at a smaller scale.
  </p>
  <p class="guide-contact">
    <a class="cta" href="mailto:mim.council@insead.edu?subject=Initiative%20proposal">Send us your proposal</a>
  </p>
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
await mkdir(join(out, 'initiatives'), { recursive: true });
await writeFile(join(out, 'initiatives/index.html'), initiativesPage());
await mkdir(join(out, 'tutoring'), { recursive: true });
await writeFile(join(out, 'tutoring/index.html'), tutoringPage());
await writeFile(join(out, '.nojekyll'), '');
// Tells GitHub Pages which custom domain serves this site. Without it, Pages
// answers on edav8.github.io only and mim28.com gets a 404.
await writeFile(join(out, 'CNAME'), 'mim28.com\n');

console.log(`built dist-static/  (${upcoming('cohort').length} cohort events, ${council.length} council members)`);
