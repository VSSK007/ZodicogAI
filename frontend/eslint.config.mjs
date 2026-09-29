import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // React Compiler's strict rule; a handful of older effects (mobile
      // detection, localStorage reads) predate it. Kept visible as a warning
      // until they're refactored, so CI fails on real errors only.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
