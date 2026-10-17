"use client";

/**
 * DailyNudge - the switch for the morning web-push notification ("Your day,
 * Pisces" + the first line of today's horoscope) with a time picker.
 *
 * Shown only where it can work: a saved profile (we need the sign), a browser
 * with web push, and a server with push keys. iPhone/iPad only deliver web
 * push to the *installed* app, so there it offers the install steps instead.
 * Permission is requested only when the switch is flipped.
 */
import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import {
  DEFAULT_HOUR,
  disablePush,
  enablePush,
  pushState,
  savedHour,
  setPushHour,
  type PushState,
} from "@/lib/push";
import { requestInstall, useInstall } from "@/lib/install";
import { isProfileComplete, useProfile } from "@/lib/profile";
import { getSign } from "@/lib/zodiac";
import { capture } from "@/lib/posthog";
import { haptic } from "@/lib/haptics";

const hourLabel = (h: number) => new Date(2000, 0, 1, h).toLocaleTimeString([], { hour: "numeric" });

export default function DailyNudge({ className = "" }: { className?: string }) {
  const profile = useProfile();
  const install = useInstall();
  const [state, setState] = useState<PushState>("loading");
  const [hour, setHour] = useState(DEFAULT_HOUR);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const ready = !!profile && isProfileComplete(profile);
  const ios = install.platform.startsWith("ios");
  const installed = install.status === "installed";
  const installKnown = install.status !== "loading";

  const nudge = ready && profile ? { sign: getSign(profile.day, profile.month), mbti: profile.mbti } : null;

  const refresh = useCallback(async () => {
    setState(await pushState({ ios, installed }));
  }, [ios, installed]);

  useEffect(() => {
    if (!ready || !installKnown) return;
    setHour(savedHour());
    void refresh();
  }, [ready, installKnown, refresh]);

  if (!nudge || state === "loading" || state === "unsupported" || state === "unconfigured") return null;

  async function toggle() {
    if (!nudge) return;
    haptic();
    setBusy(true);
    setError("");
    try {
      if (state === "on") {
        await disablePush();
        capture("push_unsubscribed");
        setState("off");
      } else {
        const result = await enablePush(nudge, hour);
        if (result === "on") capture("push_subscribed", { hour });
        setState(result);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't change the nudge.");
    } finally {
      setBusy(false);
    }
  }

  async function changeHour(h: number) {
    setHour(h);
    if (state !== "on" || !nudge) return;
    setError("");
    try {
      await setPushHour(nudge, h);
      capture("push_hour_changed", { hour: h });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't change the time.");
    }
  }

  const on = state === "on";

  return (
    <Card variant={on ? "gold" : "default"} className={`p-5 ${className}`} data-testid="daily-nudge">
      <p className="flex items-center gap-2 font-display font-extrabold text-base tracking-[-0.01em] text-ink">
        {on ? <Bell className="size-4 text-gold-bright" aria-hidden="true" /> : <BellOff className="size-4 text-ink-muted" aria-hidden="true" />}
        Daily nudge
      </p>
      <p className="mt-2 text-sm text-ink-secondary leading-relaxed">
        A short notification each morning with the first line of your horoscope. One tap opens your day.
      </p>

      {state === "needs-install" && (
        <div className="mt-3">
          <p className="text-sm text-ink-secondary">
            On iPhone and iPad, notifications come from the installed app. Add ZodicogAI to your Home Screen first.
          </p>
          <button
            onClick={() => void requestInstall()}
            className="mt-2 text-sm font-semibold text-accent-bright hover:text-gold-bright transition-colors"
          >
            Show me how →
          </button>
        </div>
      )}

      {state === "denied" && (
        <p role="status" className="mt-3 text-sm text-ink-muted">
          Notifications are blocked for this site. Allow them in your browser&apos;s site settings, then come back.
        </p>
      )}

      {(state === "off" || state === "on") && (
        <div className="mt-4 flex items-center gap-4 flex-wrap">
          <Switch label="Daily nudge" checked={on} onChange={() => void toggle()} disabled={busy} />
          <label className="flex items-center gap-2 text-sm text-ink-secondary">
            at
            <select
              aria-label="Nudge time"
              value={hour}
              onChange={(e) => void changeHour(Number(e.target.value))}
              className="rounded-control bg-surface-raised border border-hairline px-2.5 py-1.5 text-sm text-ink font-[inherit]"
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>{hourLabel(h)}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {on && (
        <p className="mt-3 text-xs text-ink-muted" data-testid="nudge-confirm">
          You&apos;ll get it around {hourLabel(hour)} your time.
        </p>
      )}
      {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
    </Card>
  );
}
