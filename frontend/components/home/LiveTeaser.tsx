"use client";

/**
 * LiveTeaser — "What's your sign really like?" Pick a birth date and get an
 * instant, fully client-side sign read (zero AI cost), with a CTA into the
 * full zodiac reading.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import RevealOnScroll from "@/components/RevealOnScroll";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Glyph, Star4 } from "@/components/ui/glyphs";
import { getSign, SIGN_META, ELEMENT_COLOR } from "@/lib/zodiac";
import { EASE } from "@/lib/motion";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const INPUT =
  "bg-surface-raised border border-hairline rounded-control px-3 py-2.5 text-sm text-ink " +
  "placeholder:text-ink-faint focus:outline-none focus:border-hairline-accent transition-colors";

export default function LiveTeaser() {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");

  const sign = useMemo(() => {
    const d = Number(day), m = Number(month);
    if (!d || !m || d < 1 || d > 31 || m < 1 || m > 12) return null;
    return getSign(d, m);
  }, [day, month]);

  const meta = sign ? SIGN_META[sign] : null;

  return (
    <section className="max-w-6xl mx-auto px-6 pt-24">
      <RevealOnScroll>
        <div className="rounded-card border border-hairline bg-white/[0.02] p-7 md:p-10 grid md:grid-cols-2 gap-9 items-center">
          <div>
            <SectionHeader
              eyebrow="Try it now"
              title="What's your sign really like?"
              sub="Pick your birth date — the sign read is instant and computed right here, no AI involved."
            />
            <div className="mt-6 flex gap-2.5">
              <input
                className={`${INPUT} w-20 text-center`}
                placeholder="Day"
                type="number"
                min={1}
                max={31}
                value={day}
                onChange={(e) => setDay(e.target.value)}
                aria-label="Birth day"
              />
              <select
                className={`${INPUT} w-32`}
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                aria-label="Birth month"
              >
                <option value="">Month</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="min-h-[200px] flex items-center">
            <AnimatePresence mode="wait">
              {sign && meta ? (
                <motion.div
                  key={sign}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="w-full rounded-card border border-hairline-accent bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-6"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex size-13 shrink-0 items-center justify-center rounded-card border border-hairline-gold bg-gold/5 text-gold-bright">
                      <Glyph name={meta.glyph} size={26} />
                    </span>
                    <div>
                      <p className="font-display font-extrabold text-xl tracking-[-0.02em] text-ink">{sign}</p>
                      <p className="text-xs text-ink-muted">
                        <span style={{ color: ELEMENT_COLOR[meta.element] }}>{meta.element}</span>
                        <span className="mx-1.5">·</span>{meta.modality}
                        <span className="mx-1.5">·</span>{meta.dates}
                      </p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {meta.traits.map((t) => (
                      <li key={t} className="flex items-start gap-2 text-[13.5px] text-ink-secondary leading-relaxed">
                        <Star4 size={9} className="text-gold mt-1.5 shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/analyze/zodiac"
                    className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent-bright hover:text-gold-bright transition-colors"
                  >
                    Get the full reading →
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full rounded-card border border-dashed border-hairline p-6 text-center"
                >
                  <Star4 size={14} className="text-ink-faint mx-auto" />
                  <p className="mt-2.5 text-sm text-ink-muted">Your sign appears here</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
