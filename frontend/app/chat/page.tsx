"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PersonForm from "@/components/PersonForm";
import ZodicognacMark from "@/components/ZodicognacMark";
import MobileChatSheet from "@/components/MobileChatSheet";
import { useIsMobile } from "@/hooks/useIsMobile";
import { PersonData, emptyPerson, validatePerson, toPerson, apiFetch } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatResponse { intent: string; response: string; data: Record<string, unknown>; }

interface Message {
  role: "user" | "ai";
  text: string;
  intent?: string;
  score?: { label: string; value: number } | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const INTENT_COLORS: Record<string, string> = {
  personality_analysis:      "bg-purple-500/20  text-purple-300",
  compatibility_question:    "bg-blue-500/20    text-blue-300",
  relationship_advice:       "bg-rose-500/20    text-rose-300",
  flirting_guidance:         "bg-pink-500/20    text-pink-300",
  communication_help:        "bg-amber-500/20   text-amber-300",
  sextrology:                "bg-red-500/20     text-red-300",
  general_question:          "bg-zinc-700/60    text-zinc-300",
  signal_reading:            "bg-cyan-500/20    text-cyan-300",
  first_date_coaching:       "bg-emerald-500/20 text-emerald-300",
  red_flags_green_flags:     "bg-orange-500/20  text-orange-300",
  getting_them_back:         "bg-violet-500/20  text-violet-300",
  attachment_style_coaching: "bg-sky-500/20     text-sky-300",
  commitment_progression:    "bg-teal-500/20    text-teal-300",
};

const INTENT_LABELS: Record<string, string> = {
  personality_analysis:      "Personality",
  compatibility_question:    "Compatibility",
  relationship_advice:       "Relationship Advice",
  flirting_guidance:         "Flirting",
  communication_help:        "Communication",
  sextrology:                "Sextrology",
  general_question:          "General",
  signal_reading:            "Signal Reading",
  first_date_coaching:       "First Date",
  red_flags_green_flags:     "Red/Green Flags",
  getting_them_back:         "Getting Them Back",
  attachment_style_coaching: "Attachment Style",
  commitment_progression:    "Commitment",
};

function topScore(data: Record<string, unknown>): { label: string; value: number } | null {
  const checks: [string, string][] = [
    ["vector_similarity_percent",   "Compatibility"],
    ["romantic_compatibility_score","Romantic"],
    ["emotional_compatibility_score","Emotional"],
    ["sexual_compatibility_score",  "Intimacy"],
    ["love_style_compatibility_score","Love Style"],
    ["love_language_compatibility_score","Love Language"],
  ];
  for (const [key, label] of checks) {
    if (typeof data[key] === "number") return { label, value: data[key] as number };
  }
  return null;
}

function formatIntent(intent: string) {
  return intent.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Markdown renderer ─────────────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode[] {
  // Split on **bold**, *italic*, [text](url) links, and bare https:// URLs
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s)]+)/);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i} className="italic">{part.slice(1, -1)}</em>;
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch)
      return (
        <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer"
          className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors">
          {linkMatch[1]}
        </a>
      );
    if (part.startsWith("http://") || part.startsWith("https://"))
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer"
          className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors break-all">
          {part}
        </a>
      );
    return part;
  });
}

function SectionHeading({ text, first }: { text: string; first: boolean }) {
  return (
    <div className={`${first ? "mt-1" : "mt-5"} mb-3`}>
      {!first && <div className="w-full h-px bg-white/[0.07] mb-4" />}
      <span className="inline-block text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full bg-amber-500/[0.08] text-amber-400/80 border border-amber-500/[0.15]">
        {text}
      </span>
    </div>
  );
}

