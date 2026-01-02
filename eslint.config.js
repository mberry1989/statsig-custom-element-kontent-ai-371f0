import kontentAiConfig from "@kontent-ai/eslint-config";
import kontentAiReactConfig from "@kontent-ai/eslint-config/react";
import { defineConfig } from "eslint/config";

// Formatting rules are disabled since we use Biome for formatting
const formattingRulesOff = {
  "react/jsx-max-props-per-line": "off",
  "react/jsx-first-prop-new-line": "off",
  "react/jsx-closing-bracket-location": "off",
};

export default defineConfig([
  {
    ignores: [
      "dist/**",
      ".netlify/**",
      "example-client/dist/**",
      "example-client/node_modules/**",
      "*.config.ts",
      "eslint.config.js",
    ],
  },
  {
    extends: [kontentAiReactConfig],
    files: ["src/**/*.ts", "src/**/*.tsx"],
    rules: formattingRulesOff,
  },
  {
    extends: [kontentAiReactConfig],
    files: [
      "example-client/src/**/*.ts",
      "example-client/src/**/*.tsx",
      "example-client/scripts/**/*.ts",
    ],
    languageOptions: {
      parserOptions: {
        project: "./example-client/tsconfig.json",
      },
    },
    rules: formattingRulesOff,
  },
  {
    extends: [kontentAiConfig],
    files: ["netlify/functions/**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: "./netlify/functions/tsconfig.json",
      },
    },
  },
  {
    extends: [kontentAiConfig],
    files: ["scripts/**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: "./scripts/tsconfig.json",
      },
    },
  },
]);
