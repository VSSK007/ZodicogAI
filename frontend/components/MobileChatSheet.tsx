"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import PersonForm from "./PersonForm";
import { PersonData } from "@/lib/api";

interface MobileChatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  personA?: PersonData;
  personB?: PersonData;
  onChangeA: (person: PersonData) => void;
  onChangeB: (person: PersonData) => void;
  onSave: () => void;
  profileError?: string;
  profileSaved?: boolean;
}

/**
 * Bottom sheet for chat profiles on mobile.
 * Slides up from bottom, contains PersonForm for both persons.
 */
export default function MobileChatSheet({
  isOpen,
  onClose,
  personA,
  personB,
  onChangeA,
  onChangeB,
  onSave,
  profileError,
  profileSaved,
}: MobileChatSheetProps) {
  // Toggle body.sheet-open class to prevent scroll bleed
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("sheet-open");
    } else {
      document.body.classList.remove("sheet-open");
    }
    return () => document.body.classList.remove("sheet-open");
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 md:hidden h-[85vh] rounded-t-3xl bg-[#09091a] border-t border-white/[0.08] overflow-y-auto scrollbar-none"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center sticky top-0 pt-3 pb-1 bg-[#09091a]">
              <div className="w-10 h-1 rounded-full bg-white/[0.12]" />
            </div>

            {/* Title */}
            <div className="px-5 pt-2 pb-4 border-b border-white/[0.06]">
              <h2 className="text-lg font-semibold text-white">Profiles</h2>
            </div>

            {/* Forms */}
            <div className="px-4 py-5 space-y-5">
              {personA && (
                <div>
                  <h3 className="text-sm font-medium text-white/60 mb-3">Person A</h3>
                  <PersonForm
                    label="Person A"
                    value={personA}
                    onChange={onChangeA}
                  />
                </div>
              )}

              {personB && (
                <div>
                  <h3 className="text-sm font-medium text-white/60 mb-3">Person B</h3>
                  <PersonForm
                    label="Person B"
                    value={personB}
                    onChange={onChangeB}
                  />
                </div>
              )}

              {/* Error message */}
              {profileError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300">
                  {profileError}
                </div>
              )}

              {/* Success message */}
              {profileSaved && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-300">
                  ✓ Profiles saved
                </div>
              )}
            </div>

            {/* Save button — sticky at bottom */}
            <div className="sticky bottom-0 px-4 py-4 bg-gradient-to-t from-[#09091a] to-[#09091a]/0 pb-safe">
              <button
                onClick={onSave}
                className="w-full py-3.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-100 transition-all tap-highlight-none min-h-[48px]"
              >
                Save Profiles
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
