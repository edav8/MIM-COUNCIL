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
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist-static');

const { upcoming, byMonth, withinDays, nextDate, pillarOf, pillarColours } = await import(join(root, 'lib/events.ts'));

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * The date line for an event.
 *
 * A repeating event must never print a hand-written date: the rugby rows said
 * "Thu 5 Nov" two days after that session had happened. For those, the date is
 * computed from the recurrence and only the time is taken from `when`.
 */
function whenLabel(ev) {
  if (!ev.repeat) return ev.when;
  const iso = nextDate(ev);
  if (!iso) return ev.when;
  const d = new Date(`${iso}T12:00:00Z`);
  const date = `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
  const time = ev.when.includes('·') ? ev.when.split('·').slice(1).join('·').trim() : '';
  return time ? `${date} · ${time}` : date;
}
const { council, initials, councilEmail } = await import(join(root, 'lib/council.ts'));
const { pillars } = await import(join(root, 'lib/sections.ts'));
const { sections: guideSections, budgetExample } = await import(
  join(root, 'lib/initiative-guide.ts')
);
const { formSections, checklist } = await import(join(root, 'lib/initiative-form.ts'));
const {
  current: mimOfWeek,
  past: pastWinners,
  forms: motwForms,
  howItWorks: motwRules,
  initialsOf,
} = await import(join(root, 'lib/mim-of-the-week.ts'));
const { heroImage, heroActions } = await import(join(root, 'lib/hero.ts'));
const badge = await import(join(root, 'lib/contributor-badge.ts'));
const concerns = await import(join(root, 'lib/concerns.ts'));
const { birthdayPhotos } = await import(join(root, 'lib/birthday-photos.ts'));

/**
 * Today's birthdays. The list is gitignored, because this repo is public and a
 * hundred classmates' birthdays are not ours to publish — only the names whose
 * birthday is today reach the generated HTML. No file, no bar, no error.
 */
const birthdayWindow = (() => {
  const file = join(root, 'lib/birthdays.json');
  if (!existsSync(file)) return [];
  try {
    // Embed a THREE-DAY window, not the whole list and not just today.
    //
    // Whole list: this repo is public and the page is public — 180 birthdays
    // are not ours to publish.
    // Just today: GitHub's scheduler runs hours late (observed 12:54 and 13:04
    // UTC against a 05:10 cron), so a page built yesterday would greet the
    // wrong person all morning.
    //
    // Three days is enough for the browser to pick the right one even if the
    // build is two days stale, and exposes a couple of names rather than 180.
    const now = new Date();
    const days = [0, 1, 2].map((n) => {
      const d = new Date(now.getTime() + n * 86400000);
      return { d: d.getUTCDate(), m: d.getUTCMonth() + 1 };
    });
    return JSON.parse(readFileSync(file, 'utf8'))
      .filter((p) => days.some((x) => x.d === p.day && x.m === p.month))
      .map((p) => {
        const photo = birthdayPhotos[p.name];
        return photo
          ? { n: p.name, d: p.day, m: p.month, p: photo.replace(/^\//, '') }
          : { n: p.name, d: p.day, m: p.month };
      });
  } catch {
    return [];
  }
})();

/** Names as a sentence: "A", "A and B", "A, B and C". */
function nameList(names) {
  if (names.length <= 1) return names[0] || '';
  return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
}

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
</header>${
    birthdayWindow.length
      ? `
<div class="birthday-bar" id="birthday-bar" hidden role="note">
  <img id="birthday-photo" class="birthday-photo" alt="" hidden width="160" height="160">
  <span class="cake" aria-hidden="true">🎂</span>
  <span id="birthday-names"></span>
</div>
<script type="application/json" id="birthday-data">${JSON.stringify(birthdayWindow)}</script>`
      : ''
  }`;
}

