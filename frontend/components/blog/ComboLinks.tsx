/**
 * ComboLinks - links into the 192 sign x type guides, for the zodiac and MBTI
 * guides ("Leo as every type" / "Every sign as an INTJ") and for sibling
 * navigation on the combo pages themselves. Server component, plain links.
 */
import Link from "next/link";
import { SIGN_KEYS } from "@/lib/aspects";
import { comboPath, MBTI_KEYS, signName } from "@/lib/combos";

const pill =
  "inline-flex items-center rounded-full border border-hairline bg-white/[0.03] px-3 py-1 text-xs font-medium text-ink-secondary hover:border-hairline-gold hover:text-gold-bright transition-colors tap-highlight-none";

export default function ComboLinks({
  sign,
  mbti,
  current,
  className = "",
}: {
  /** Show this sign with every type. */
  sign?: string;
  /** Show this type with every sign. */
  mbti?: string;
  /** The combo being viewed (omitted from the list), as "sign-type". */
  current?: string;
  className?: string;
}) {
  const links = sign
    ? MBTI_KEYS.map((t) => ({ href: comboPath(sign, t), label: t, key: `${sign}-${t}` }))
    : SIGN_KEYS.map((s) => ({ href: comboPath(s, mbti ?? ""), label: signName(s), key: `${s}-${mbti}` }));

  const heading = sign ? `${signName(sign)} as every type` : `Every sign as ${/^[AEIOUaeiou]/.test(mbti ?? "") ? "an" : "a"} ${mbti?.toUpperCase()}`;

  return (
    <nav aria-label={heading} className={className} data-testid="combo-links">
      <p className="font-display font-extrabold text-micro tracking-[0.22em] uppercase text-ink-muted mb-3">{heading}</p>
      <ul className="flex flex-wrap gap-2">
        {links
          .filter((l) => l.key.toLowerCase() !== (current ?? "").toLowerCase())
          .map((l) => (
            <li key={l.key}>
              <Link href={l.href} className={pill}>
                {l.label}
              </Link>
            </li>
          ))}
      </ul>
    </nav>
  );
}
