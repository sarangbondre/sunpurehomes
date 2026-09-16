/**
 * Words the widget shows that the model never writes. Browser-safe: no
 * imports, so the widget can take these without pulling in the corpus.
 */

export const GREETING =
  "Hi, I'm Arka. Ask me about Sunpure's projects — what's there, where, and what's included. I can't quote prices, but I can put you in touch with the team who can.";

export const UNAVAILABLE =
  "I can't answer right now. The sales team can help straight away:";

export const LIMITED =
  "That's a lot of questions in a short time — the sales team can take it from here:";

export const SUGGESTIONS = [
  "What projects do you have?",
  "What's near Rare Earth?",
  "Can I visit a site?",
] as const;

/*
  On a project's own page. The visit question stays: it is the shortest route
  to a lead, and the page is where someone is most likely to want one.
*/
export function projectSuggestions(name: string): readonly string[] {
  return [`Tell me about ${name}`, "What's nearby?", "Can I visit a site?"];
}