const BIRTHDAY_SCRIPT = `<script>
// Pick today's birthdays in the browser rather than at build time. GitHub's
// scheduler runs hours late, so a page built yesterday must still greet the
// right person today.
(() => {
  const data = document.getElementById('birthday-data');
  const bar = document.getElementById('birthday-bar');
  if (!data || !bar) return;
  let list = [];
  try { list = JSON.parse(data.textContent); } catch { return; }
  const now = new Date();
  const today = list.filter((p) => p.d === now.getDate() && p.m === now.getMonth() + 1);
  if (!today.length) return;
  const names = today.map((p) => p.n);
  const sentence = names.length === 1
    ? names[0]
    : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
  document.getElementById('birthday-names').textContent = 'Happy birthday ' + sentence + '!';

  // A photo, only for the people who have one listed in lib/birthday-photos.ts.
  const withPhoto = today.find((p) => p.p);
  if (withPhoto) {
    const img = document.getElementById('birthday-photo');
    // No regex here: escaping one through this template literal silently
    // produced /^/+|/+$/g, a syntax error that killed the whole script and
    // took the greeting down with it.
    const depth = location.pathname
      .split('/')
      .filter((part) => part.length > 0 && !part.includes('.')).length;
    img.src = '../'.repeat(depth) + withPhoto.p;
    img.hidden = false;
  }
  bar.hidden = false;

  // Fireworks. Three bursts, then it stops — a page that keeps exploding all day
  // is a page people close. Skipped entirely for anyone who asked for less motion.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colours = ['#E07927', '#429EC5', '#B49400', '#CF7185', '#00684B'];
  const burst = (x, y) => {
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('span');
      s.className = 'spark';
      const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.3;
      const dist = 34 + Math.random() * 46;
      s.style.left = x + '%';
      s.style.top = y + 'px';
      s.style.background = colours[i % colours.length];
      s.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      s.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      s.style.animationDelay = Math.random() * 0.12 + 's';
      bar.appendChild(s);
      setTimeout(() => s.remove(), 1400);
    }
  };
  const fire = (n) => {
    if (n <= 0) return;
    burst(14 + Math.random() * 16, 10 + Math.random() * 14);
    burst(70 + Math.random() * 16, 10 + Math.random() * 14);
    setTimeout(() => fire(n - 1), 900);
  };
  setTimeout(() => fire(3), 350);
})();
</script>`;

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
${NAV_SCRIPT}${BIRTHDAY_SCRIPT}
</body>
</html>`;
}

function eventRow(ev, withCta = true) {
  const c = pillarColours[pillarOf(ev)];
  return `<li class="event-row" style="--accent:${c.accent};--tint:${c.tint}">
  <span class="event-when">${e(whenLabel(ev))}</span>
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

/** A slim strip under the nav: everything on in the next seven days. */
function weekBar(prefix) {
  // The nearest event is already shown large in the hero, so leave it out here
  // rather than printing the same thing twice on one screen.
  const [featured] = upcoming('cohort');
  const week = withinDays('cohort', 7).filter((ev) => ev !== featured);
  if (!week.length) return '';
  return `<div class="weekbar">
  <span class="weekbar-label">Also this week</span>
  <ul>
${week
  .map((ev) => {
    const c = pillarColours[pillarOf(ev)];
    const short = whenLabel(ev).split('·')[0].trim();
    const inner = `<span class="weekbar-dot" style="background:${c.accent}" aria-hidden="true"></span>${e(short)} — ${e(ev.title)}`;
    return ev.href
      ? `    <li><a href="${e(ev.href)}" target="_blank" rel="noreferrer">${inner}</a></li>`
      : `    <li><a href="${prefix}student-life/">${inner}</a></li>`;
  })
  .join('\n')}
  </ul>
</div>`;
}

/**
 * The nearest event, shown large beside the hero copy.
 *
 * Weekly fixtures are skipped: rugby training is always within a few days, so
 * featuring it would keep Diwali and the festivals out of the hero for weeks.
 * They still appear in the lists below, where a recurring session belongs.
 */
