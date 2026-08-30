/**
 * "plots" → "Plot". The content model stores a plural unit noun (§7); the
 * drawer and the shortlist need the singular, capitalised.
 */
export function singularNoun(plural: string): string {
  const singular = plural.endsWith("ies")
    ? `${plural.slice(0, -3)}y`
    : plural.endsWith("s")
      ? plural.slice(0, -1)
      : plural;
  return singular.charAt(0).toUpperCase() + singular.slice(1);
}

/** "apartment" -> "an apartment", "plot" -> "a plot". */
export function withArticle(noun: string): string {
  return `${/^[aeiou]/i.test(noun) ? "an" : "a"} ${noun}`;
}
