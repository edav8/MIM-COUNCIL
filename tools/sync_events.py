#!/usr/bin/env python3
"""Generate the council site's calendar from the INSEAD repo's obligations/.

    python3 tools/sync_events.py --dry-run     # always first: read both lists
    python3 tools/sync_events.py               # writes lib/events.generated.ts

WHY OPT-IN, NOT HEURISTICS. The MIM28 Hub decides what to publish by guessing
from an obligation's fields, and it has already been lucky once: an immigration
obligation was held back only because the word "mail" happened to appear in one
of its lines. Reworded, it would have told the cohort its owner may hold a French
long-stay visa needing validation.

This site is read by the whole cohort, so nothing is published unless the
obligation says so in as many words:

    council_site: true

Anything without that line is ignored, however harmless it looks. On top of that
there are hard blocks that override the flag, so a careless `council_site: true`
on a private item still cannot publish.

OPTIONAL FIELDS an obligation may add to control how it appears:

    site_when:    "Sat 7 Nov · 21:00–01:00"   overrides the generated date line
    site_title:   "MIM Diwali 2026"           overrides the obligation title
    site_where:   "La Nef, Fontainebleau"
    site_note:    "BYOB. €10."
    site_href:    "https://..."               a ticket or sign-up link
    site_cta:     "Tickets"
    site_pillar:  academic | student-life | careers | wellbeing

Data flows one way: obligations/ -> this site. Nothing here ever writes back.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parents[1]
OUT = HERE / "lib" / "events.generated.ts"

# The INSEAD repo. Overridable with --obligations for a different checkout.
DEFAULT_OBLIGATIONS = Path.home() / "Desktop" / "INSEAD CLAUDE REPO" / "obligations"

# Hard blocks. These override council_site: true — defence in depth, because the
# cost of one wrong publication is someone's private business on a public page.
BLOCK_SOURCES = {"outlook", "email"}
BLOCK_FLAGS = ("private", "never_publish", "stale")
BLOCK_STATUS = {"done", "not-applicable", "stale", "expired"}

PILLARS = {"academic", "student-life", "careers", "wellbeing"}

MONTHS = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"]


def frontmatter(text: str) -> dict:
    """Parse the simple `key: value` frontmatter these notes use."""
    m = re.match(r"---\n(.*?)\n---", text, re.S)
    if not m:
        return {}
    out = {}
    for line in m.group(1).splitlines():
        km = re.match(r"^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$", line)
        if km:
            out[km.group(1)] = km.group(2).strip().strip('"').strip("'")
    return out


def truthy(v) -> bool:
    return str(v).strip().lower() in {"true", "yes", "1"}


def date_of(fm: dict):
    """The event's date, and whether we know a time of day for it."""
    raw = fm.get("due_utc") or fm.get("due_local") or fm.get("due") or ""
    if not raw:
        return None, False
    try:
        if "T" in raw:
            return dt.date.fromisoformat(raw[:10]), True
        if len(raw) == 7:  # YYYY-MM, month precision
            return dt.date.fromisoformat(raw + "-01"), False
        return dt.date.fromisoformat(raw[:10]), False
    except ValueError:
        return None, False


def when_line(fm: dict, day: dt.date, has_time: bool) -> str:
    if fm.get("site_when"):
        return fm["site_when"]
    label = f"{day:%a} {day.day} {MONTHS[day.month - 1][:3]}"
    local = fm.get("due_local") or ""
    if has_time and "T" in local:
        return f"{label} · {local[11:16]}"
    return label


def pillar_of(fm: dict) -> str:
    p = (fm.get("site_pillar") or "").strip().lower()
    if p in PILLARS:
        return p
    ns = (fm.get("namespace") or "").lower()
    if ns.startswith("co-cdc") or ns.startswith("co-"):
        return "careers"
    if ns in {"mkt", "fin", "dsc", "eps", "acc", "ips", "lead", "atl"}:
        return "academic"
    return "student-life"


