#!/usr/bin/env python3
"""
Enrich celeb-bios.json with Wikipedia image URLs.
Reads the existing JSON, fetches each celebrity's Wikipedia thumbnail,
and writes wiki_image + wiki_url fields back into the file.

Does NOT call the backend or Gemini — only hits Wikipedia's public API.
Safe to re-run: already-enriched entries are skipped.

Usage (from repo root):
    python3 backend/scripts/add_wiki_images.py
"""

import json
import time
import urllib.request
import urllib.parse
import sys
from pathlib import Path

DELAY = 0.15   # seconds between Wikipedia API calls (be polite)
USER_AGENT = "ZodicogAI/1.0 (https://zodicogai.com; contact@zodicogai.com)"


def wiki_title(name: str) -> str:
    """Convert a celebrity name to a Wikipedia article title."""
    return name.replace(" ", "_")


def fetch_wiki_data(name: str) -> tuple[str | None, str]:
    """
    Fetch Wikipedia thumbnail URL and canonical page URL for a celebrity.
    Returns (image_url_or_None, wiki_page_url).
    """
    title = urllib.parse.quote(wiki_title(name), safe="_()'")
    api_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{title}"
    wiki_url = f"https://en.wikipedia.org/wiki/{title}"

    try:
        req = urllib.request.Request(
            api_url,
            headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read())
            # Use canonical URL from API if available
            if data.get("content_urls", {}).get("desktop", {}).get("page"):
                wiki_url = data["content_urls"]["desktop"]["page"]
            thumb = data.get("originalimage") or data.get("thumbnail")
            if thumb and thumb.get("source"):
                return thumb["source"], wiki_url
            return None, wiki_url
    except Exception as e:
        print(f"  WARN Wikipedia API: {e}", file=sys.stderr)
        return None, wiki_url


def main():
    script_dir = Path(__file__).parent
    repo_root  = script_dir.parent.parent
    bios_path  = repo_root / "frontend" / "lib" / "celeb-bios.json"

    if not bios_path.exists():
        print(f"ERROR: {bios_path} not found. Run generate_celeb_bios.py first.", file=sys.stderr)
        sys.exit(1)

    bios: dict = json.loads(bios_path.read_text(encoding="utf-8"))
    print(f"Loaded {len(bios)} entries from celeb-bios.json\n")

    # Find entries that need enrichment (missing wiki_image key)
    # We still fetch wiki_url even if image is absent so page can link to Wikipedia
    to_enrich = {slug: data for slug, data in bios.items() if "wiki_url" not in data}
    print(f"To enrich: {len(to_enrich)}  |  Already done: {len(bios) - len(to_enrich)}\n")

    found_images = 0
    no_images    = 0

    for i, (slug, data) in enumerate(to_enrich.items(), 1):
        # Derive celebrity name from article content or slug
        name = data.get("name") or slug.replace("-", " ").title()

        # Most entries don't store name — derive from slug for the API call
        # Better: use the slug to reconstruct (e.g. "allu-arjun" → "Allu Arjun")
        name_from_slug = " ".join(w.capitalize() for w in slug.split("-"))

        print(f"[{i:3}/{len(to_enrich)}] {name_from_slug} ...", end=" ", flush=True)
        img_url, wiki_url = fetch_wiki_data(name_from_slug)

        bios[slug]["wiki_url"] = wiki_url
        if img_url:
            bios[slug]["wiki_image"] = img_url
            found_images += 1
            print(f"OK (image)")
        else:
            no_images += 1
            print(f"OK (no image)")

        # Save every 20 entries
        if i % 20 == 0:
            bios_path.write_text(json.dumps(bios, ensure_ascii=False, indent=2), encoding="utf-8")
            print(f"  [saved progress — {i} done]")

        time.sleep(DELAY)

    # Final save
    bios_path.write_text(json.dumps(bios, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\n{'='*50}")
    print(f"Done.")
    print(f"  With image : {found_images}")
    print(f"  No image   : {no_images}")
    print(f"  Total      : {len(bios)}")
    print(f"\nNow commit celeb-bios.json and rebuild the frontend.")


if __name__ == "__main__":
    main()
