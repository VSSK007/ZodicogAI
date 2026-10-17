"use client";

/**
 * Switch - an on/off toggle (role="switch"). The label is for assistive tech;
 * put the visible text beside it.
 */
export function Switch({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors disabled:opacity-50 tap-highlight-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 ${
        checked ? "bg-gold border-gold" : "bg-white/[0.06] border-hairline-strong"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${checked ? "left-[1.35rem]" : "left-0.5"}`}
      />
    </button>
  );
}