function featuredEvent(prefix) {
  const next = upcoming('cohort').find((e) => !e.repeat) ?? upcoming('cohort')[0];
  if (!next) return '';
  const c = pillarColours[pillarOf(next)];
  return `<aside class="featured" style="--accent:${c.accent};--tint:${c.tint}">
    <p class="featured-eyebrow">Next up</p>
    <p class="featured-when">${e(whenLabel(next))}</p>
    <h2 class="featured-title">${e(next.title)}</h2>
    ${next.where ? `<p class="featured-where">${e(next.where)}</p>` : ''}
    ${next.note ? `<p class="featured-note">${e(next.note)}</p>` : ''}
    ${
      next.href
        ? `<a class="featured-cta" href="${e(next.href)}" target="_blank" rel="noreferrer">${e(next.cta || 'More')} ${ARROW}</a>`
        : `<a class="featured-cta" href="${prefix}student-life/">See what's on ${ARROW}</a>`
    }
  </aside>`;
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
<section class="hero-split${heroImage ? ' hero-photo' : ''}" aria-labelledby="campaign-title">
  ${
    heroImage
      ? `<img class="hero-bg" src="${e(prefix + heroImage.src.replace(/^\//, ''))}" alt="${e(heroImage.alt)}">`
      : ''
  }
  <div class="hero-copy">
    <h1 id="campaign-title">The Salamanders</h1>
    <p class="campaign-mission">We <em>listen</em> to your concerns and turn <em>your ideas</em> into action, bridging our cohort with Student Life to make the most of MIM’28.</p>
    <div class="hero-actions">
${heroActions
  .map(
    (a) => `      <a class="cta${a.primary ? '' : ' cta-ghost'}" href="${a.href.startsWith('http') ? e(a.href) : prefix + a.href.replace(/^\//, '')}">${e(a.label)}</a>`,
  )
  .join('\n')}
    </div>
  </div>
${featuredEvent(prefix)}
</section>


<section class="whats-on" id="whats-on" aria-labelledby="whats-on-title">
  <div class="whats-on-heading">
    <p class="eyebrow">WHAT’S ON</p>
    <h2 id="whats-on-title">Coming up</h2>
  </div>
  <ul class="event-list">
${upcoming('cohort')
  .slice(1, 5)
  .map((ev) => eventRow(ev))
  .join('\n')}
  </ul>
  <p class="whats-on-more">
    <a href="${prefix}student-life/">See everything, month by month ${ARROW}</a>
  </p>
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

function studentLifePage() {
  const prefix = '../';
  const cohort = upcoming('cohort');
  return `${head(
    'Student Life · The Salamanders',
    'Everything on for the MIM’28 cohort — events, sport and socials, month by month.',
    prefix,
  )}
<main>
${header(prefix, 'student-life')}
<section class="page-intro" style="--accent:${pillarColours['student-life'].accent}">
  <p class="eyebrow">STUDENT LIFE</p>
  <h1>What’s on</h1>
  <p class="page-lede">
    Everything coming up that the whole cohort can join — council events, sport and
    the weekly socials. Where something is not yet confirmed, it says so rather than
    showing a date you might plan around.
  </p>
</section>
<section class="whats-on whats-on-full">
${byMonth(cohort)
  .map(
    (m) => `  <div class="event-month">
    <h2 class="month-label">${e(m.label)}</h2>
    <ul class="event-list">
${m.events.map((ev) => eventRow(ev)).join('\n')}
    </ul>
  </div>`,
  )
  .join('\n')}
</section>
<section class="guide-next">
  <h2>Running something?</h2>
  <p>
    If you want to put on an event for the cohort, the Council can help and sometimes
    fund it. Tell us what it is and what it needs.
  </p>
  <p class="guide-contact">
    <a class="cta" href="${prefix}initiatives/">Propose an initiative ${ARROW}</a>
  </p>
</section>
${footer(prefix)}
`;
}

function contributorBadgePage() {
  const prefix = '../';
  return `${head(
    'MIM Contributor Badge · The Salamanders',
    'What the Contributor Badge recognises, how to earn one, and how to nominate someone.',
    prefix,
  )}
<main>
${header(prefix, 'wellbeing')}
<section class="page-intro" style="--accent:${pillarColours['wellbeing'].accent}">
  <p class="eyebrow">WELL BEING</p>
  <h1>MIM Contributor Badge</h1>
  <p class="page-lede">${e(badge.intro)}</p>
</section>
<section class="guide">
  <ol class="guide-list">
${badge.waysToEarn
  .map(
    (w) => `    <li class="guide-step">
      <h2>${e(w.title)}</h2>
      <p>${e(w.detail)}</p>
      ${w.href ? `<p><a class="inline-link" href="${prefix}${w.href.replace(/^\//, '')}">More ${ARROW}</a></p>` : ''}
    </li>`,
  )
  .join('\n')}
  </ol>
