"use client";

/**
 * CommandPalette — ⌘K / Ctrl+K (or "/") search that jumps to any analysis,
 * page, sign, MBTI type, celebrity, guide, or past reading. Also reachable
 * from the navbar and mobile menu via openCommandPalette().
 *
 * Everything is client-side; the celebrity dataset is imported lazily on
 * first open so it doesn't weigh down the initial bundle.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Search } from "lucide-react";
import { Glyph, SignGlyph, Star4, type GlyphName } from "@/components/ui/glyphs";
import { ANALYZE_TOGETHER, ANALYZE_YOU } from "@/lib/analyses";
import { MBTI_DATA } from "@/lib/mbti-data";
import { getHistory } from "@/lib/history";
import { DUR, EASE } from "@/lib/motion";
import type { Celebrity } from "@/lib/celebrities";

const OPEN_EVENT = "zodicog:palette";
export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

type Item = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  href: string;
  glyph?: GlyphName;
  sign?: string;
  keywords?: string;
};

const SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const GUIDES: Item[] = [
  ...["words-of-affirmation", "acts-of-service", "receiving-gifts", "quality-time", "physical-touch"].map((s) => ({
    id: `ll-${s}`, group: "Guides", label: s.split("-").map(cap).join(" "), hint: "Love language",
    href: `/blog/love-languages/${s}`, glyph: "heart" as GlyphName,
  })),
  ...["eros", "storge", "pragma", "ludus", "mania", "agape"].map((s) => ({
    id: `ls-${s}`, group: "Guides", label: cap(s), hint: "Love style",
    href: `/blog/love-styles/${s}`, glyph: "heart" as GlyphName,
  })),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33].map((n) => ({
    id: `num-${n}`, group: "Guides", label: `Life path ${n}`, hint: "Numerology",
    href: `/blog/numerology/${n}`, glyph: "infinity" as GlyphName, keywords: "numerology number",
  })),
];

const PAGES: Item[] = [
  { id: "p-chat", group: "Go to", label: "Zodicognac", hint: "Ask anything", href: "/chat", glyph: "star4", keywords: "chat ask ai" },
  { id: "p-horoscope", group: "Go to", label: "Daily horoscope", href: "/horoscope", glyph: "sun" },
  { id: "p-discover", group: "Go to", label: "Discover", hint: "Archetype, pattern, attraction, taste", href: "/discover", glyph: "crescent" },
  { id: "p-celebs", group: "Go to", label: "Celebrities", hint: "360 charts", href: "/celebrities", glyph: "star4" },
  { id: "p-blog", group: "Go to", label: "Blog", href: "/blog", glyph: "mercury" },
  { id: "p-faq", group: "Go to", label: "FAQ", href: "/blog/faq", glyph: "mercury" },
  { id: "p-about", group: "Go to", label: "About", href: "/about", glyph: "mercury" },
  { id: "p-readings", group: "Go to", label: "My readings", hint: "History on this device", href: "/readings", glyph: "infinity" },
  { id: "p-profile", group: "Go to", label: "My profile", hint: "Saved details", href: "/profile", glyph: "sun", keywords: "settings me account" },
  { id: "p-login", group: "Go to", label: "Sign in", hint: "Sync your profile and readings across devices", href: "/login", glyph: "sun", keywords: "log in account email register" },
  ...[
    ["archetype", "Love archetype"], ["pattern", "Relationship pattern"],
    ["attraction", "Attraction style"], ["recommendations", "Taste profile"],
  ].map(([s, l]) => ({ id: `d-${s}`, group: "Go to", label: l, hint: "Discover", href: `/discover/${s}`, glyph: "crescent" as GlyphName })),
];

const ANALYSES: Item[] = [...ANALYZE_YOU, ...ANALYZE_TOGETHER].map((a) => ({
  id: `a-${a.href}`, group: "Analyses", label: a.label, hint: a.desc, href: a.href,
  glyph: a.glyph ?? "star4", keywords: "analyze reading",
}));

const SIGN_ITEMS: Item[] = SIGNS.map((s) => ({
  id: `s-${s}`, group: "Signs", label: cap(s), hint: "Today's horoscope", href: `/horoscope/${s}`, sign: s,
  keywords: "zodiac horoscope",
}));

const MBTI_ITEMS: Item[] = Object.values(MBTI_DATA).map((m) => ({
  id: `m-${m.type}`, group: "Personality types", label: m.type, hint: m.nickname,
  href: `/blog/mbti/${m.type.toLowerCase()}`, glyph: "mercury", keywords: `${m.nickname} ${m.role} mbti`,
}));

function score(item: Item, q: string): number {
  const label = item.label.toLowerCase();
  const slug = item.href.split("?")[0].replace(/[/-]+/g, " ");
  const hay = `${label} ${item.hint ?? ""} ${item.keywords ?? ""} ${item.group} ${slug}`.toLowerCase();
  if (label === q) return 100;
  if (label.startsWith(q)) return 90;
  if (label.split(/[\s-]+/).some((w) => w.startsWith(q))) return 75;
  if (label.includes(q)) return 60;
  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length > 1 && tokens.every((t) => hay.includes(t))) return 45;
  if (hay.includes(q)) return 30;
  return 0;
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [celebs, setCelebs] = useState<Celebrity[] | null>(null);
  const [readings, setReadings] = useState<Item[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    returnFocus.current?.focus?.();
  }, []);

  // Open triggers: ⌘K / Ctrl+K, "/" outside inputs, and the custom event.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  // On open: remember focus, reset, load data lazily.
  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setActive(0);
    setReadings(
      getHistory().map((r) => ({
        id: `r-${r.id}`, group: "Your readings", label: r.title, hint: r.type.replace(/_/g, " "), href: `/r/${r.id}`, glyph: "infinity" as GlyphName,
      })),
    );
    if (!celebs) import("@/lib/celebrities").then((m) => setCelebs(m.CELEBRITIES));
    // autoFocus covers a fresh mount; this covers reopening while the previous
    // instance is still animating out (same input element, so no remount).
    inputRef.current?.focus();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const celebItems: Item[] = useMemo(
    () =>
      (celebs ?? []).map((c) => ({
        id: `c-${c.slug}`, group: "Celebrities", label: c.name, hint: `${c.category} · ${cap(c.sign)}`,
        href: `/celebrities/${c.slug}`, sign: c.sign, keywords: `${c.nationality} ${c.category}`,
      })),
    [celebs],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = [...ANALYSES, ...PAGES, ...readings, ...SIGN_ITEMS, ...MBTI_ITEMS, ...GUIDES, ...celebItems];
    if (!q) return [...ANALYSES, ...readings.slice(0, 3), ...PAGES.slice(0, 5)];
    const scored = all
      .map((it) => ({ it, s: score(it, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s);
    const perGroup: Record<string, number> = {};
    const out: Item[] = [];
    for (const { it } of scored) {
      perGroup[it.group] = (perGroup[it.group] ?? 0) + 1;
      if (perGroup[it.group] <= 5) out.push(it);
      if (out.length >= 24) break;
    }
    out.push({
      id: "ask", group: "Ask Zodicognac", label: `“${query.trim()}”`, hint: "Ask it as a question",
      href: `/chat?ask=${encodeURIComponent(query.trim())}`, glyph: "star4",
    });
    return out;
  }, [query, readings, celebItems]);

  useEffect(() => setActive(0), [query]);

  // Keep the highlighted row in view.
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function go(item: Item | undefined) {
    if (!item) return;
    setOpen(false);
    router.push(item.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); go(results[active]); }
    else if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "Tab") e.preventDefault(); // keep focus in the field
  }

  let lastGroup = "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh] md:pt-[16vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DUR.fast }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} aria-hidden="true" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="relative w-full max-w-xl rounded-card border border-hairline-strong bg-surface-overlay shadow-panel overflow-hidden"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: DUR.fast, ease: EASE }}
          >
            <div className="flex items-center gap-3 px-4 border-b border-hairline">
              <Search className="size-4 text-ink-muted shrink-0" aria-hidden="true" />
              <input
                ref={inputRef}
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search analyses, signs, celebrities, guides…"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={`palette-opt-${active}`}
                className="flex-1 bg-transparent py-4 text-base text-ink placeholder:text-ink-faint outline-none"
              />
              <kbd className="hidden sm:block text-micro font-mono text-ink-muted border border-hairline rounded px-1.5 py-0.5">esc</kbd>
            </div>

            <div ref={listRef} id="palette-list" role="listbox" className="max-h-[52vh] overflow-y-auto py-2 scrollbar-none">
              {results.map((it, i) => {
                const header = it.group !== lastGroup;
                lastGroup = it.group;
                return (
                  <div key={it.id}>
                    {header && (
                      <p className="flex items-center gap-1.5 px-4 pt-3 pb-1 text-micro font-extrabold uppercase tracking-[0.18em] text-ink-muted">
                        <Star4 size={8} className="text-gold" /> {it.group}
                      </p>
                    )}
                    <button
                      id={`palette-opt-${i}`}
                      data-idx={i}
                      role="option"
                      aria-selected={i === active}
                      onMouseMove={() => setActive(i)}
                      onClick={() => go(it)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        i === active ? "bg-accent/12" : ""
                      }`}
                    >
                      <span className="size-7 shrink-0 rounded-control border border-hairline bg-white/[0.03] flex items-center justify-center text-gold-bright">
                        {it.sign ? <SignGlyph sign={it.sign} size={15} /> : <Glyph name={it.glyph ?? "star4"} size={15} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-ink truncate">{it.label}</span>
                        {it.hint && <span className="block text-xs text-ink-muted truncate">{it.hint}</span>}
                      </span>
                      {i === active && <CornerDownLeft className="size-3.5 text-ink-muted shrink-0" aria-hidden="true" />}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-hairline text-micro text-ink-muted">
              <span><kbd className="font-mono">↑↓</kbd> navigate</span>
              <span><kbd className="font-mono">↵</kbd> open</span>
              <span className="ml-auto hidden sm:block"><kbd className="font-mono">⌘K</kbd> toggle</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
