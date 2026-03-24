#!/usr/bin/env python3
"""
Enrich celeb-bios.json with Wikipedia image URLs.
Reads the existing JSON, fetches each celebrity's Wikipedia thumbnail,
and writes wiki_image + wiki_url fields back into the file.

Does NOT call the backend or Gemini — only hits Wikipedia's public API.
Safe to re-run:
  - Already-enriched entries are skipped UNLESS they have a wikiTitle override
    in celebrities.ts (those are force-refetched to fix wrong images).

Usage (from repo root):
    python3 backend/scripts/add_wiki_images.py
"""

import json
import re
import time
import urllib.request
import urllib.parse
import sys
from pathlib import Path

DELAY = 0.15   # seconds between Wikipedia API calls (be polite)
USER_AGENT = "ZodicogAI/1.0 (https://zodicogai.com; contact@zodicogai.com)"


def parse_wiki_title_overrides(ts_path: Path) -> dict[str, str]:
    """
    Extract wikiTitle overrides from celebrities.ts.
    Returns {slug: wikiTitle} for entries that have the field.
    """
    text = ts_path.read_text(encoding="utf-8")
    # Match lines with both slug and wikiTitle
    pattern = re.compile(
        r'slug:\s*"([^"]+)"[^}]*?wikiTitle:\s*"([^"]+)"'
    )
    return {m.group(1): m.group(2) for m in pattern.finditer(text)}


def fetch_wiki_data(wiki_name: str) -> tuple[str | None, str]:
    """
    Fetch Wikipedia thumbnail URL and canonical page URL.
    Returns (image_url_or_None, wiki_page_url).
    """
    title = urllib.parse.quote(wiki_name.replace(" ", "_"), safe="_()'.")
    api_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{title}"
    fallback_url = f"https://en.wikipedia.org/wiki/{title}"

    try:
        req = urllib.request.Request(
            api_url,
            headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read())
            wiki_url = (
                data.get("content_urls", {}).get("desktop", {}).get("page")
                or fallback_url
            )
            thumb = data.get("originalimage") or data.get("thumbnail")
            img = thumb["source"] if thumb and thumb.get("source") else None
            return img, wiki_url
    except Exception as e:
        print(f"  WARN Wikipedia API ({wiki_name}): {e}", file=sys.stderr)
        return None, fallback_url


def main():
    script_dir = Path(__file__).parent
    repo_root  = script_dir.parent.parent
    ts_path    = repo_root / "frontend" / "lib" / "celebrities.ts"
    bios_path  = repo_root / "frontend" / "lib" / "celeb-bios.json"

    if not bios_path.exists():
        print(f"ERROR: {bios_path} not found. Run generate_celeb_bios.py first.", file=sys.stderr)
        sys.exit(1)

    # Parse wikiTitle overrides from TypeScript source
    overrides = parse_wiki_title_overrides(ts_path)
    if overrides:
        print(f"Found {len(overrides)} wikiTitle overrides: {list(overrides.keys())}\n")

    bios: dict = json.loads(bios_path.read_text(encoding="utf-8"))
    print(f"Loaded {len(bios)} entries from celeb-bios.json\n")

    # Decide which entries to process:
    # 1. Missing wiki_url → needs enrichment
    # 2. Missing wiki_image → retry (previous fetch returned no image)
    # 3. Has a wikiTitle override → force-refetch (fixes wrong images/links)
    to_enrich = {
        slug: data for slug, data in bios.items()
        if "wiki_url" not in data or "wiki_image" not in data or slug in overrides
    }
    print(f"To fetch/re-fetch: {len(to_enrich)}  |  Skipping: {len(bios) - len(to_enrich)}\n")

    found_images = 0
    no_images    = 0

    for i, (slug, data) in enumerate(to_enrich.items(), 1):
        # Use wikiTitle override if present, otherwise derive from slug
        if slug in overrides:
            wiki_name = overrides[slug]
            tag = f"(override → {wiki_name})"
        else:
            wiki_name = " ".join(w.capitalize() for w in slug.split("-"))
            tag = ""

        print(f"[{i:3}/{len(to_enrich)}] {wiki_name} {tag}...", end=" ", flush=True)
        img_url, wiki_url = fetch_wiki_data(wiki_name)

        bios[slug]["wiki_url"] = wiki_url
        if img_url:
            bios[slug]["wiki_image"] = img_url
            found_images += 1
            print("OK (image)")
        else:
            # Remove stale image if re-fetching an override that now has no image
            bios[slug].pop("wiki_image", None)
            no_images += 1
            print("OK (no image)")

        if i % 20 == 0:
            bios_path.write_text(json.dumps(bios, ensure_ascii=False, indent=2), encoding="utf-8")
            print(f"  [saved progress — {i} done]")

        time.sleep(DELAY)

    bios_path.write_text(json.dumps(bios, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\n{'='*50}")
    print(f"Done.  With image: {found_images}  |  No image: {no_images}")
    print(f"\nNow commit celeb-bios.json and rebuild the frontend.")


if __name__ == "__main__":
    main()