def collect(folder: Path, today: dt.date):
    published, held = [], []
    for path in sorted(folder.glob("*.md")):
        fm = frontmatter(path.read_text(encoding="utf-8"))
        if not fm:
            continue
        name = path.name

        if not truthy(fm.get("council_site")):
            continue  # silent: most obligations are simply not for the site

        # Hard blocks, which the flag cannot override.
        reasons = []
        if (fm.get("source") or "").lower() in BLOCK_SOURCES:
            reasons.append(f"source is {fm.get('source')} — mailbox material never goes public")
        for flag in BLOCK_FLAGS:
            if truthy(fm.get(flag)):
                reasons.append(f"{flag}: true")
        if (fm.get("status") or "").lower() in BLOCK_STATUS:
            reasons.append(f"status is {fm.get('status')}")
        if re.search(r"retake|resit|remedial", fm.get("title", ""), re.I):
            reasons.append("title mentions a retake/resit")

        day, has_time = date_of(fm)
        if day is None:
            reasons.append("no usable date")
        elif day < today:
            reasons.append(f"already passed ({day})")

        if reasons:
            held.append((name, fm.get("title", "")[:70], reasons))
            continue

        ev = {
            "when": when_line(fm, day, has_time),
            "sortKey": day.isoformat(),
            "title": fm.get("site_title") or fm.get("title", "").split("—")[0].strip(),
            "group": "careers" if pillar_of(fm) == "careers" else "cohort",
            "pillar": pillar_of(fm),
            "_from": name,
        }
        for key, field in (("where", "site_where"), ("note", "site_note"),
                           ("href", "site_href"), ("cta", "site_cta")):
            if fm.get(field):
                ev[key] = fm[field]
        published.append(ev)

    published.sort(key=lambda e: e["sortKey"])
    return published, held


def render(events) -> str:
    lines = [
        "// GENERATED by tools/sync_events.py from the INSEAD repo's obligations/.",
        "// Do not edit by hand — rerun the script. Hand-written events live in",
        "// lib/events.ts and are merged with these.",
        f"// Last generated: {dt.date.today().isoformat()}",
        "",
        "import type { CohortEvent } from './events';",
        "",
        "export const generated: CohortEvent[] = [",
    ]
    for e in events:
        src = e.pop("_from")
        lines.append(f"  // from obligations/{src}")
        lines.append("  {")
        for k, v in e.items():
            lines.append(f"    {k}: {json.dumps(v, ensure_ascii=False)},")
        lines.append("  },")
    lines += ["];", ""]
    return "\n".join(lines)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dry-run", action="store_true", help="print, write nothing")
    ap.add_argument("--obligations", type=Path, default=DEFAULT_OBLIGATIONS)
    args = ap.parse_args()

    if not args.obligations.is_dir():
        print(f"obligations folder not found: {args.obligations}", file=sys.stderr)
        print("This script runs locally — the GitHub workflow cannot see that repo.",
              file=sys.stderr)
        return 2

    today = dt.date.today()
    published, held = collect(args.obligations, today)

    print(f"Read {args.obligations}")
    print(f"\nWOULD PUBLISH ({len(published)}):")
    for e in published or []:
        print(f"  {e['sortKey']}  [{e['pillar']:<12}] {e['title'][:62]}")
    if not published:
        print("  (none — no obligation carries `council_site: true`)")

    print(f"\nHELD BACK ({len(held)}) — flagged for the site but blocked:")
    for name, title, reasons in held or []:
        print(f"  {name}\n      {title}\n      -> {'; '.join(reasons)}")
    if not held:
        print("  (none)")

    print("\nRead the held-back list. The flag is opt-in, but a mistaken flag on a")
    print("private item is exactly what the hard blocks exist to catch.")

    if args.dry_run:
        print("\n--dry-run: nothing written.")
        return 0

    OUT.write_text(render(published), encoding="utf-8")
    print(f"\nWrote {OUT.relative_to(HERE)} ({len(published)} events).")
    print("Commit and push; the site rebuilds in about 25 seconds.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
