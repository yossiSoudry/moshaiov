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
    // Standalone dev/utility scripts (plain Node, use require()):
    "test-zones.js",
    "test-zone-names.js",
  ]),
  {
    // The React Compiler rules from eslint-plugin-react-hooks v7 (pulled in by
    // eslint-config-next 16.2) are newly enforced. Surface them as warnings so
    // they don't block lint while the existing components are migrated
    // incrementally — refactoring working production code under these rules is
    // a separate, deliberate effort.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
    },
  },
]);

export default eslintConfig;
