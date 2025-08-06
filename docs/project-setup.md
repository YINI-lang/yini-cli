# Project Setup

Here you'll find some info for install/setup/directory structure.

## Project Setup
- Source in TypeScript.
- Node.js, in full ESM (ECMAScript Modules) (as opposed to CommonJS).
- Commander
- Vitest (good for ESM and TypeScript)
- GitHub Actions (CI/CD)
- ESLint (code style / linting)

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
│   ├── smoke.test.ts
│   └── fixtures/
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

