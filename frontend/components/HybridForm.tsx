"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import TraitRadar from "./TraitRadar";
import MbtiSelect from "./MbtiSelect";

// ---------------------------------------------------------------------------
// Shared input/select class — identical font treatment across all inputs
// ---------------------------------------------------------------------------
const INPUT =
  "w-full rounded-lg bg-zinc-900 border border-white/10 px-3 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors font-[inherit]";

const MBTI_TYPES = [
  "INTJ","INTP","ENTJ","ENTP",
  "INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ",
  "ISTP","ISFP","ESTP","ESFP",
];

// ---------------------------------------------------------------------------
// MBTI Quiz — 8 questions, 2 per dimension
// ---------------------------------------------------------------------------
interface QuizQuestion {
  dim: "EI" | "SN" | "TF" | "JP";
  a: { label: string; pole: "E" | "S" | "T" | "J" };
  b: { label: string; pole: "I" | "N" | "F" | "P" };
  question: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    dim: "EI", question: "In social situations, I tend to…",
    a: { label: "Meet and talk to many people — I enjoy the energy of the crowd", pole: "E" },
    b: { label: "Stay close to one or two people I already know", pole: "I" },
  },
  {
    dim: "EI", question: "After a long day of socialising I feel…",
    a: { label: "Energised — I want to keep going", pole: "E" },
    b: { label: "Drained — I need time alone to recharge", pole: "I" },
  },
  {
    dim: "SN", question: "When taking in information, I trust…",
    a: { label: "Concrete facts, details, and what I can see/touch", pole: "S" },
    b: { label: "Patterns, hunches, and the bigger picture", pole: "N" },
  },
  {
    dim: "SN", question: "When solving a problem I prefer…",
    a: { label: "Proven, practical, step-by-step methods", pole: "S" },
    b: { label: "Exploring new possibilities and novel angles", pole: "N" },
  },
  {
    dim: "TF", question: "When making decisions I prioritise…",
    a: { label: "Logic, objectivity, and what makes the most sense", pole: "T" },
    b: { label: "How the decision affects the people involved", pole: "F" },
  },
  {
    dim: "TF", question: "In a disagreement I'd rather be…",
    a: { label: "Right — the truth matters most", pole: "T" },
    b: { label: "Kind — the relationship matters most", pole: "F" },
  },
  {
    dim: "JP", question: "My ideal week is…",
    a: { label: "Planned in advance — I like knowing what's coming", pole: "J" },
    b: { label: "Open and flexible — I adapt as I go", pole: "P" },
  },
  {
    dim: "JP", question: "Deadlines make me feel…",
    a: { label: "Relieved — I plan ahead and finish early", pole: "J" },
    b: { label: "Motivated — pressure sparks my best work", pole: "P" },
  },
];

function computeMbti(answers: Record<number, "a" | "b">): string {
  const counts: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  QUIZ_QUESTIONS.forEach((q, i) => {
    const pick = answers[i];
    if (!pick) return;
    const pole = pick === "a" ? q.a.pole : q.b.pole;
    counts[pole]++;
  });
  return (
    (counts.E >= counts.I ? "E" : "I") +
    (counts.S >= counts.N ? "S" : "N") +
    (counts.T >= counts.F ? "T" : "F") +
    (counts.J >= counts.P ? "J" : "P")
  );
}

interface QuizProps {
  onResult: (type: string) => void;
  onClose: () => void;
}