</section>
<section class="guide-next">
  <div class="two-up">
    <div>
      <h2>The checklist</h2>
      <p class="caption-line">A nomination should tick all of these.</p>
      <ul class="tick-list">
${badge.checklist.map((c) => `        <li>${e(c)}</li>`).join('\n')}
      </ul>
    </div>
    <div>
      <h2>How it works</h2>
      <ol class="step-list">
${badge.process.map((c) => `        <li>${e(c)}</li>`).join('\n')}
      </ol>
    </div>
  </div>
  <p class="guide-contact">
    ${
      badge.nominateForm
        ? `<a class="cta" href="${e(badge.nominateForm)}" target="_blank" rel="noreferrer">Nominate someone ${ARROW}</a>`
        : `<a class="cta" href="${prefix}mim-of-the-week/">Nominate someone ${ARROW}</a>`
    }
  </p>
</section>
${footer(prefix)}`;
}

function concernsPage() {
  const prefix = '../';
  return `${head(
    'Concern Drop Box · The Salamanders',
    'Tell the MIM’28 Student Council something that is not working. Checked every week.',
    prefix,
  )}
<main>
${header(prefix, 'wellbeing')}
<section class="page-intro" style="--accent:${pillarColours['wellbeing'].accent}">
  <p class="eyebrow">WELL BEING</p>
  <h1>Concern Drop Box</h1>
  <p class="page-lede">
    Something about cohort life not working? Tell us. You do not have to raise it
    in a group chat, and you do not have to put your name to it.
  </p>
</section>
<section class="promise-band">
  <div>
    <h2>Who reads it</h2>
    <p>${e(concerns.promise.whoReads)}</p>
  </div>
  <div>
    <h2>How often</h2>
    <p>${e(concerns.promise.howOften)}</p>
  </div>
  <div>
    <h2>Anonymous?</h2>
    <p>${e(concerns.promise.anonymous)}</p>
  </div>
</section>
<section class="guide">
  <ol class="guide-list">
    <li class="guide-step">
      <h2>Good to send us</h2>
      <ul>
${concerns.goodFor.map((g) => `        <li>${e(g)}</li>`).join('\n')}
      </ul>
    </li>
${concerns.escalate
  .map(
    (x) => `    <li class="guide-step escalate">
      <h2>${e(x.what)}</h2>
      <p>${e(x.who)}</p>
    </li>`,
  )
  .join('\n')}
  </ol>
</section>
<section class="guide-next">
  ${
    concerns.form
      ? `<div class="motw-form"><iframe class="form-embed" src="${e(concerns.form)}" title="Concern drop box" loading="lazy"></iframe></div>`
      : `<div class="signup-band">
    <h2>The box is being set up</h2>
    <p>
      The form is not live yet. In the meantime write to
      <a href="mailto:${councilEmail}">${councilEmail}</a>, or speak to any of us —
      <a href="${prefix}team/">we are all here</a>.
    </p>
  </div>`
  }
</section>
${footer(prefix)}`;
}

function mimOfWeekPage() {
  const prefix = '../';
  const embed = (url, title) =>
    `<iframe class="form-embed" src="${e(url)}" title="${e(title)}" loading="lazy"></iframe>`;
  return `${head(
    'MIM of the Week · The Salamanders',
    'Nominate a classmate who made the week better, and vote on this week’s shortlist.',
    prefix,
  )}
<main>
${header(prefix, 'wellbeing')}
<section class="page-intro" style="--accent:${pillarColours['wellbeing'].accent}">
  <p class="eyebrow">WELL BEING</p>
  <h1>MIM of the Week</h1>
  <p class="page-lede">
    Someone helped you through a problem set, covered for you, or organised
    something nobody asked them to. Put their name forward.
  </p>
