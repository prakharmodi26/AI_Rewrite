// Basic ESLint config for a Node + TS project
module.exports = {
  root: true,
  env: { node: true, es2022: true },
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  extends: ['eslint:recommended'],
  ignorePatterns: ['dist'],
  rules: {
    'no-console': 'off'
  }
};
