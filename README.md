# YINI-CLI
Command-line tool for working with YINI configuration files.

## Project Setup
- Source in TypeScript.
- In full ESM (ECMAScript Modules) (as opposed to CommonJS).
- Commander
- Vitest (good for ESM and TypeScript)

## Project Dir Structure
```txt
yini-cli/
├── bin/
│   └── yini.js         # CLI entry point
├── src/
│   ├── commands/
│   │   └── parse.ts
│   │   └── validate.ts
│   │   └── convert.ts
│   └── index.ts
├── tests/
│   ├── cli-basic.test.ts
│   └── fixtures/
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```