</section>
${
  mimOfWeek
    ? `<section class="motw" aria-label="This week">
  <div class="motw-card">
    ${
      mimOfWeek.photo
        ? `<img class="motw-avatar" src="${e(prefix + mimOfWeek.photo.replace(/^\//, ''))}" alt="" width="128" height="128">`
        : `<span class="motw-avatar motw-initials" aria-hidden="true">${e(initialsOf(mimOfWeek.name))}</span>`
    }
    <div class="motw-text">
      <p class="eyebrow">${e(mimOfWeek.week)}</p>
      <h2>${e(mimOfWeek.name)}</h2>
      <p class="motw-why">${e(mimOfWeek.why)}</p>
      ${mimOfWeek.nominatedBy ? `<p class="motw-by">Nominated by ${e(mimOfWeek.nominatedBy)}</p>` : ''}
    </div>
  </div>
</section>`
    : ''
}
<section class="guide">
  <ol class="guide-list motw-rules">
    <li class="guide-step">
      <h2>How it works</h2>
      <ul>
${motwRules.map((r) => `        <li>${e(r)}</li>`).join('\n')}
      </ul>
    </li>
  </ol>
</section>
<section class="motw-forms">
  <div class="motw-form">
    <h2>Nominate someone</h2>
    ${
      motwForms.nominate
        ? embed(motwForms.nominate, 'Nominate someone for MIM of the Week')
        : '<p class="form-soon">Nominations open shortly — the form is being set up.</p>'
    }
  </div>
  <div class="motw-form">
    <h2>Vote</h2>
    ${
      motwForms.vote
        ? embed(motwForms.vote, 'Vote for MIM of the Week')
        : '<p class="form-soon">Voting opens Monday, on the shortlist from this week\u2019s nominations.</p>'
    }
  </div>
</section>
${
  pastWinners.length
    ? `<section class="guide-next">
  <h2>Previously</h2>
  <ul class="motw-past">
${pastWinners
  .map(
    (w) => `    <li><strong>${e(w.name)}</strong> <span>${e(w.week)}</span><p>${e(w.why)}</p></li>`,
  )
  .join('\n')}
  </ul>
</section>`
    : ''
}
${footer(prefix)}`;
}

function careersPage() {
  const prefix = '../';
  const careers = upcoming('careers');
  return `${head(
    'Careers · The Salamanders',
    'Careers events for the MIM’28 cohort — CDC sessions, employer visits and club offers.',
    prefix,
  )}
<main>
${header(prefix, 'careers')}
<section class="page-intro" style="--accent:${pillarColours['careers'].accent}">
  <p class="eyebrow">CAREERS</p>
  <h1>Careers calendar</h1>
  <p class="page-lede">
    CDC sessions, employer visits and club offers. Registration usually runs
    through CareerGlobe — check there for anything that needs a place booked.
  </p>
</section>
<section class="whats-on whats-on-full">
${
  careers.length
    ? byMonth(careers)
        .map(
          (m) => `  <div class="event-month">
    <h2 class="month-label">${e(m.label)}</h2>
    <ul class="event-list">
${m.events.map((ev) => eventRow(ev)).join('\n')}
    </ul>
  </div>`,
        )
        .join('\n')
    : '  <p class="empty-note">Nothing scheduled right now. Check CareerGlobe for live postings.</p>'
}
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
<section class="page-intro" style="--accent:${pillarColours['academic'].accent}">
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
      <h2>Subjects</h2>
      <p>This period’s courses. If you want a subject that is not listed, say so on the form and we will look for a tutor.</p>
      <ul>
        <li>Data Science — ML &amp; Optimization</li>
        <li>Applied Microeconomics</li>
        <li>Principles of Finance &amp; Valuation</li>
        <li>Negotiations</li>
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
  <div class="signup-band">
    <h2>Sign up</h2>
    <p>
      Sign up as a tutor, a tutee, or both, for the courses you want. The form is the
      one the Council sent to the cohort — if you filled it in already, you are on the list.
    </p>
    <p class="guide-contact">
      <a class="cta" href="https://insead.eu.qualtrics.com/jfe/form/SV_0UrZ496ElQXohb8" target="_blank" rel="noreferrer">Sign up for tutoring ${ARROW}</a>
    </p>
  </div>