function BulletItem({ raw }: { raw: string }) {
  // Detect "**Title** — description" or "**Title**: description" pattern
  const titleMatch = raw.match(/^\*\*([^*]+)\*\*\s*[-—–:]\s*([\s\S]*)/);
  if (titleMatch) {
    return (
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3 space-y-1.5">
        <p className="text-white font-semibold text-sm">{titleMatch[1]}</p>
        <p className="text-zinc-400 text-sm leading-relaxed">{renderInline(titleMatch[2])}</p>
      </div>
    );
  }
  return (
    <div className="flex gap-3 items-start">
      <span className="shrink-0 mt-[5px] w-1.5 h-1.5 rounded-full bg-white/20" />
      <span className="text-zinc-300 text-sm leading-relaxed">{renderInline(raw)}</span>
    </div>
  );
}

function isHeading(line: string) {
  return /^#{2,4}\s/.test(line.trim());
}
function headingText(line: string) {
  return line.trim().replace(/^#{2,4}\s+/, "");
}

function renderLines(lines: string[]) {
  return lines.map((line, j) => {
    const t = line.trim();
    if (!t) return null;
    if (/^[-*•]\s/.test(t))
      return <BulletItem key={j} raw={t.replace(/^[-*•]\s+/, "")} />;
    if (/^\d+\.\s/.test(t))
      return (
        <div key={j} className="flex gap-3 items-start">
          <span className="shrink-0 text-amber-400/50 text-xs font-semibold mt-0.5 tabular-nums min-w-[1.25rem]">
            {t.match(/^(\d+)\./)?.[1]}.
          </span>
          <span className="text-zinc-300 leading-relaxed">{renderInline(t.replace(/^\d+\.\s+/, ""))}</span>
        </div>
      );
    return <p key={j} className="text-zinc-300 leading-relaxed">{renderInline(t)}</p>;
  });
}

function MarkdownText({ text }: { text: string }) {
  // Ensure headings always have a blank line before AND after them
  const normalised = text
    .replace(/\n(#{2,4}\s)/g, "\n\n$1")           // blank line before heading
    .replace(/(#{2,4}\s[^\n]+)\n(?!\n)/g, "$1\n\n"); // blank line after heading
  const blocks = normalised.split(/\n\n+/);
  let sectionCount = 0;

  const rendered = blocks.map((block, i) => {
    const lines = block.split("\n").filter((l) => l.trim());
    if (lines.length === 0) return null;

    // Heading-only block (## / ### / ####)
    if (lines.length === 1 && isHeading(lines[0])) {
      const heading = <SectionHeading key={i} text={headingText(lines[0])} first={sectionCount === 0} />;
      sectionCount++;
      return heading;
    }

    // Block that starts with a heading then has content below
    if (isHeading(lines[0])) {
      const ht = headingText(lines[0]);
      const rest = lines.slice(1);
      const isFirst = sectionCount === 0;
      sectionCount++;
      return (
        <div key={i}>
          <SectionHeading text={ht} first={isFirst} />
          <div className="space-y-2">{renderLines(rest)}</div>
        </div>
      );
    }

    // Pure bullet or numbered list
    const isList = lines.every((l) => /^[-*•]\s/.test(l.trim()) || /^\d+\.\s/.test(l.trim()));
    if (isList) {
      return <div key={i} className="space-y-2">{renderLines(lines)}</div>;
    }

    // Plain text — render each line as its own paragraph so nothing clumps
    if (lines.length > 1) {
      return <div key={i} className="space-y-2">{renderLines(lines)}</div>;
    }

    return <p key={i} className="text-zinc-300 leading-relaxed">{renderInline(lines[0])}</p>;
  });

  return <div className="space-y-2">{rendered}</div>;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "I'm Zodicognac. I've been studying people — how they attract, fight, fall apart, and fall back in — since before I had words for it. Ask me something real. Add your profiles in the sidebar and I'll ground everything in your actual signs and MBTI." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showProfiles, setShowProfiles] = useState(false);
  const [personA, setPersonA] = useState<PersonData>(emptyPerson());
  const [personB, setPersonB] = useState<PersonData>(emptyPerson());
  const [profileError, setProfileError] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");

    // Validate profiles only if they have any data filled
    const aFilled = personA.name || personA.day || personA.month || personA.mbti;
    const bFilled = personB.name || personB.day || personB.month || personB.mbti;
    let profileA: Record<string, unknown> | null = null;
    let profileB: Record<string, unknown> | null = null;

    if (aFilled) {
      const err = validatePerson(personA, "Person A");
      if (err) { setProfileError(err); return; }
      profileA = toPerson(personA) as unknown as Record<string, unknown>;
    }
    if (bFilled) {
      const err = validatePerson(personB, "Person B");
      if (err) { setProfileError(err); return; }
      profileB = toPerson(personB) as unknown as Record<string, unknown>;
    }
    setProfileError("");

    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setLoading(true);

    try {
      // Send last 6 messages (3 exchanges) as history, skipping the initial welcome
      const history = messages
        .filter((m) => m.role === "user" || (m.role === "ai" && m.text !== messages[0].text))
        .slice(-6)
        .map((m) => ({ role: m.role, text: m.text }));

      const body: Record<string, unknown> = { message: msg, history };
      if (profileA) body.person_a = profileA;
      if (profileB) body.person_b = profileB;

      const res = await apiFetch<ChatResponse>("/chat", body);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: res.response,
          intent: res.intent,
          score: topScore(res.data),
        },
      ]);
    } catch (e: unknown) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: `Sorry, something went wrong: ${(e as Error).message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div className="flex h-[calc(100dvh)] md:h-[calc(100vh-48px)] overflow-hidden bg-[#0a0a0a]">

      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <AnimatePresence>
          {showProfiles && (
            <motion.aside
            initial={{ x: -288, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -288, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="shrink-0 w-72 border-r border-white/[0.05] bg-[#0d0d0f] flex flex-col overflow-hidden"
          >
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="flex items-center gap-2 mb-2">
                <ZodicognacMark size={16} active />
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Profiles</p>
              </div>
              <PersonForm label="Person A" value={personA} onChange={(v) => { setPersonA(v); setProfileSaved(false); }} compact />
              <PersonForm label="Person B" value={personB} onChange={(v) => { setPersonB(v); setProfileSaved(false); }} compact />
              {profileError && <p className="text-red-400 text-xs mt-1">{profileError}</p>}
              <button
                onClick={() => {
                  const aFilled = personA.name || personA.day || personA.month || personA.mbti;
                  const bFilled = personB.name || personB.day || personB.month || personB.mbti;
                  if (aFilled) {
                    const err = validatePerson(personA, "Person A");
                    if (err) { setProfileError(err); return; }
                  }
                  if (bFilled) {
                    const err = validatePerson(personB, "Person B");
                    if (err) { setProfileError(err); return; }
                  }
                  setProfileError("");
                  setProfileSaved(true);
                }}
                className="w-full py-2 rounded-xl text-xs font-semibold transition-all duration-200 border bg-amber-500/[0.08] border-amber-500/25 text-amber-400 hover:bg-amber-500/[0.16] hover:border-amber-500/45"
              >
                {profileSaved ? "✓ Profiles saved" : "Save Profiles"}
              </button>
              <p className="text-[11px] text-zinc-700 leading-relaxed">
                Optional — grounds every answer in specific zodiac & MBTI data.
              </p>
            </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile bottom sheet for profiles */}
      <MobileChatSheet
        isOpen={showProfiles && isMobile}
        onClose={() => setShowProfiles(false)}
        personA={personA}
        personB={personB}
        onChangeA={(v) => { setPersonA(v); setProfileSaved(false); }}
        onChangeB={(v) => { setPersonB(v); setProfileSaved(false); }}
        onSave={() => {
          const aFilled = personA.name || personA.day || personA.month || personA.mbti;
          const bFilled = personB.name || personB.day || personB.month || personB.mbti;
          if (aFilled) {
            const err = validatePerson(personA, "Person A");
            if (err) { setProfileError(err); return; }
          }
          if (bFilled) {
            const err = validatePerson(personB, "Person B");
            if (err) { setProfileError(err); return; }
          }
          setProfileError("");
          setProfileSaved(true);
        }}
        profileError={profileError}
        profileSaved={profileSaved}
      />

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/[0.08] border border-amber-500/[0.16] flex items-center justify-center select-none">
              <ZodicognacMark size={18} active={true} />
            </div>
            <span className="text-sm font-semibold text-white tracking-tight">Zodicognac</span>
            <span className="text-zinc-700 text-xs select-none">·</span>
            <span className="text-[11px] text-zinc-600">No filter. All insight.</span>
          </div>
          <button
            onClick={() => setShowProfiles((v) => !v)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
              showProfiles
                ? "bg-white/[0.06] border-white/[0.12] text-zinc-300"
                : "border-white/[0.07] text-zinc-600 hover:text-zinc-300 hover:border-white/[0.12]"
            }`}
          >
            {showProfiles ? "Close" : "Profiles"}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#27272a transparent" }}>
          <div className="max-w-[720px] mx-auto px-4 md:px-5 py-4 md:py-6 space-y-6 md:space-y-8">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {msg.role === "ai" ? (
                    <div className="flex gap-4 items-start">
                      <div className="shrink-0 w-7 h-7 rounded-lg bg-amber-500/[0.08] border border-amber-500/[0.14] flex items-center justify-center select-none mt-0.5">
                        <ZodicognacMark size={16} active />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2.5">
                        <div className="text-sm text-zinc-300 leading-[1.75]">
                          <MarkdownText text={msg.text} />
                        </div>
                        {(msg.intent || msg.score) && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {msg.intent && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${INTENT_COLORS[msg.intent] ?? INTENT_COLORS.general_question}`}>
                                {INTENT_LABELS[msg.intent] ?? formatIntent(msg.intent)}
                              </span>
                            )}
                            {msg.score && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-600 border border-white/[0.06] font-medium">
                                {msg.score.label} {msg.score.value.toFixed(1)}%
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <div className="max-w-[82%] md:max-w-[72%] bg-[#18181c] border border-white/[0.08] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm text-zinc-200 leading-relaxed">
                        {msg.text}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 items-start"
              >
                <div className="shrink-0 w-7 h-7 rounded-lg bg-amber-500/[0.08] border border-amber-500/[0.14] flex items-center justify-center select-none mt-0.5">
                  <ZodicognacMark size={16} active />
                </div>
                <div className="flex gap-1.5 items-center pt-2">
                  {[0, 1, 2].map((j) => (
                    <motion.span
                      key={j}
                      className="w-1.5 h-1.5 rounded-full bg-zinc-600 block"
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                      transition={{ duration: 1.1, delay: j * 0.16, repeat: Infinity }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Composer */}
        <div className="shrink-0 px-5 py-5">
          <div className="max-w-[720px] mx-auto">
            <div className="relative rounded-2xl bg-[#111114] border border-white/[0.09] focus-within:border-white/[0.17] transition-colors shadow-xl shadow-black/50">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                rows={1}
                placeholder="Ask about personalities, compatibility, attraction, intimacy…"
                className="w-full resize-none bg-transparent px-5 pt-4 pb-12 text-sm text-white placeholder-zinc-600 focus:outline-none leading-relaxed max-h-44 overflow-y-auto"
                style={{ scrollbarWidth: "none" }}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <span className="text-[10px] text-zinc-700 hidden sm:block">⏎ send</span>
                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="w-8 h-8 rounded-xl bg-white/[0.07] border border-white/[0.1] text-zinc-400 flex items-center justify-center hover:bg-white/[0.12] hover:text-white hover:border-white/[0.18] active:scale-95 disabled:opacity-20 transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
