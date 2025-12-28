# Project Setup

Here you will find some **more detailed info** for install/setup/directory structure.

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
The main directory structure, note that some dirs and files have been left out to keep this a bit shorter.

```txt
yini-cli/
├── bin/
│   └── yini.js             # CLI entry point
│
├── src/
│   ├── cli/                # CLI presentation, not command/utility
│   │   └── helpAll.ts
|   |
│   ├── globalOptions/
│   │   └── helpOption.ts
│   │   └── infoOption.ts
│   │
│   ├── commands/
│   │   └── parse.ts
│   │   └── validate.ts
│   │   └── ...
│   │
│   └── index.ts
│
├── tests/
│   ├── smoke.test.ts
│   └── fixtures/
│
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

---

**^YINI ≡**  
> A simple, structured, and human-friendly configuration format.  

[yini-lang.org](https://yini-lang.org) · [YINI on GitHub](https://github.com/YINI-lang)  
