#!/usr/bin/env python3
"""Turn the MIM28 Birthday Calendar .docx into lib/birthdays.json.

    python3 tools/parse_birthdays.py ~/Downloads/"MIM 28 Birthday Calendar .docx"

WHY THE LIST IS NOT IN THE REPO. This repository is public, so anything committed
to it is published permanently, git history included. A hundred classmates'
birthdays is not ours to publish. So:

    lib/birthdays.json          gitignored — never committed
    lib/birthdays.example.json  committed, two invented rows, so the shape is clear

The site renders only the names whose birthday is TODAY, and only into that day's
HTML. The full list never reaches the public repo.

For the daily GitHub build, put the JSON in an Actions secret named BIRTHDAYS and
the workflow writes it to lib/birthdays.json before building. Secrets are not
readable from the repository.

Only the day and month are kept. The year is dropped even if the document has it —
a birth year is identifying in a way a birthday is not.
"""
from __future__ import annotations

import json
import re
import sys
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parents[1]
OUT = HERE / "lib" / "birthdays.json"

MONTHS = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}


def cells(docx: Path):
    """Yield each table row as a list of cell strings."""
    with zipfile.ZipFile(docx) as z:
        xml = z.read("word/document.xml").decode("utf-8")
    for row in re.findall(r"<w:tr[ >].*?</w:tr>", xml, re.S):
        out = []
        for cell in re.findall(r"<w:tc[ >].*?</w:tc>", row, re.S):
            text = "".join(re.findall(r"<w:t[^>]*>([^<]*)</w:t>", cell))
            out.append(text.strip())
        if out:
            yield out


def month_of(raw: str):
    key = re.sub(r"[^a-z]", "", raw.lower())[:3]
    return MONTHS.get(key)


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    src = Path(sys.argv[1]).expanduser()
    if not src.is_file():
        print(f"not found: {src}", file=sys.stderr)
        return 2

    people, skipped = [], []
    for row in cells(src):
        if len(row) < 3:
            continue
        name, day_raw, month_raw = row[0], row[1], row[2]
        if not name or name.lower() == "name":
            continue
        m = re.search(r"\d{1,2}", day_raw or "")
        day = int(m.group()) if m else None
        month = month_of(month_raw or "")
        if not day or not month or not (1 <= day <= 31):
            skipped.append((name, day_raw, month_raw))
            continue
        people.append({"name": name, "day": day, "month": month})

    people.sort(key=lambda p: (p["month"], p["day"], p["name"]))
    OUT.write_text(json.dumps(people, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Wrote {OUT.relative_to(HERE)} — {len(people)} birthdays.")
    if skipped:
        print(f"\nSkipped {len(skipped)} rows with no usable date "
              f"(the document is filled in by hand, so some are blank):")
        for name, d, mth in skipped[:15]:
            print(f"  {name!r:40} day={d!r} month={mth!r}")
    print("\nlib/birthdays.json is gitignored and must stay that way.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