</section>
${footer(prefix)}`;
}

function formField(f) {
  const req = f.required ? ' required' : '';
  const hint = f.hint ? `<span class="field-hint">${e(f.hint)}</span>` : '';
  const control =
    f.type === 'textarea'
      ? `<textarea id="${f.id}" name="${f.id}" rows="${f.rows || 3}"${req}></textarea>`
      : `<input id="${f.id}" name="${f.id}" type="${f.type}"${req}>`;
  return `        <div class="field${f.half ? ' field-half' : ''}">
          <label for="${f.id}">${e(f.label)}${f.required ? '<abbr title="required">*</abbr>' : ''}</label>
          ${hint}
          ${control}
        </div>`;
}

/** Ten supporter rows: full name, email, section or role. */
function supporterRows() {
  let out = '        <div class="supporters">';
  for (let i = 1; i <= 10; i++) {
    const n = String(i).padStart(2, '0');
    out += `
          <div class="supporter-row">
            <span class="supporter-n" aria-hidden="true">${n}</span>
            <input type="text" name="sup_name_${n}" aria-label="Supporter ${n} full name" placeholder="Full name">
            <input type="email" name="sup_email_${n}" aria-label="Supporter ${n} email" placeholder="Email address">
            <input type="text" name="sup_role_${n}" aria-label="Supporter ${n} section or role" placeholder="Section / role">
          </div>`;
  }
  return out + '\n        </div>';
}

function initiativesPage() {
  const prefix = '../';
  return `${head(
    'Propose an initiative · The Salamanders',
    'How to propose a student initiative to the MIM’28 Student Council, and what your proposal should contain.',
    prefix,
  )}
<main class="form-page">
${header(prefix, 'initiatives')}
<section class="page-intro" style="--accent:${pillarColours['student-life'].accent}">
  <p class="eyebrow">STUDENT LIFE</p>
  <h1>Propose an initiative</h1>
  <p class="page-lede">
    Got something you want to run for the cohort? Fill this in and we will come
    back to you. Keep answers concise — attach extra detail if you need to.
  </p>
</section>
<section class="proposal-form" id="form">
  <h2>Send us your proposal</h2>
  <p class="form-intro">
    This is the Council's own proposal template, as a form. Fill it in and press
    send: it opens your email app with everything laid out, addressed to
    <strong>${councilEmail}</strong>. Prefer paper? <a href="${prefix}docs/initiative-proposal-template.pdf">Download the PDF template</a>.
  </p>
  <form id="initiative-form" novalidate>
${formSections
  .map(
    (sec) => `    <fieldset>
      <legend>${e(sec.part)}</legend>
      <h3 class="fieldset-title">${e(sec.heading)}</h3>
      ${sec.blurb ? `<p class="fieldset-blurb">${e(sec.blurb)}</p>` : ''}
${sec.fields.map(formField).join('\n')}
${sec.supporters ? supporterRows() : ''}
    </fieldset>`,
  )
  .join('\n')}
    <fieldset class="checklist">
      <legend>Before submitting</legend>
${checklist
  .map(
    (c, i) => `      <label class="check"><input type="checkbox" name="check_${i}"> ${e(c)}</label>`,
  )
  .join('\n')}
    </fieldset>
    <div class="form-actions">
      <button type="submit" class="cta">Open in my email app</button>
      <button type="button" class="cta cta-ghost" id="copy-proposal">Copy as text instead</button>
    </div>
    <p class="form-note" id="form-note" role="status"></p>
  </form>
</section>
<section class="guide-next">
  <h2>What happens next</h2>
  <p>
    We will come back to you. If the numbers need discussing we will ask to meet
    rather than simply decline — a proposal that is too expensive as written is
    often workable at a smaller scale.
  </p>
