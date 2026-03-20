"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

interface Props {
  onResult: (type: string) => void;
  onClose: () => void;
}

export default function MbtiQuiz({ onResult, onClose }: Props) {
  const [answers, setAnswers] = useState<Record<number, "a" | "b">>({});
  const answered = Object.keys(answers).length;
  const complete = answered === QUIZ_QUESTIONS.length;

  function pick(idx: number, choice: "a" | "b") {
    setAnswers((prev) => ({ ...prev, [idx]: choice }));
  }

  function useResult() {
    onResult(computeMbti(answers));
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl bg-white/[0.03] ring-1 ring-white/10 p-5 space-y-5"
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
                    className={`text-left text-xs px-3 py-2.5 md:py-2 rounded-lg border transition-all tap-highlight-none ${
                      selected
                        ? "border-white/40 bg-white/10 text-white"
                        : "border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-zinc-200"
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
