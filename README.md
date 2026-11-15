# YINI CLI

The official command-line tool for reading, validating, and converting YINI configuration files. YINI supports nested sections, strings, numbers, booleans, lists, and comments.

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

`get` prints `My App` without quotes. `validate` reports whether the file is valid. `parse` prints the complete document as formatted JSON. Parsing is lenient by default. Strict mode (`--strict`) requires exactly one top-level section and an `/END` line at the end of the file, along with other syntax checks.

## Commands

| Command                        | What it does                                                                            |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| `yini get config.yini App.name` | Read one value. Omit the path to print the complete document as JSON. `peek` is an alias. |
| `yini validate config.yini`     | Check a file or directory. Includes subdirectories by default. `check` is an alias.       |
| `yini parse config.yini`        | Convert a file to formatted JSON by default.                                             |
| `yini info`                    | Show CLI and parser information.                                                         |

### Common options

- `yini get config.yini App.name --format json` prints `"My App"` with JSON quotes. Other choices are `text` and `json-compact`.
- `yini parse config.yini --compact` prints JSON without extra spaces or line breaks. Other formats use `--js`, `--yaml`, or `--xml`; `-o out.json` writes to a file.
- `yini validate config.yini --strict --format json --warnings-as-errors` prints a JSON report and treats warnings as failures.
- `--quiet` hides optional messages while keeping command results and errors visible. `--silent` suppresses command output. Run `yini help <command>` for help with a specific command.

See the [get command reference](./docs/cli/get-command.md) for paths, stdin, and output details, and the [validate command reference](./docs/cli/validate-command.md) for directory and reporting options.

When `parse` writes to a file, it skips an output file newer than the input file by default and avoids rewriting unchanged output. Use `--overwrite` to replace an existing output file even if it is newer, or `--no-overwrite` to fail if the output file exists.

### Parser 2.0 compatibility

This version uses `yini-parser` 2.0. Large integers, such as `9007199254740993`, are stored as JavaScript `bigint` values to keep them exact. JSON output currently fails if the selected value or document contains one of these integers. Use `yini get config.yini App.value` to print one such integer as text, or `yini parse config.yini --js` to print the document as JavaScript.

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

The [YINI specification](https://yini-lang.org/refs/specification?utm_source=github&utm_campaign=yini_cli&utm_content=readme_about_yini&utm_medium=referral) has the full syntax rules. This CLI uses [yini-parser](https://www.npmjs.com/package/yini-parser); the [demo apps](https://github.com/YINI-lang/yini-demo-apps/tree/main) show complete examples.

## Feedback and license

Report problems in [GitHub Issues](https://github.com/YINI-lang/yini-cli/issues) or use [Discussions](https://github.com/YINI-lang/yini-cli/discussions). For parser issues, include the YINI input, command, expected result, and actual result.

This project is licensed under the Apache License 2.0; see [LICENSE](./LICENSE).

---

**^YINI ≡**  
> YINI is a human-readable configuration format designed for clarity, readability, explicit structure, predictability, and deterministic parsing.
> 
> See the specification for syntax and format details.  

[yini-lang.org](https://yini-lang.org/?utm_source=github&utm_campaign=yini_cli&utm_content=readme_footer&utm_medium=referral) · [YINI Project on GitHub](https://github.com/YINI-lang)
