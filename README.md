# YINI-CLI
Command-line tool for working with YINI configuration files. A human-friendly config format — like INI, but with type-safe values, nested sections, comments, minimal syntax noise, and optional strict mode.

[![npm version](https://img.shields.io/npm/v/yini-parser.svg)](https://www.npmjs.com/package/yini-parser) [![All Tests](https://github.com/YINI-lang/yini-cli/actions/workflows/run-all-tests.yml/badge.svg)](https://github.com/YINI-lang/yini-cli/actions/workflows/run-all-tests.yml)

---

## 🙋‍♀️ Why YINI?
- **YINI is an alternative** to other great config formats like INI, JSON, YAML, XML, and TOML — designed for clarity, simplicity, and straightforward section nesting.
- **Started as a personal project and a research challenge:** Aiming for something more readable than JSON, more structured than INI, and less surprising than YAML.
- **Built for clarity:**
    * Easy to read and write for humans, especially for nested sections.
    * Not too much syntax noise.
    * Just enough structure for real-world configs.
- **A little bit of fun and joy:**
    * Created to scratch our own itch — if you like it too, that's a bonus!

---

## 💡 What is YINI?
- **Simple like INI** — but with strong typing, comments, and nested sections.
- **Easy to read and write** — minimal syntax noise, maximum clarity.
- **Clear, minimal section nesting** — no painful indentation or long dot-delimited keys.
- **Supports strict and lenient modes**, and all major data types.
- Both **human-friendly** and **machine-friendly**.
- 👉 See [how YINI compares to JSON, YAML, INI, and TOML](https://github.com/YINI-lang/yini-parser-typescript/tree/main/examples/compare-formats.md).
- Want the full syntax reference? See the [YINI Specification](https://github.com/YINI-lang/YINI-spec).

---

## Usage

### 📤 Output Modes for `yini parse`

The `parse` command supports multiple output styles:

| Command Example                                    | Output Style         | Description                                                                  |
|----------------------------------------------------|----------------------|------------------------------------------------------------------------------|
| `yini parse config.yini`                           | JS-style object       | Uses Node’s `util.inspect` — human-readable, shows types, nesting, etc.     |
| `yini parse config.yini --pretty`                  | Pretty JSON           | Formatted and indented with `JSON.stringify(obj, null, 4)`.                  |
| `yini parse config.yini --log`                     | Console log           | Uses `console.log` — quick output but may truncate deep structures.          |
| `yini parse config.yini --json`                    | Compact JSON          | Compact and machine-friendly `JSON.stringify(obj)`.                          |
| `yini parse config.yini --output out.txt`          | File (JS-style)       | Default style, written to specified file.                                    |
| `yini parse config.yini --pretty --output out.json`| File (Pretty JSON)    | Formatted JSON written to file.                                              |

>💡 Tip: You can combine --output with any style flag to control both formatting and destination.

---

## Links
- ➡️ [Why YINI? Why another format!?](https://github.com/YINI-lang/YINI-spec/blob/develop/RATIONALE.md) (rationale)
- ➡️ [Intro to YINI Config Format](https://github.com/YINI-lang/yini-parser-typescript?tab=readme-ov-file#intro-to-yini-config-format) (learn YINI)
- ➡️ [Read the YINI Specification](https://github.com/YINI-lang/YINI-spec/blob/develop/YINI-Specification.md#table-of-contents) (spec)
- ➡️ [Official YINI Parser on npm](https://www.npmjs.com/package/yini-parser) (npm)
- ➡️ [YINI Parser GitHub Repo](https://github.com/YINI-lang/yini-parser-typescript) (GitHub)
- ➡️ [YINI vs Other Formats](https://github.com/YINI-lang/YINI-spec/blob/develop/Docs/Examples%20of%20YINI%20vs%20Other%20Formats.md)
- ➡️ [YINI Project](https://github.com/YINI-lang) (home)

---

## License
This project is licensed under the Apache-2.0 license - see the [LICENSE](<./LICENSE>) file for details.

In this project on GitHub, the `libs` directory contains third party software and each is licensed under its own license which is described in its own license file under the respective directory under `libs`.

---

~ **YINI ≡** • [https://yini-lang.org](https://yini-lang.org)
