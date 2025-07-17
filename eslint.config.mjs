import cds from "@sap/cds/eslint.config.mjs";
const ui5TestsConfig = {
  files: ["app/**/test/**/*.js"],
  languageOptions: {
    globals: {
      QUnit: "readonly",
    },
  },
  rules: {
    "no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "When|Then|Given",
      },
    ],
  },
};
export default [...cds.recommended, ui5TestsConfig];
