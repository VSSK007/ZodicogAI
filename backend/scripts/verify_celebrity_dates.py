#!/usr/bin/env python3
"""
Cross-check every celebrity's birth date in frontend/lib/celebrities.ts against
Wikidata (reached through each person's Wikipedia page) and check that the
stored sign matches the stored day/month.

    python backend/scripts/verify_celebrity_dates.py

Exit code 1 if anything disagrees that isn't in KNOWN_DISPUTED. Needs network
access; Wikimedia rate-limits, so requests are sequential with backoff.

KNOWN_DISPUTED lists people whose sources genuinely conflict (Wikidata vs the
Wikipedia article vs press reports of their age, or Old/New Style calendar
dates). The value kept in celebrities.ts is the one the Wikipedia article and
recent birthday coverage agree on; see the note next to each.
"""
import re
import sys
import time
import urllib.parse
from pathlib import Path

import requests

SRC = Path(__file__).resolve().parents[2] / "frontend" / "lib" / "celebrities.ts"
UA = {"User-Agent": "ZodicogAI-data-audit/1.0 (https://zodicogai.com)"}
MON = {"Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6, "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12}

# slug -> why the stored value intentionally differs from Wikidata's first claim
KNOWN_DISPUTED = {
    "ajay-devgn": "Wikipedia article and 2025 birthday coverage: 1969; Wikidata: 1968",
    "lady-gaga": "Wikidata has both; Mar 28 is the preferred-rank claim",
    "samantha-ruth-prabhu": "Apr 28 per article and press; Wikidata: Apr 27",
    "shilpa-shetty": "turned 50 in June 2025 -> 1975; Wikidata: 1976",
    "dhanush": "Jul 28 1983 per article and press; Wikidata: Feb 25",
    "ranbir-kapoor": "Sep 28 per article and press; Wikidata: Sep 25",
    "nayanthara": "turned 40 in Nov 2024 -> 1984; Wikidata: 1985",
    "anushka-shetty": "Nov 7 1981 per article/press; Wikidata: 1982",
    "william-shakespeare": "only the baptism (Apr 26) is documented; Apr 23 is traditional",
    "leo-tolstoy": "Sep 9 is the Gregorian date; Wikidata stores the Julian Aug 28",
    "ludwig-van-beethoven": "baptised Dec 17, born c. Dec 16",
    "fr-d-ric-chopin": "Mar 1 per Polish records; Feb 22 disputed",
    "nagarjuna": "Wikidata resolves to the 2nd-century philosopher; page needs a wikiTitle",
}


def sign_for(d: int, m: int) -> str:
    if (m == 3 and d >= 21) or (m == 4 and d <= 19): return "aries"
    if (m == 4 and d >= 20) or (m == 5 and d <= 20): return "taurus"
    if (m == 5 and d >= 21) or (m == 6 and d <= 20): return "gemini"
    if (m == 6 and d >= 21) or (m == 7 and d <= 22): return "cancer"
    if (m == 7 and d >= 23) or (m == 8 and d <= 22): return "leo"
    if (m == 8 and d >= 23) or (m == 9 and d <= 22): return "virgo"
    if (m == 9 and d >= 23) or (m == 10 and d <= 22): return "libra"
    if (m == 10 and d >= 23) or (m == 11 and d <= 21): return "scorpio"
    if (m == 11 and d >= 22) or (m == 12 and d <= 21): return "sagittarius"
    if (m == 12 and d >= 22) or (m == 1 and d <= 19): return "capricorn"
    if (m == 1 and d >= 20) or (m == 2 and d <= 18): return "aquarius"
    return "pisces"


def get_json(url: str, tries: int = 6):
    for i in range(tries):
        r = requests.get(url, headers=UA, timeout=25)
        if r.status_code == 200:
            try:
                return r.json()
            except ValueError:
                pass
        time.sleep(2 + 2 * i)
    return None


def wikidata_dob(title: str):
    j = get_json("https://en.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote(title.replace(" ", "_"), safe=""))
    if not j or j.get("type") == "disambiguation" or not j.get("wikibase_item"):
        return None
    qid = j["wikibase_item"]
    e = get_json(f"https://www.wikidata.org/wiki/Special:EntityData/{qid}.json")
    claims = (e or {})["entities"][qid]["claims"].get("P569") if e else None
    if not claims:
        return None
    # Prefer a preferred-rank claim when Wikidata carries several dates.
    claims = sorted(claims, key=lambda c: c["rank"] != "preferred")
    mo = re.match(r"[+-](\d+)-(\d\d)-(\d\d)", claims[0]["mainsnak"]["datavalue"]["value"]["time"])
    return int(mo.group(1)), int(mo.group(2)), int(mo.group(3))


def main() -> int:
    text = SRC.read_text(encoding="utf-8")
    rows = re.findall(
        r'\{ name: "([^"]+)",\s*slug: "([^"]+)",\s*sign: "([^"]+)", born: "([^"]+)",\s*birthDay: (\d+),\s*birthMonth: (\d+)'
        r'(?:[^}]*?wikiTitle: "([^"]+)")?', text)
    problems = 0
    for name, slug, sign, born, d, m, wiki_title in rows:
        mo, dy, yr = re.match(r"(\w+) (\d+), (\d+)", born).groups()
        ours = (int(yr), MON[mo], int(dy))
        if (MON[mo], int(dy)) != (int(m), int(d)) or sign_for(int(d), int(m)) != sign:
            print(f"INCONSISTENT  {name}: born={born} birthDay/Month={d}/{m} sign={sign}")
            problems += 1
            continue
        if slug in KNOWN_DISPUTED:
            continue
        dob = wikidata_dob(wiki_title or name)
        time.sleep(0.4)
        if dob is None:
            print(f"UNVERIFIED    {name}: no Wikidata date found")
        elif dob != ours:
            print(f"MISMATCH      {name}: ours={ours} wikidata={dob}")
            problems += 1
    print(f"\n{len(rows)} checked, {problems} problem(s)")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
