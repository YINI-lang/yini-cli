# Project Setup

Here you'll find some info for install/setup/directory structure.

## Main Techs
- Source in **TypeScript**
- **Node.js** - In full ESM (ECMAScript Modules) (as opposed to CommonJS)
- **Commander.js** - CLI tooling
- **Vitest** - Test framework, good for ESM and TypeScript
- **CI/CD** - GitHub Actions for automated tests and build processes
- **Prettier / ESLint** - Code formatting and linting
- **YINI Parsing** - Uses the yini-parser library
- **cross-env** - Environment variable management

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

