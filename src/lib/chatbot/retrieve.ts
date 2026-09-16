import { allBriefs, type ProjectBrief } from "@/lib/chatbot/corpus";
import { slugFromPath } from "@/lib/chatbot/paths";

/**
 * Which project records go into the prompt for this turn.
 *
 * Deliberately not semantic search. There are nine records and they read
 * alike — two apartment blocks and four villa communities in the same
 * neighbourhood — which is exactly where embeddings return Curve's floor areas
 * for a question about H4, and the answer looks right. Matching a project's
 * name cannot make that mistake.
 *
 * Priority, first match wins:
 *   1. projects named in the question being asked now;
 *   2. projects named in the last few turns, so "does it have a gym?" keeps
 *      its subject;
 *   3. the project whose page the visitor is reading.
 * Nothing matched means no records, and the prompt carries only the index —
 * enough to answer "which villas do you have?" and to ask which one they mean.
 */

export const MAX_PROJECTS = 3;
const HISTORY_TURNS = 4;

function normalise(text: string): string {
  return ` ${text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()} `;
}

function mentioned(text: string, briefs: readonly ProjectBrief[]): string[] {
  const haystack = normalise(text);
  const hits: { slug: string; at: number }[] = [];
  for (const brief of briefs) {
    let first = Infinity;
    for (const alias of brief.aliases) {
      // Padded with spaces on both sides, so aliases only match whole words.
      const at = haystack.indexOf(normalise(alias));
      if (at !== -1 && at < first) first = at;
    }
    if (first !== Infinity) hits.push({ slug: brief.slug, at: first });
  }
  // In the order the visitor wrote them.
  return hits.sort((a, b) => a.at - b.at).map((h) => h.slug);
}

export function retrieve(input: {
  question: string;
  /** Earlier user turns, oldest first. */
  history: readonly string[];
  pagePath?: string;
  briefs?: readonly ProjectBrief[];
}): string[] {
  const briefs = input.briefs ?? allBriefs();
  const known = new Set(briefs.map((b) => b.slug));

  const now = mentioned(input.question, briefs);
  if (now.length) return now.slice(0, MAX_PROJECTS);

  const recent = input.history.slice(-HISTORY_TURNS);
  for (let i = recent.length - 1; i >= 0; i--) {
    const earlier = mentioned(recent[i], briefs);
    if (earlier.length) return earlier.slice(0, MAX_PROJECTS);
  }

  const page = slugFromPath(input.pagePath);
  return page && known.has(page) ? [page] : [];
}
