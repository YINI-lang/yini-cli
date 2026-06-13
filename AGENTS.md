# AGENTS.md

> AI agent instructions for this repository.
> Read this before making any changes to the codebase.
> If any instruction in this file is unclear, ambiguous, or conflicts with the repository state, stop and ask the human maintainer before proceeding.

## Project Overview

- **Name:** `yini-cli`
- **Purpose:** Official command-line tool for validating, inspecting, and
  converting YINI files.
- **Language/runtime:** TypeScript 5.x on Node.js, full ESM.
- **Node.js:** `package.json` declares `>=18`; CI covers Node 18, 20, 22, and
  24; `.nvmrc` currently pins local development to Node 24.14.0.
- **Package manager:** npm (`package-lock.json` is committed).
- **Framework/stack:** Commander.js CLI, `yini-parser`, Vitest, ESLint,
  Prettier, TypeScript `tsc`.
- **Monorepo:** No.

YINI values clarity, readability, predictability, explicit structure, and
deterministic parsing. Keep those values visible in code, tests, examples, and
documentation.

## Repository Structure

```text
.
|-- bin/                  # Published CLI shim; imports dist/index.js.
|-- src/                  # TypeScript source.
|   |-- cli/              # CLI presentation helpers.
|   |-- commands/         # Command implementations: parse, validate, info.
|   |-- config/           # Runtime environment helpers.
|   |-- globalOptions/    # Shared global option/help behavior.
|   |-- serializers/      # Output serializers for parse formats.
|   |-- utils/            # Shared utility functions.
|   `-- index.ts          # Main Commander program entry point.
|-- tests/                # Vitest tests and fixtures.
|   |-- command-parse/
|   |-- command-validate/
|   |-- fixtures/
|   `-- temp/             # Test scratch area; keep committed placeholders.
|-- docs/                 # Project and command documentation.
|-- samples/              # Sample YINI files and expected converted examples.
|-- dist/                 # Generated build output; do not edit by hand.
|-- coverage/             # Generated coverage output; do not edit by hand.
|-- package.json
|-- package-lock.json
|-- tsconfig.json
|-- vitest.config.ts
`-- README.md
```

## Commands

Install dependencies:

```bash
npm ci
```

Run the CLI from the built output:

```bash
npm start -- --help
npm run run:parse
npm run run:validate
node ./bin/yini.js parse sample.yini --compact
```

Run the CLI directly from TypeScript during development:

```bash
npm run start:dev -- parse sample.yini
npm run start:dev:debug -- validate sample.yini
```

Build, lint, format, and test:

```bash
npm run build
npm run lint
npm run format
npm test
npm run ci:test
npm run ci:test:smoke
npm run test:smoke
npm run test:general
npm run test:cov
```

Notes:

- There is no dedicated `typecheck` script at the time of writing; `npm run
  build` runs `tsc` and is the typecheck.
- CI uses `npm ci --ignore-scripts`, then build/lint/test steps depending on
  the workflow.
- `npm run clean` removes `dist/`; use it only when a clean rebuild is needed.

## Required Checks

Run the smallest relevant checks first.

For docs-only changes:

```bash
npm run format
```

For a focused code or test change:

```bash
npx vitest run <affected-test-file>
npm run build
```

For CLI command behavior, also run the matching smoke or command test:

```bash
npm run test:smoke
npx vitest run tests/command-parse
npx vitest run tests/command-validate
```

Before considering a larger change complete:

```bash
npm run lint
npm test
npm run build
npm run format
```

If a required check cannot be run, explain why and describe what was validated
instead.

## Code Style

Follow the existing style of the repository.

- Keep changes small, explicit, and maintainable.
- Do not rewrite unrelated code or reformat untouched files.
- Keep public CLI behavior stable unless the task explicitly asks for a change.
- Preserve strict-mode and lenient-mode separation.
- Prefer precise diagnostics over vague errors.
- Use TypeScript ESM imports and include `.js` extensions for local runtime
  imports, matching the existing source.
- Keep the shebang in `src/index.ts` and `bin/yini.js` as the first line.
- Use the existing print/debug helpers instead of ad hoc console output when
  command behavior depends on `--quiet`, `--silent`, `--verbose`, or debug mode.
- Use existing command, serializer, and utility boundaries before adding new
  abstractions.
- Follow the configured Prettier style: 4 spaces, single quotes, trailing
  commas, and no semicolons.

## Testing

When changing behavior:

- Add or update focused Vitest tests near the affected command or feature.
- Add or update fixture files under `tests/fixtures/` when parser-facing
  behavior changes.
- Cover both strict and lenient modes when behavior differs between them.
- Keep tests deterministic and avoid relying on machine-specific paths,
  timestamps, or environment state.
- Use `tests/temp/` only as scratch space for tests; keep its committed
  placeholders intact.
- Do not remove failing tests. Fix the issue or clearly report why a test is
  failing.
- Avoid broad snapshot or fixture churn unless the behavior intentionally
  changes.

## Documentation Guidance

Update documentation when a change affects:

- public CLI commands, options, or exit codes,
- parse or validate behavior,
- supported output formats,
- installation or development workflow,
- examples or sample output.

Keep documentation concise and consistent with the README and files in `docs/`.
When syntax examples change, make them human-readable and aligned with the
current YINI specification.

## Dependency Policy

Do not add new runtime dependencies unless clearly necessary.

Before adding a dependency, prefer:

1. Existing project utilities.
2. Node.js standard library functionality.
3. Small local helper functions.

If a new dependency is necessary, explain why it is justified. Do not modify
`package-lock.json` unless dependency changes require it.

## Safety and Scope Boundaries

### Always Do

- Run tests before submitting any change.
- Match the code patterns in the file you are editing.
- Keep changes focused — one concern per PR.
- When editing Markdown files, if a line introduces a bulleted list and ends with a colon (`:`), place the first bullet immediately on the next line. Do not insert a blank line between the introductory line and the first bullet.

### Ask First

- Before adding a new dependency.
- Before changing the public API or exported types.
- Before modifying CI/CD configuration.
- Before refactoring shared utilities used across multiple modules.

### Never Do

Do not modify:

- secrets, credentials, private keys, or `.env` files,
- generated files such as `dist/`, `coverage/`, or `.nyc_output/` unless
  generation is explicitly part of the task,
- vendored dependencies or `node_modules/`,
- unrelated formatting or whitespace.

Do not perform destructive operations such as:

- deleting large parts of the repository,
- resetting history,
- force-pushing,
- creating releases,
- publishing packages.

Do not create commits, tags, branches, or releases unless explicitly requested.

## Project-Specific Notes

- The CLI currently exposes `parse`, `validate`, and `info` commands through
  Commander in `src/index.ts`.
- `parse` supports JSON, compact JSON, JavaScript object, YAML, and XML output
  through `src/serializers/`.
- `validate` accepts files and directories; directory validation is recursive by
  default unless `--no-recursive` / `--no-subdirs` is used.
- `--strict` and `--lenient` are global parser-mode options. Lenient mode is the
  default.
- Output controls such as `--quiet`, `--silent`, `--verbose`, and
  `--warnings-as-errors` must remain predictable for CI usage.
- File output handling should avoid surprising overwrites. Preserve the existing
  `--overwrite`, `--no-overwrite`, newer-destination, and unchanged-output
  behavior unless the task explicitly changes it.
- Parser behavior must match the current YINI specification and the
  `yini-parser` dependency contract.
ch the current YINI specification.
- Add or update golden tests when parsing behavior changes.
- Prefer precise diagnostics over vague errors.
