# YINI CLI

The official command-line tool for reading, validating, and converting YINI configuration files. YINI uses explicit sections, typed values, and comments while keeping configuration readable.

[![npm version](https://img.shields.io/npm/v/yini-cli.svg)](https://www.npmjs.com/package/yini-cli)
[![Full regression tests](https://github.com/YINI-lang/yini-cli/actions/workflows/run-regression-tests.yml/badge.svg)](https://github.com/YINI-lang/yini-cli/actions/workflows/run-regression-tests.yml)
[![Package install smoke tests](https://github.com/YINI-lang/yini-cli/actions/workflows/package-install-smoke.yml/badge.svg)](https://github.com/YINI-lang/yini-cli/actions/workflows/package-install-smoke.yml)

## Quick start

Requires Node.js 22 or later. Install the CLI:

```sh
npm install -g yini-cli
yini --version
```

Save this as `config.yini`:

```yini
^ App
name = "My App"
enabled = true
ports = [8080, 8081]
```

Then try the three main commands:

```sh
yini get config.yini App.name
yini validate config.yini
yini parse config.yini
```

`get` prints `My App` without quotes. `validate` reports whether the file is valid. `parse` prints the complete document as formatted JSON. Parsing is lenient by default; strict mode (`--strict`) applies additional rules, including a required `/END` terminator.

## Commands

| Command                         | What it does                                                                              |
| ------------------------------- | ----------------------------------------------------------------------------------------- |
| `yini get config.yini App.name` | Read one value. Omit the path to print the complete document as JSON. `peek` is an alias. |
| `yini validate config.yini`     | Check a file. Directories are searched recursively by default. `check` is an alias.       |
| `yini parse config.yini`        | Convert a file to formatted JSON by default.                                              |
| `yini info`                     | Show CLI and parser information.                                                          |

### Common options

- `yini get config.yini App.name --format json` emits JSON instead of plain scalar text. Other choices are `text` and `json-compact`.
- `yini parse config.yini --compact` emits compact JSON. Other formats use `--js`, `--yaml`, or `--xml`; `-o out.json` writes to a file.
- `yini validate config.yini --strict --format json --warnings-as-errors` emits a JSON report and treats warnings as failures.
- `--quiet` reduces optional output; `--silent` suppresses command output. Run `yini <command> --help` for all options.

See the [get command reference](./docs/cli/get-command.md) for paths, stdin, and output details, and the [validate command reference](./docs/cli/validate-command.md) for directory and reporting options.

When `parse` writes to a file, it skips a destination newer than the source by default and avoids rewriting unchanged output. Use `--overwrite` to allow replacement or `--no-overwrite` to fail if the destination exists.

## Run from source

From this repository's root directory:

```sh
npm ci
npm run build
npm test
npm run start:dev -- --help
```

See [project setup](./docs/project-setup.md), [contributing](./docs/contributing.md), and the [changelog](./docs/CHANGELOG.md) for more details.

## About YINI

YINI uses section markers such as `^` and `^^` for explicit nesting. It supports strings, numbers, booleans, lists, inline objects, and comments. Indentation does not define structure. See the [basic sample](./samples/basic.yini), [larger sample](./samples/config.yini), or their [basic](./samples/basic.yini.png) and [larger](./samples/config.yini.png) previews.

The [YINI specification](https://yini-lang.org/refs/specification) has the full syntax rules. This CLI uses [yini-parser](https://www.npmjs.com/package/yini-parser); the [demo apps](https://github.com/YINI-lang/yini-demo-apps/tree/main) show complete uses.

## Feedback and license

Report problems in [GitHub Issues](https://github.com/YINI-lang/yini-cli/issues) or use [Discussions](https://github.com/YINI-lang/yini-cli/discussions). For parser issues, include the YINI input, command, expected result, and actual result.

This project is licensed under the Apache License 2.0; see [LICENSE](./LICENSE).

---

**^YINI ≡**  
> YINI is a human-readable configuration format designed for clarity, readability, explicit structure, predictability, and deterministic parsing.
> 
> See the specification for syntax and format details.  

[yini-lang.org](https://yini-lang.org/?utm_source=github&utm_campaign=yini_cli&utm_medium=referral&utm_content=readme_footer) · [YINI Project on GitHub](https://github.com/YINI-lang)  
