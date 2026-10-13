"use client";

/**
 * DailyCard - the personal daily card: today's horoscope for the visitor's
 * sign, an MBTI tip, lucky colour and number, a do and an avoid, and a streak.
 * The text comes from GET /daily/{sign} (generated once per sign x type x day
 * and shared, so opening the card is free for everyone after the first).
 */
import { useCallback, useEffect, useState } from "react";
import { Flame, Image as ImageIcon, Share2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ErrorNotice } from "@/components/ui/ErrorNotice";
import { SignGlyph } from "@/components/ui/glyphs";
import { renderMd } from "@/lib/renderMd";
import { API, type PersonData } from "@/lib/api";
import { getSign } from "@/lib/zodiac";
import { recordVisit } from "@/lib/streak";
import { capture } from "@/lib/posthog";
import { haptic } from "@/lib/haptics";
import { shareImageUrl } from "@/lib/shareImage";

export interface DailyResult {
  date: string;
  sign: string;
  mbti: string;
  horoscope: string;
  focus_area: string;
  scores: { love: number; career: number; energy: number; luck: number; overall: number };
  mbti_tip: string;
  do: string;
  avoid: string;
  lucky_color: { name: string; hex: string };
  lucky_number: number;
}

const DIMENSIONS = [
  { key: "love", label: "Love" },
  { key: "career", label: "Career" },
  { key: "energy", label: "Energy" },
  { key: "luck", label: "Luck" },
] as const;

