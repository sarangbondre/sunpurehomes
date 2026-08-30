import localFont from "next/font/local";

/**
 * Self-hosted so there is no third-party request on first paint.
 * Latin subsets only — the site is English-language (BRIEF.md §8).
 */

export const instrumentSerif = localFont({
  variable: "--font-instrument-serif",
  display: "swap",
  adjustFontFallback: "Times New Roman",
  fallback: ["Iowan Old Style", "Palatino", "Georgia", "serif"],
  src: [
    {
      path: "../fonts/InstrumentSerif-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/InstrumentSerif-Italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
});

export const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
  src: [
    {
      path: "../fonts/Inter-Variable.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
});

export const jetbrainsMono = localFont({
  variable: "--font-jetbrains-mono",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
  src: [
    {
      path: "../fonts/JetBrainsMono-Variable.woff2",
      weight: "100 800",
      style: "normal",
    },
  ],
});

export const fontVariables = [
  instrumentSerif.variable,
  inter.variable,
  jetbrainsMono.variable,
].join(" ");
