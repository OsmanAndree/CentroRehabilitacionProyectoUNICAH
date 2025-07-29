import globals from "globals";
import js from "@eslint/js";

export default [
  {
    files: ["**/*.{js,mjs,cjs}"],
    ...js.configs.recommended,
  },

  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs", 
      globals: {
        ...globals.node, 
      },
    },
    rules: {
      "no-unused-vars": "warn",
    },
  },
];