function MbtiQuiz({ onResult, onClose }: QuizProps) {
  const [answers, setAnswers] = useState<Record<number, "a" | "b">>({});
  const answered = Object.keys(answers).length;
  const complete = answered === QUIZ_QUESTIONS.length;

  function pick(idx: number, choice: "a" | "b") {
    setAnswers((prev) => ({ ...prev, [idx]: choice }));
  }

  function useResult() {
    const type = computeMbti(answers);
    onResult(type);
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-xl border border-white/10 bg-zinc-950 p-5 space-y-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-200">Quick MBTI Finder</p>
        <button onClick={onClose} className="text-zinc-500 hover:text-white text-xs transition">✕ Close</button>
      </div>
      <p className="text-xs text-zinc-500">Answer all 8 questions — pick whichever option feels most natural to you.</p>

      <div className="space-y-4">
        {QUIZ_QUESTIONS.map((q, i) => (
          <div key={i} className="space-y-1.5">
            <p className="text-xs font-medium text-zinc-300">
              <span className="text-zinc-600 mr-1.5">{i + 1}.</span>{q.question}
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {(["a", "b"] as const).map((choice) => {
                const opt = q[choice];
                const selected = answers[i] === choice;
                return (
                  <button
                    key={choice}
                    onClick={() => pick(i, choice)}
                    className={`text-left text-xs px-3 py-2 rounded-lg border transition-all ${
                      selected
                        ? "border-white/40 bg-white/10 text-white"
                        : "border-white/8 bg-white/3 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {complete && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 pt-1">
          <span className="text-sm text-zinc-400">Your likely type:</span>
          <span className="text-white font-semibold text-base tracking-widest">{computeMbti(answers)}</span>
          <button
            onClick={useResult}
            className="ml-auto text-xs bg-white text-black px-4 py-1.5 rounded-lg font-semibold hover:bg-zinc-200 transition"
          >
            Use this type
          </button>
        </motion.div>
      )}

      {!complete && (
        <p className="text-xs text-zinc-600">{answered} / {QUIZ_QUESTIONS.length} answered</p>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Zodiac sign metadata for the deep-dive display
// ---------------------------------------------------------------------------
const ZODIAC_META: Record<string, { ruling: string; symbol: string; keywords: string[] }> = {
  Aries:       { ruling: "Mars",    symbol: "♈", keywords: ["Bold", "Driven", "Impulsive", "Courageous"] },
  Taurus:      { ruling: "Venus",   symbol: "♉", keywords: ["Grounded", "Loyal", "Stubborn", "Sensual"] },
  Gemini:      { ruling: "Mercury", symbol: "♊", keywords: ["Curious", "Witty", "Adaptable", "Restless"] },
  Cancer:      { ruling: "Moon",    symbol: "♋", keywords: ["Empathic", "Protective", "Moody", "Intuitive"] },
  Leo:         { ruling: "Sun",     symbol: "♌", keywords: ["Charismatic", "Generous", "Proud", "Creative"] },
  Virgo:       { ruling: "Mercury", symbol: "♍", keywords: ["Analytical", "Precise", "Critical", "Reliable"] },
  Libra:       { ruling: "Venus",   symbol: "♎", keywords: ["Diplomatic", "Aesthetic", "Indecisive", "Harmonious"] },
  Scorpio:     { ruling: "Pluto",   symbol: "♏", keywords: ["Intense", "Perceptive", "Private", "Transformative"] },
  Sagittarius: { ruling: "Jupiter", symbol: "♐", keywords: ["Adventurous", "Optimistic", "Direct", "Philosophical"] },
  Capricorn:   { ruling: "Saturn",  symbol: "♑", keywords: ["Disciplined", "Ambitious", "Reserved", "Patient"] },
  Aquarius:    { ruling: "Uranus",  symbol: "♒", keywords: ["Unconventional", "Visionary", "Detached", "Humanitarian"] },
  Pisces:      { ruling: "Neptune", symbol: "♓", keywords: ["Dreamy", "Compassionate", "Escapist", "Mystical"] },
};

const ELEMENT_COLOR: Record<string, string> = {
  Fire: "text-orange-400 border-orange-500/30 bg-orange-500/10",
  Earth: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  Air: "text-sky-400 border-sky-500/30 bg-sky-500/10",
  Water: "text-blue-400 border-blue-500/30 bg-blue-500/10",
};

const MBTI_GROUP: Record<string, { name: string; color: string }> = {
  INTJ: { name: "Analyst", color: "text-violet-400" }, INTP: { name: "Analyst", color: "text-violet-400" },
  ENTJ: { name: "Analyst", color: "text-violet-400" }, ENTP: { name: "Analyst", color: "text-violet-400" },
  INFJ: { name: "Diplomat", color: "text-emerald-400" }, INFP: { name: "Diplomat", color: "text-emerald-400" },
  ENFJ: { name: "Diplomat", color: "text-emerald-400" }, ENFP: { name: "Diplomat", color: "text-emerald-400" },
  ISTJ: { name: "Sentinel", color: "text-blue-400" }, ISFJ: { name: "Sentinel", color: "text-blue-400" },
  ESTJ: { name: "Sentinel", color: "text-blue-400" }, ESFJ: { name: "Sentinel", color: "text-blue-400" },
  ISTP: { name: "Explorer", color: "text-amber-400" }, ISFP: { name: "Explorer", color: "text-amber-400" },
  ESTP: { name: "Explorer", color: "text-amber-400" }, ESFP: { name: "Explorer", color: "text-amber-400" },
};

const MBTI_LETTERS: Record<string, [string, string][]> = {
  INTJ: [["I","Introvert"],["N","Intuitive"],["T","Thinking"],["J","Judging"]],
  INTP: [["I","Introvert"],["N","Intuitive"],["T","Thinking"],["P","Perceiving"]],
  ENTJ: [["E","Extrovert"],["N","Intuitive"],["T","Thinking"],["J","Judging"]],
  ENTP: [["E","Extrovert"],["N","Intuitive"],["T","Thinking"],["P","Perceiving"]],
  INFJ: [["I","Introvert"],["N","Intuitive"],["F","Feeling"],["J","Judging"]],
  INFP: [["I","Introvert"],["N","Intuitive"],["F","Feeling"],["P","Perceiving"]],
  ENFJ: [["E","Extrovert"],["N","Intuitive"],["F","Feeling"],["J","Judging"]],
  ENFP: [["E","Extrovert"],["N","Intuitive"],["F","Feeling"],["P","Perceiving"]],
  ISTJ: [["I","Introvert"],["S","Sensing"],["T","Thinking"],["J","Judging"]],
  ISFJ: [["I","Introvert"],["S","Sensing"],["F","Feeling"],["J","Judging"]],
  ESTJ: [["E","Extrovert"],["S","Sensing"],["T","Thinking"],["J","Judging"]],
  ESFJ: [["E","Extrovert"],["S","Sensing"],["F","Feeling"],["J","Judging"]],
  ISTP: [["I","Introvert"],["S","Sensing"],["T","Thinking"],["P","Perceiving"]],
  ISFP: [["I","Introvert"],["S","Sensing"],["F","Feeling"],["P","Perceiving"]],
  ESTP: [["E","Extrovert"],["S","Sensing"],["T","Thinking"],["P","Perceiving"]],
  ESFP: [["E","Extrovert"],["S","Sensing"],["F","Feeling"],["P","Perceiving"]],
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function HybridForm() {
  const [name, setName]   = useState("");
  const [day, setDay]     = useState("");
  const [month, setMonth] = useState("");
  const [mbti, setMbti]   = useState("");
  const [showQuiz, setShowQuiz] = useState(false);

  const [result, setResult]           = useState<any>(null);
  const [submittedName, setSubmittedName] = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const validate = () => {
    const d = Number(day), m = Number(month);
    if (!name.trim()) return "Enter a name.";
    if (!day || !month || !mbti) return "Fill in all fields.";
    if (d < 1 || d > 31 || m < 1 || m > 12) return "Enter a valid day (1–31) and month (1–12).";
    if (!MBTI_TYPES.includes(mbti)) return "Select a valid MBTI type.";
    return null;
  };

  const runAnalysis = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await axios.post("http://127.0.0.1:8000/hybrid-analysis", {
        name: name.trim(), day: Number(day), month: Number(month), mbti,
      });
      setResult(res.data);
      setSubmittedName(name.trim());
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Analysis failed. Check your inputs and try again.");
    }
    setLoading(false);
  };

  const zodiac    = result?.zodiac_profile;
  const mbtiProf  = result?.mbti_profile;
  const analysis  = result?.analysis;
  const traits    = zodiac?.trait_vector;
  const zodMeta   = zodiac ? ZODIAC_META[zodiac.sign] : null;
  const elemClass = zodiac ? (ELEMENT_COLOR[zodiac.element] ?? "text-white/50 border-white/10 bg-white/5") : "";
  const mbtiGroup = mbti ? (MBTI_GROUP[mbti] ?? null) : null;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* ── INPUT CARD ── */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 space-y-5">
        <h2 className="text-xl font-semibold">Self Analysis</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className={INPUT}
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="space-y-1.5">
            <MbtiSelect
              value={mbti}
              onChange={setMbti}
              placeholder="Select MBTI type"
            />
            <button
              type="button"
              onClick={() => setShowQuiz((v) => !v)}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 transition pl-1"
            >
              {showQuiz ? "▲ Hide quiz" : "▾ Don't know your type? Take a quick quiz"}
            </button>
          </div>

          <input
            className={INPUT}
            placeholder="Birth day (1–31)"
            type="number" min={1} max={31}
            value={day}
            onChange={(e) => setDay(e.target.value)}
          />
          <input
            className={INPUT}
            placeholder="Birth month (1–12)"
            type="number" min={1} max={12}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>

        <AnimatePresence>
          {showQuiz && (
            <MbtiQuiz
              onResult={(type) => setMbti(type)}
              onClose={() => setShowQuiz(false)}
            />
          )}
        </AnimatePresence>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={runAnalysis}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 disabled:opacity-40 transition"
        >
          {loading ? "Analyzing…" : "Analyze My Personality"}
        </button>
      </div>

      {/* ── RESULTS ── */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Profile header */}
            <h2 className="text-2xl font-semibold">{submittedName}&rsquo;s Profile</h2>

            {/* ── Zodiac deep-dive ── */}
            {zodiac && zodMeta && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-5">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Sun Sign</p>
                    <h3 className="text-3xl font-semibold tracking-tight">
                      {zodMeta.symbol} {zodiac.sign}
                    </h3>
                    <p className="text-sm text-zinc-500 mt-0.5">Ruled by {zodMeta.ruling}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${elemClass}`}>
                      {zodiac.element}
                    </span>
                    <span className="text-xs font-medium px-3 py-1 rounded-full border border-white/10 bg-white/5 text-zinc-300">
                      {zodiac.modality}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {zodMeta.keywords.map((kw) => (
                    <span key={kw} className="text-xs text-zinc-400 px-2.5 py-1 rounded-md bg-white/5 border border-white/8">
                      {kw}
                    </span>
                  ))}
                </div>

                {traits && (
                  <div className="space-y-2.5">
                    <p className="text-xs text-zinc-500 uppercase tracking-widest">Trait Vector</p>
                    {(Object.entries(traits) as [string, number][]).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-xs text-zinc-500 w-24 capitalize">{key}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${val * 10}%` }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="h-full rounded-full bg-white/60"
                          />
                        </div>
                        <span className="text-xs text-zinc-500 w-4 text-right">{val}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Personality Vector</p>
                  <TraitRadar a={traits} nameA={submittedName} />
                </div>
              </div>
            )}

            {/* ── MBTI deep-dive ── */}
            {mbtiProf && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">MBTI Type</p>
                    <h3 className="text-3xl font-semibold tracking-widest">{mbtiProf.type ?? mbti}</h3>
                    {mbtiGroup && (
                      <p className={`text-sm mt-0.5 ${mbtiGroup.color}`}>{mbtiGroup.name}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {(MBTI_LETTERS[mbti] ?? []).map(([letter, word]) => (
                      <div key={letter} className="flex flex-col items-center border border-white/10 bg-white/5 rounded-lg px-3 py-2 min-w-[48px]">
                        <span className="text-lg font-bold leading-none">{letter}</span>
                        <span className="text-[10px] text-zinc-500 mt-1 text-center leading-tight">{word}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── AI Analysis grid ── */}
            {analysis && (
              <div className="grid md:grid-cols-2 gap-4">
                {(
                  [
                    ["Behavioral Core",    analysis.behavioral_core],
                    ["Emotional Pattern",  analysis.emotional_pattern],
                    ["Decision Style",     analysis.decision_making_style],
                    ["Social Dynamic",     analysis.social_dynamic],
                    ["Conflict Style",     analysis.conflict_style],
                    ["Leadership",         analysis.leadership_tendency],
                  ] as [string, string][]
                ).map(([title, text]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">{title}</p>
                    <p className="text-sm text-zinc-300 leading-relaxed">{text ?? "Unavailable"}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Strengths / Growth edges ── */}
            {analysis && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <p className="text-xs text-emerald-400 uppercase tracking-wider mb-3">Strengths</p>
                  <ul className="space-y-1.5">
                    {(analysis.strengths ?? []).map((s: string, i: number) => (
                      <li key={i} className="text-sm text-zinc-300 flex gap-2">
                        <span className="text-emerald-500 mt-0.5">✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                  <p className="text-xs text-amber-400 uppercase tracking-wider mb-3">Growth Edges</p>
                  <ul className="space-y-1.5">
                    {(analysis.growth_edges ?? []).map((s: string, i: number) => (
                      <li key={i} className="text-sm text-zinc-300 flex gap-2">
                        <span className="text-amber-500 mt-0.5">→</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