</section>
${footer(prefix)}
<script>
(() => {
  const form = document.getElementById('initiative-form');
  if (!form) return;
  const note = document.getElementById('form-note');
  const TO = '${councilEmail}';

  // Build a plain-text proposal from the filled-in fields, in the order they appear.
  const labelFor = (f, fs) => {
    const l = fs.querySelector('label[for=\"' + f.id + '\"]');
    if (l) return l.textContent.replace('*', '').trim();
    return f.getAttribute('aria-label') || f.name;
  };

  const compose = () => {
    const out = [];
    for (const fs of form.querySelectorAll('fieldset')) {
      const part = fs.querySelector('legend').textContent.trim();
      const title = fs.querySelector('.fieldset-title');
      const parts = [];

      // supporters render as a numbered list rather than 30 labelled lines
      const rows = fs.querySelectorAll('.supporter-row');
      if (rows.length) {
        const listed = [];
        rows.forEach((row, i) => {
          const [name, email, role] = [...row.querySelectorAll('input')].map((x) => x.value.trim());
          if (name || email || role) {
            listed.push(String(i + 1).padStart(2, '0') + '. ' + [name, email, role].filter(Boolean).join(' — '));
          }
        });
        if (listed.length) parts.push('Supporters (' + listed.length + ' of 10):\\n' + listed.join('\\n'));
      }

      for (const f of fs.querySelectorAll('input, textarea')) {
        if (f.type === 'checkbox' || f.closest('.supporter-row')) continue;
        const value = f.value.trim();
        if (!value) continue;
        parts.push(labelFor(f, fs) + ':\\n' + value);
      }
      if (parts.length) {
        out.push(part.toUpperCase() + (title ? ' — ' + title.textContent.trim() : ''), '', parts.join('\\n\\n'), '');
      }
    }
    return out.join('\\n');
  };

  const subject = () => {
    const t = (form.querySelector('#title') || {}).value || '';
    return 'Initiative proposal' + (t.trim() ? ': ' + t.trim() : '');
  };

  const missing = () =>
    [...form.querySelectorAll('[required]')].filter((f) => !f.value.trim());

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const gaps = missing();
    if (gaps.length) {
      gaps[0].focus();
      note.textContent = 'Please fill in the required fields first — ' + gaps.length + ' still empty.';
      return;
    }
    const body = compose();
    const url = 'mailto:' + TO + '?subject=' + encodeURIComponent(subject()) + '&body=' + encodeURIComponent(body);
    // Very long proposals can exceed what a mail app accepts in a link.
    if (url.length > 1900) {
      // A full proposal is usually longer than a mail app will accept in a link,
      // so copy it rather than silently sending a truncated one.
      navigator.clipboard.writeText('To: ' + TO + '\\nSubject: ' + subject() + '\\n\\n' + body).then(
        () => { note.textContent = 'Your proposal is too long to hand straight to an email app, so it has been copied instead. Paste it into an email to ' + TO + '.'; },
        () => { note.textContent = 'Your proposal is long. Use \u201cCopy as text instead\u201d, then paste it into an email to ' + TO + '.'; },
      );
      return;
    }
    note.textContent = 'Opening your email app\u2026 if nothing happens, use \u201cCopy as text instead\u201d.';
    window.location.href = url;
  });

  document.getElementById('copy-proposal').addEventListener('click', async () => {
    const text = 'To: ' + TO + '\\nSubject: ' + subject() + '\\n\\n' + compose();
    try {
      await navigator.clipboard.writeText(text);
      note.textContent = 'Copied. Paste it into an email to ' + TO + '.';
    } catch {
      note.textContent = 'Could not copy automatically — select the text in the fields and copy it manually.';
    }
  });
})();
</script>`;
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
await mkdir(join(out, 'contributor-badge'), { recursive: true });
await writeFile(join(out, 'contributor-badge/index.html'), contributorBadgePage());
await mkdir(join(out, 'concerns'), { recursive: true });
await writeFile(join(out, 'concerns/index.html'), concernsPage());
await mkdir(join(out, 'mim-of-the-week'), { recursive: true });
await writeFile(join(out, 'mim-of-the-week/index.html'), mimOfWeekPage());
await mkdir(join(out, 'careers'), { recursive: true });
await writeFile(join(out, 'careers/index.html'), careersPage());
await mkdir(join(out, 'student-life'), { recursive: true });
await writeFile(join(out, 'student-life/index.html'), studentLifePage());
await mkdir(join(out, 'tutoring'), { recursive: true });
await writeFile(join(out, 'tutoring/index.html'), tutoringPage());
await writeFile(join(out, '.nojekyll'), '');
// Tells GitHub Pages which custom domain serves this site. Without it, Pages
// answers on edav8.github.io only and mim28.com gets a 404.
await writeFile(join(out, 'CNAME'), 'mim28.com\n');

console.log(`built dist-static/  (${upcoming('cohort').length} cohort events, ${council.length} council members)`);