/** Fetch today's card for a profile. Exported so pull-to-refresh can reuse it. */
export async function fetchDaily(profile: PersonData): Promise<DailyResult> {
  const sign = getSign(profile.day, profile.month).toLowerCase();
  const q = new URLSearchParams({ day: String(profile.day), month: String(profile.month) });
  if (profile.mbti) q.set("mbti", profile.mbti);
  const res = await fetch(`${API}/daily/${sign}?${q}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? `HTTP ${res.status}`);
  }
  return (await res.json()) as DailyResult;
}

function greeting(hour = new Date().getHours()) {
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

export function DailySkeleton() {
  // Same height as the loaded card so nothing shifts when it arrives.
  return (
    <div aria-busy="true" aria-label="Loading your daily card" className="h-[34rem] rounded-card border border-hairline bg-white/[0.02] animate-pulse" />
  );
}

export default function DailyCard({
  profile,
  reloadKey = 0,
  onLoaded,
}: {
  profile: PersonData;
  /** Change to re-fetch (pull-to-refresh). */
  reloadKey?: number;
  onLoaded?: (d: DailyResult) => void;
}) {
  const [data, setData] = useState<DailyResult | null>(null);
  const [error, setError] = useState("");
  const [streak, setStreak] = useState(0);
  const [shared, setShared] = useState("");

  const { name, day, month, mbti } = profile;

  const load = useCallback(async () => {
    setError("");
    try {
      const d = await fetchDaily({ name, day, month, mbti, gender: "M" });
      setData(d);
      setStreak(recordVisit());
      capture("daily_card_viewed", { has_mbti: !!mbti });
      onLoaded?.(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load today's card.");
    }
    // onLoaded is intentionally not a dependency: callers pass inline callbacks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, day, month, mbti]);

  useEffect(() => {
    void load();
  }, [load, reloadKey]);

  async function shareStory() {
    if (!data) return;
    haptic();
    capture("daily_card_story_shared");
    const q = new URLSearchParams({
      sign: getSign(day, month).toLowerCase(), day: String(day), month: String(month), name,
    });
    if (mbti) q.set("mbti", mbti);
    try {
      await shareImageUrl(`/story/daily?${q}`, "zodicogai-today.png", "My ZodicogAI day");
    } catch {
      setShared("Couldn't make the image");
      setTimeout(() => setShared(""), 2500);
    }
  }

  async function share() {
    if (!data) return;
    haptic();
    const sign = getSign(day, month);
    const text = `My ${sign} day: ${data.horoscope}\nLucky number ${data.lucky_number} · ${data.lucky_color.name}`;
    const url = typeof window !== "undefined" ? `${window.location.origin}/today` : "";
    capture("daily_card_shared");
    try {
      if (navigator.share) {
        await navigator.share({ title: "My ZodicogAI daily card", text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setShared("Copied to clipboard");
      setTimeout(() => setShared(""), 2500);
    } catch {
      // The visitor dismissed the share sheet - nothing to do.
    }
  }

  if (error) return <ErrorNotice message={error} onRetry={() => void load()} />;
  if (!data) return <DailySkeleton />;

  const sign = getSign(day, month);
  const dateLabel = new Date(`${data.date}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <div data-testid="daily-card" className="space-y-4">
      <Card variant="gold" className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Eyebrow>{dateLabel}</Eyebrow>
            <h2 className="mt-2 font-display font-extrabold tracking-[-0.02em] text-2xl text-ink text-balance">
              {greeting()}, {profile.name || "friend"}
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              {sign}{mbti ? ` · ${mbti}` : ""} · {data.focus_area}
            </p>
          </div>
          <span className="shrink-0 size-12 rounded-card border border-hairline-gold bg-gold/10 flex items-center justify-center text-gold-bright">
            <SignGlyph sign={sign} size={24} strokeWidth={1.6} />
          </span>
        </div>

        <p className="mt-4 text-ink-secondary leading-relaxed">{renderMd(data.horoscope)}</p>

        <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3" aria-label="Today's energy">
          {DIMENSIONS.map(({ key, label }) => (
            <div key={key}>
              <div className="flex items-baseline justify-between text-xs">
                <dt className="text-ink-muted">{label}</dt>
                <dd className="font-semibold text-ink tabular-nums">{data.scores[key]}</dd>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden" aria-hidden="true">
                <div className="h-full rounded-full bg-gradient-to-r from-accent to-gold" style={{ width: `${data.scores[key]}%` }} />
              </div>
            </div>
          ))}
        </dl>
      </Card>

      <Card className="p-5">
        <p className="text-micro font-display font-extrabold uppercase tracking-[0.22em] text-ink-muted">
          {mbti ? `For a ${mbti} today` : "Your tip for today"}
        </p>
        <p className="mt-2 text-sm text-ink-secondary leading-relaxed">{renderMd(data.mbti_tip)}</p>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5">
          <p className="text-micro font-display font-extrabold uppercase tracking-[0.22em] text-ink-muted">Lucky colour</p>
          <div className="mt-3 flex items-center gap-3">
            <span
              className="size-9 rounded-full border border-hairline-strong shrink-0"
              style={{ backgroundColor: data.lucky_color.hex }}
              aria-hidden="true"
            />
            <span className="text-sm font-semibold text-ink leading-tight">{data.lucky_color.name}</span>
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-micro font-display font-extrabold uppercase tracking-[0.22em] text-ink-muted">Lucky number</p>
          <p className="mt-2 font-display font-extrabold text-4xl tracking-[-0.03em] text-gold-bright tabular-nums">
            {data.lucky_number}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5">
          <p className="text-micro font-display font-extrabold uppercase tracking-[0.22em] text-success">Do</p>
          <p className="mt-2 text-sm text-ink-secondary leading-relaxed">{data.do}</p>
        </Card>
        <Card className="p-5">
          <p className="text-micro font-display font-extrabold uppercase tracking-[0.22em] text-danger">Avoid</p>
          <p className="mt-2 text-sm text-ink-secondary leading-relaxed">{data.avoid}</p>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p
          data-testid="streak"
          className="inline-flex items-center gap-1.5 rounded-full border border-hairline-gold bg-gold/[0.06] px-3 py-1.5 text-xs font-semibold text-gold-bright"
        >
          <Flame className="size-3.5" aria-hidden="true" />
          {streak <= 1 ? "Day 1 - come back tomorrow" : `${streak}-day streak`}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void shareStory()}
            className="inline-flex items-center gap-1.5 rounded-control border border-hairline px-4 py-2 min-h-[44px] text-sm font-semibold text-ink-secondary hover:text-ink hover:border-hairline-strong transition-colors tap-highlight-none"
          >
            <ImageIcon className="size-4" aria-hidden="true" />
            Story card
          </button>
          <button
            onClick={() => void share()}
            className="inline-flex items-center gap-1.5 rounded-control border border-hairline px-4 py-2 min-h-[44px] text-sm font-semibold text-ink-secondary hover:text-ink hover:border-hairline-strong transition-colors tap-highlight-none"
          >
            <Share2 className="size-4" aria-hidden="true" />
            {shared || "Share today"}
          </button>
        </div>
      </div>
    </div>
  );
}
