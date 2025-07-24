// prettier.config.js
/** @type {import("prettier").Config} */
module.exports = {
  // ────────────────────────────────────────────────────────────────
  // Formatting Options
  // ─
  useTabs: false,

  // Maximum line length before Prettier wraps.
  // "printWidth": 120,
  printWidth: 80,

  // Number of spaces per indentation level.
  tabWidth: 4,
  singleQuote: true,
  trailingComma: "all",
  jsxBracketSameLine: true,
  semi: false,
// Whether to add a space between brackets in object literals
  bracketSpacing: true,
  // Since prettier 3.0, manually specifying plugins is required
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  // This plugin's options
    importOrder: [
    '^react$',                 // Put React first
    '<THIRD_PARTY_MODULES>',   // Then other external dependencies
    '^[@/](.*)$',              // Then “@/…” or “@alias/…” imports
    '^[./]',                   // Then relative imports
  ],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderTypeScriptVersion: '5.0.0',
  importOrderCaseSensitive: false,
}
