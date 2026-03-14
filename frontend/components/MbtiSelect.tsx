"use client";

import { useState, useRef, useEffect } from "react";
import { MBTI_TYPES } from "@/lib/api";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export default function MbtiSelect({ value, onChange, placeholder = "MBTI type", className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-lg bg-zinc-900 border border-white/10 px-3 py-3 md:py-2 text-sm text-left flex items-center focus:outline-none focus:border-white/30 transition-colors tap-highlight-none min-h-[44px]"
      >
        <span className={value ? "text-white" : "text-zinc-500"}>{value || placeholder}</span>
      </button>

      {open && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/10 rounded-lg shadow-xl overflow-y-auto max-h-52 py-1">
          {MBTI_TYPES.map((t) => (
            <li key={t}>
              <button
                type="button"
                onClick={() => { onChange(t); setOpen(false); }}
                className={`w-full text-left px-3 py-2.5 md:py-1.5 text-sm transition-colors tap-highlight-none ${
                  t === value
                    ? "bg-white/10 text-white"
                    : "text-zinc-300 hover:bg-white/[0.06]"
                }`}
              >
                {t}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
