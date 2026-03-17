"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import TraitRadar from "./TraitRadar";
import { API } from "@/lib/api";

export default function CompatibilityForm() {
  const [aName, setAName] = useState("");
  const [aDay, setADay] = useState("");
  const [aMonth, setAMonth] = useState("");
  const [aMbti, setAMbti] = useState("");

  const [bName, setBName] = useState("");
  const [bDay, setBDay] = useState("");
  const [bMonth, setBMonth] = useState("");
  const [bMbti, setBMbti] = useState("");

  const [result, setResult] = useState<any>(null);
  const [names, setNames] = useState({ a: "", b: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCongrats, setShowCongrats] = useState(false);

  const MBTI_TYPES = [
    "INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP",
    "ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP",
  ];

  const validate = () => {
    if (!aName.trim()) return "Enter a name for the first person.";
    if (!bName.trim()) return "Enter a name for the second person.";
    if (!aDay || !aMonth || !aMbti || !bDay || !bMonth || !bMbti)
      return "Fill in all fields for both people.";
    const aDayN = Number(aDay), aMonthN = Number(aMonth);
    const bDayN = Number(bDay), bMonthN = Number(bMonth);
    if (aDayN < 1 || aDayN > 31 || aMonthN < 1 || aMonthN > 12)
      return `${aName}: enter a valid day (1–31) and month (1–12).`;
    if (bDayN < 1 || bDayN > 31 || bMonthN < 1 || bMonthN > 12)
      return `${bName}: enter a valid day (1–31) and month (1–12).`;
    if (!MBTI_TYPES.includes(aMbti.toUpperCase()))
      return `${aName}: "${aMbti}" is not a valid MBTI type.`;
    if (!MBTI_TYPES.includes(bMbti.toUpperCase()))
      return `${bName}: "${bMbti}" is not a valid MBTI type.`;
    return null;
  };

  const runCompatibility = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setShowCongrats(false);

    try {
      const res = await axios.post(`${API}/compatibility`, {
        person_a_name: aName.trim(),
        person_a_day: Number(aDay),
        person_a_month: Number(aMonth),
        person_a_mbti: aMbti.toUpperCase(),
        person_b_name: bName.trim(),
        person_b_day: Number(bDay),
        person_b_month: Number(bMonth),
        person_b_mbti: bMbti.toUpperCase(),
      });

      const data = res.data;
      setResult(data);
      setNames({ a: aName.trim(), b: bName.trim() });

      if (data.vector_similarity_percent >= 90) {
        setShowCongrats(true);
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(detail ?? "Compatibility analysis failed. Check your inputs and try again.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">

      {/* CONGRATULATIONS POPUP */}

      <AnimatePresence>
        {showCongrats && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCongrats(false)}
          >
            <motion.div
              className="bg-zinc-900 border border-white/10 rounded-3xl p-12 max-w-md w-full mx-6 text-center shadow-2xl"
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-5xl mb-6">🎉</p>

              <h2 className="text-2xl font-semibold mb-2">
                Extraordinary Match
              </h2>

              <p className="text-zinc-400 mb-6 text-sm">
                {names.a} &amp; {names.b} are in the top tier of compatibility
              </p>

              <p className="text-6xl font-bold mb-8">
                {Math.round(result?.vector_similarity_percent ?? 0)}%
              </p>

              <p className="text-zinc-300 text-sm mb-8 leading-relaxed">
                Your personality vectors are remarkably aligned. This level of
                synergy is rare — embrace it.
              </p>

              <button
                onClick={() => setShowCongrats(false)}
                className="bg-white text-black px-8 py-2.5 rounded-full text-sm font-medium hover:opacity-90"
              >
                View Full Analysis
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INPUT */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <ProfileCard
          name={aName}
          setName={setAName}
          day={aDay}
          setDay={setADay}
          month={aMonth}
          setMonth={setAMonth}
          mbti={aMbti}
          setMbti={setAMbti}
          placeholder="First person's name"
        />

        <ProfileCard
          name={bName}
          setName={setBName}
          day={bDay}
          setDay={setBDay}
          month={bMonth}
          setMonth={setBMonth}
          mbti={bMbti}
          setMbti={setBMbti}
          placeholder="Second person's name"
        />
      </div>

      <button
        onClick={runCompatibility}
        disabled={loading}
        className="w-full bg-white text-black px-8 py-3.5 rounded-full disabled:opacity-50 font-semibold min-h-[48px] tap-highlight-none hover:opacity-90 transition"
      >
        Compute Compatibility
      </button>

      {loading && (
        <p className="text-zinc-400">Running compatibility model...</p>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {result && (
        <div className="space-y-10">
          {/* HEADER */}

          <h2 className="text-2xl font-medium">
            {names.a} &amp; {names.b}
          </h2>

          {/* SCORE */}

          <div className="bg-white/[0.03] p-8 rounded-2xl ring-1 ring-white/10 text-center">
            <h2 className="text-lg mb-3">Compatibility Score</h2>

            <p className="text-5xl font-semibold">
              {Math.round(result.vector_similarity_percent)}%
            </p>

            <p className="text-zinc-400 mt-2 text-sm">
              Element: {result.element_compatibility} • Modality:{" "}
              {result.modality_interaction}
            </p>
          </div>

          {/* RADAR */}

          <TraitRadar a={result.a_traits} b={result.b_traits} nameA={names.a} nameB={names.b} />

          {/* RELATIONSHIP INSIGHTS */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Insight
              title="Relationship Dynamic"
              text={result.relationship_dynamic}
            />
            <Insight
              title="Communication Pattern"
              text={result.communication_pattern}
            />
            <Insight title="Conflict Risk" text={result.conflict_risk} />
            <Insight
              title="Long Term Viability"
              text={result.long_term_viability}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface ProfileCardProps {
  name: string;
  setName: (v: string) => void;
  day: string;
  setDay: (v: string) => void;
  month: string;
  setMonth: (v: string) => void;
  mbti: string;
  setMbti: (v: string) => void;
  placeholder: string;
}

function ProfileCard({
  name,
  setName,
  day,
  setDay,
  month,
  setMonth,
  mbti,
  setMbti,
  placeholder,
}: ProfileCardProps) {
  return (
    <div className="bg-white/[0.03] p-5 rounded-2xl ring-1 ring-white/10 space-y-3">
      <input
        placeholder={placeholder}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-transparent text-base font-medium placeholder:text-zinc-600 outline-none border-b border-white/10 pb-2.5"
      />
      <div className="flex gap-2">
        <input
          placeholder="Day"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="w-20 md:w-16 bg-zinc-900 px-3 py-3 md:py-2 rounded-lg text-sm text-white placeholder:text-zinc-600 outline-none text-center"
          type="number"
          min={1}
          max={31}
        />
        <input
          placeholder="Mo"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-20 md:w-16 bg-zinc-900 px-3 py-3 md:py-2 rounded-lg text-sm text-white placeholder:text-zinc-600 outline-none text-center"
          type="number"
          min={1}
          max={12}
        />
        <input
          placeholder="MBTI"
          value={mbti}
          onChange={(e) => setMbti(e.target.value)}
          className="w-28 md:w-24 bg-zinc-900 px-3 py-3 md:py-2 rounded-lg text-sm text-white placeholder:text-zinc-600 outline-none uppercase"
          maxLength={4}
        />
      </div>
    </div>
  );
}

function Insight({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-white/[0.03] p-6 rounded-2xl ring-1 ring-white/10">
      <h3 className="mb-2">{title}</h3>
      <p className="text-zinc-300 text-sm">{text || "Unavailable"}</p>
    </div>
  );
}
