"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PersonForm from "@/components/PersonForm";
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
  personality_analysis:  "bg-purple-500/20 text-purple-300",
  compatibility_question:"bg-blue-500/20   text-blue-300",
  relationship_advice:   "bg-rose-500/20   text-rose-300",
  flirting_guidance:     "bg-pink-500/20   text-pink-300",
  communication_help:    "bg-amber-500/20  text-amber-300",
  general_question:      "bg-zinc-700/60   text-zinc-300",
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

// ── Component ─────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Hi! I'm ZodicogAI. Ask me anything about personalities, relationships, or compatibility. You can also share both profiles for more personalized insight." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showProfiles, setShowProfiles] = useState(false);
  const [personA, setPersonA] = useState<PersonData>(emptyPerson());
  const [personB, setPersonB] = useState<PersonData>(emptyPerson());
  const [profileError, setProfileError] = useState("");
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
      const body: Record<string, unknown> = { message: msg };
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
    <div className="flex h-[calc(100vh-48px)] overflow-hidden">
      {/* Sidebar — collapsible profiles */}
      <AnimatePresence>
        {showProfiles && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="shrink-0 overflow-hidden border-r border-white/10 bg-zinc-950"
          >
            <div className="w-[300px] p-4 space-y-4 overflow-y-auto h-full">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Profile Context</p>
              <PersonForm label="Person A" value={personA} onChange={setPersonA} compact />
              <PersonForm label="Person B" value={personB} onChange={setPersonB} compact />
              {profileError && <p className="text-red-400 text-xs">{profileError}</p>}
              <p className="text-xs text-zinc-600">Profiles are optional — fill in for personalised answers.</p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/8">
          <div>
            <h1 className="text-sm font-semibold">ZodicogAI Chat</h1>
            <p className="text-xs text-zinc-500">Ask anything about personalities and relationships</p>
          </div>
          <button
            onClick={() => setShowProfiles((v) => !v)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              showProfiles
                ? "bg-white/10 border-white/20 text-white"
                : "border-white/10 text-zinc-400 hover:text-white"
            }`}
          >
            {showProfiles ? "Hide Profiles" : "Add Profiles"}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "user" ? (
                  <div className="max-w-[72%] rounded-2xl rounded-tr-sm bg-white text-black px-4 py-2.5 text-sm">
                    {msg.text}
                  </div>
                ) : (
                  <div className="max-w-[78%] space-y-2">
                    <div className="rounded-2xl rounded-tl-sm bg-zinc-900 border border-white/8 px-4 py-3 text-sm text-zinc-200 leading-relaxed">
                      {msg.text}
                    </div>
                    {/* Meta row */}
                    <div className="flex items-center gap-2 pl-1 flex-wrap">
                      {msg.intent && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${INTENT_COLORS[msg.intent] ?? INTENT_COLORS.general_question}`}>
                          {formatIntent(msg.intent)}
                        </span>
                      )}
                      {msg.score && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-medium">
                          {msg.score.label}: {msg.score.value.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="rounded-2xl rounded-tl-sm bg-zinc-900 border border-white/8 px-4 py-3">
                <div className="flex gap-1.5 items-center">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-zinc-500"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-5 py-4 border-t border-white/8">
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              rows={1}
              placeholder="Ask about personalities, relationships, compatibility…"
              className="flex-1 resize-none rounded-xl bg-zinc-900 border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors max-h-32 overflow-y-auto"
              style={{ scrollbarWidth: "none" }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="shrink-0 px-4 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200 disabled:opacity-30 transition"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-zinc-600 mt-2 pl-1">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}
