/**
 * Prints what Arka is told, so a person can read it before trusting it.
 *
 *   npx tsx scripts/print-arka-corpus.ts            the index and every record
 *   npx tsx scripts/print-arka-corpus.ts curve      the prompt for one project
 */
import { PORTFOLIO_INDEX, allBriefs, getBrief } from "@/lib/chatbot/corpus";
import { systemPrompt } from "@/lib/chatbot/persona";

const slug = process.argv[2];
if (slug) {
  const brief = getBrief(slug);
  if (!brief) {
    console.error(`No project "${slug}".`);
    process.exit(1);
  }
  console.log(systemPrompt([brief]));
} else {
  console.log(PORTFOLIO_INDEX, "\n");
  for (const b of allBriefs()) console.log(b.text, "\n");
}

// A rough token count: ~4 characters per token for English.
const sizes = allBriefs().map((b) => [b.slug, Math.round(b.text.length / 4)] as const);
console.error("\napprox tokens per record:", Object.fromEntries(sizes));
console.error("approx tokens, rules + index:", Math.round(systemPrompt([]).length / 4));
