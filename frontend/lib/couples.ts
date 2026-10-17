/**
 * Publicly documented couples whose zodiac-compatibility page may be indexed by
 * search engines.
 *
 * SHIPS EMPTY ON PURPOSE. Add an entry only for a pair whose relationship is
 * publicly documented, and always with a `source` URL that documents it. The
 * owner approves every entry. Do not add anyone from memory, rumour or
 * tabloid speculation: a wrong entry is a false claim about two real people.
 *
 * The pages themselves never say the two people are, were or might be a couple.
 * They are titled "Zodiac compatibility: A & B" and describe two signs and two
 * sets of numbers. Being on this list only changes whether a page is indexable
 * and listed in the sitemap: every other pair stays `noindex`.
 *
 *   { a: "slug-one", b: "slug-two", source: "https://..." }
 *
 * Slugs are the ones in lib/celebrities.ts; the order of a and b doesn't matter.
 */
export interface Couple {
  a: string;
  b: string;
  source: string;
}

export const COUPLES: Couple[] = [];

/** One canonical order per pair, so /a/b and /b/a are the same page for indexing and the sitemap. */
export function orderedPair(a: string, b: string): [string, string] {
  return a <= b ? [a, b] : [b, a];
}

export const comparePath = (a: string, b: string) => {
  const [x, y] = orderedPair(a, b);
  return `/celebrities/compare/${x}/${y}`;
};

/** The listed couple for this pair (either order), if any. */
export function listedCouple(a: string, b: string, list: Couple[] = COUPLES): Couple | undefined {
  const [x, y] = orderedPair(a, b);
  return list.find((c) => {
    const [p, q] = orderedPair(c.a, c.b);
    return p === x && q === y;
  });
}

/** Robots directive for a comparison page: indexable only for a listed couple. */
export function compareRobots(a: string, b: string, list: Couple[] = COUPLES): { index: boolean; follow: boolean } {
  return { index: !!listedCouple(a, b, list), follow: true };
}

/** Canonical paths of the listed couples, for the sitemap. */
export function listedComparePaths(list: Couple[] = COUPLES): string[] {
  return [...new Set(list.map((c) => comparePath(c.a, c.b)))];
}

/** Problems with a couples list (empty array = fine). Used by the test suite on COUPLES. */
export function validateCouples(list: Couple[], knownSlugs: Set<string>): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const c of list) {
    const label = `${c.a} & ${c.b}`;
    if (!knownSlugs.has(c.a) || !knownSlugs.has(c.b)) problems.push(`${label}: unknown celebrity slug`);
    if (c.a === c.b) problems.push(`${label}: a person cannot be coupled with themselves`);
    if (!/^https:\/\/\S+$/.test(c.source ?? "")) problems.push(`${label}: needs an https source URL that documents it`);
    const key = orderedPair(c.a, c.b).join("|");
    if (seen.has(key)) problems.push(`${label}: listed twice`);
    seen.add(key);
  }
  return problems;
}
