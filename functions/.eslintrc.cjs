module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  // --- LÍNEA AÑADIDA ---
  ignorePatterns: ["lib/"], 
  rules: {
    "quotes": ["error", "double"],
  },
};