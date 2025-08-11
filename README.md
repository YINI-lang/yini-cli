# YINI-CLI
**Command-line tool for working with YINI configuration files. Validate, inspect, and convert to JSON with pretty output.**

*YINI aims to be a human-friendly config format: like INI, but with type-safe values, nested sections, comments, minimal syntax noise, and optional strict mode.*

[![npm version](https://img.shields.io/npm/v/yini-parser.svg)](https://www.npmjs.com/package/yini-parser) [![All Tests](https://github.com/YINI-lang/yini-cli/actions/workflows/run-all-tests.yml/badge.svg)](https://github.com/YINI-lang/yini-cli/actions/workflows/run-all-tests.yml)

---

## 🙋‍♀️ Why YINI?
- **YINI is an alternative** to other great config formats like INI, JSON, YAML, XML, and TOML — designed for clarity, simplicity, and straightforward section nesting.
- **Started as a personal project and a research challenge:** Provides structure similar to INI, with features inspired by JSON and YAML.
- **Built for clarity:**
    * Uses concise syntax designed for clarity, especially in nested sections.
    * Supports commonly used configuration structures.
- *Developed to meet practical needs, driven by curiosity and a desire **for configuration clarity, simplicity, minimalism, and flexibility**.

---

## 💡 What is YINI?
- **INI-inspired** — with added support for typing, comments, and nested sections.
- **Uses minimal syntax** — yet aims to keep maximum clarity.
- Section nesting **without requiring indentation or dot-delimited keys**.
- **Supports strict and lenient modes**, and all major data types.
- Designed for compatibility with both **manual editing** and **automation**.
- 👉 See [how YINI differs from JSON, YAML, INI, and TOML](https://github.com/YINI-lang/yini-parser-typescript/tree/main/examples/compare-formats.md).
- Want the full syntax reference? See the [YINI Specification](https://github.com/YINI-lang/YINI-spec).

---

## Intro to YINI Config Format
**YINI** is a simple and readable configuration format. Sections are defined with `^ SectionName`, and values are assigned using `key = value`. The format supports common data types (same as those found in JSON), including strings, numbers, booleans, nulls, and lists. 

To learn more, see the [Getting Started: Intro to YINI Config Format](https://github.com/YINI-lang/YINI-spec/blob/develop/Docs/Intro-to-YINI-Config-Format.md) tutorial.

---

## Usage

### Installation

1. **Install it globally from npm**  
    Open your terminal and run:
    ```
    npm install -g yini-cli
    ```

2. **Verify installation**  
    Run this in your terminal:
    ```bash
    yini --version
    ```
    Should print the version (e.g., 1.0.0).

    Then you may try:
    ```bash
    yini --help
    ```
    Should show you the CLI help for YINI.

3. **Test functionality**  
    Create a simple test file, for example: `config.yini`:
    ```yini
    ^ App
      name = "My App Title"
      version = "1.2.3"
      pageSize = 25
      darkTheme = off
    ```

    Then run:
    ```bash
    yini parse config.yini
    ```

    Expected result, your CLI should output a parsed version of the config and output something similar to:
    ```js
    {
        App: {
            name: 'My App Title',
            version: '1.2.3',
            pageSize: 25,
            darkTheme: false
        }
    }    
    ```

---

## 📤 Output Modes for `yini parse`

The `parse` command supports multiple output styles:

| Command Example                                    | Output Style         | Description                                                                  |
|----------------------------------------------------|----------------------|------------------------------------------------------------------------------|
| `yini parse config.yini`                           | JS-style object       | Uses Node’s `util.inspect` — human-readable, shows types, nesting, etc.     |
| `yini parse config.yini --pretty`                  | Pretty JSON           | Formatted and indented with `JSON.stringify(obj, null, 4)`.                  |
| `yini parse config.yini --json`                    | Compact JSON          | Compact and machine-friendly `JSON.stringify(obj)`.                          |
| `yini parse config.yini --output out.txt`          | File (JS-style)       | Default style, written to specified file.                                    |
| `yini parse config.yini --pretty --output out.json`| File (Pretty JSON)    | Formatted JSON written to file.                                              |

>💡 Tip: You can combine --output with any style flag to control both formatting and destination.

---

## Links
- ➡️ [Getting Started: Intro to YINI Config Format](https://github.com/YINI-lang/YINI-spec/blob/develop/Docs/Intro-to-YINI-Config-Format.md)  
  *Beginner-friendly walkthrough and basic usage examples.*

- ➡️ [YINI Parser on npm](https://www.npmjs.com/package/yini-parser)  
  *Install and view package details.*

- ➡️ [Read the YINI Specification](https://github.com/YINI-lang/YINI-spec/blob/release/YINI-Specification.md#table-of-contents)  
  *Full formal spec for the YINI format, including syntax and features.*

- ➡️ [YINI Parser on GitHub](https://github.com/YINI-lang/yini-parser-typescript)  
  *TypeScript source code, issue tracker, and contributing guide.*

- ➡️ [YINI vs Other Formats](https://github.com/YINI-lang/YINI-spec/tree/release#-summary-difference-with-other-formats)  
  *How does YINI differ: comparison with INI, YAML, and JSON.*
  
- ➡️ [Why YINI? (Project Rationale)](https://github.com/YINI-lang/YINI-spec/blob/release/RATIONALE.md)  
  *Learn about the motivations and design decisions behind YINI.*

- ➡️ [YINI Project](https://github.com/YINI-lang)  
  *YINI home.*

---

## License
This project is licensed under the Apache-2.0 license - see the [LICENSE](<./LICENSE>) file for details.

In this project on GitHub, the `libs` directory contains third party software and each is licensed under its own license which is described in its own license file under the respective directory under `libs`.

---

~ **YINI ≡** • [https://yini-lang.org](https://yini-lang.org)
