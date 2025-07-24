# YINI-CLI
Command-line tool for working with YINI configuration files.

## Project Setup
- Source in TypeScript.
- In full ESM (ECMAScript Modules) (as opposed to CommonJS).
- Commander

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
├── package.json
├── tsconfig.json
└── README.md
```