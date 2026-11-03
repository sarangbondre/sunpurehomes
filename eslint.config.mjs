import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/*
  Flat config, taken straight from the package.

  Until Next 16 these two were pulled in through FlatCompat, the bridge that
  reads an old-style `extends` list. eslint-config-next 16 ships flat config
  itself, and putting flat config through that bridge throws before any file
  is linted ("Converting circular structure to JSON"). Both entry points are
  plain arrays now, so they are spread in directly and @eslint/eslintrc is
  gone from the tree.
*/
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      // `npm run build:verify` writes here so builds cannot clobber the
      // running dev server. It is generated output, same as .next.
      ".next-verify/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
