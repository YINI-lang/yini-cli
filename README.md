# YINI-CLI
**Command-line tool for validating, inspecting, and converting YINI configuration files to JSON.**

*YINI is an INI-inspired configuration format designed for clarity and predictability. It supports nesting, comments, and a formally defined syntax—so configuration files stay easy to read and reason about as they grow.*

[![npm version](https://img.shields.io/npm/v/yini-cli.svg)](https://www.npmjs.com/package/yini-cli) [![All Test Suites](https://github.com/YINI-lang/yini-cli/actions/workflows/run-all-tests.yml/badge.svg)](https://github.com/YINI-lang/yini-cli/actions/workflows/run-all-tests.yml) [![Regression Tests](https://github.com/YINI-lang/yini-cli/actions/workflows/run-regression-tests.yml/badge.svg)](https://github.com/YINI-lang/yini-cli/actions/workflows/run-regression-tests.yml) [![CLI Test CI](https://github.com/YINI-lang/yini-cli/actions/workflows/run-cli-test.yml/badge.svg)](https://github.com/YINI-lang/yini-cli/actions/workflows/run-cli-test.yml)

---

## 🙋‍♀️ Why YINI?
- **No "Indentation" Hell:** The YINI config format is indentation-independent, meaning you wont' break your app with a single misplaces space.
- **Simple Nesting:** It uses clear header markers (e.g. `^`, `^^`, `^^^`) to create hierarchy/sub-sections (like in Markdown), and avoid long multip chained dotted section head names.
- **Multiple Data Types:** It supports boolean literals (`true` / `false`, `Yes` / `No`, `On` / `Off`), numbers, arrays, and even JS-style objects natively.
- **Comments Support:** YINI supports multiple comment styles (`#`, `//`, `/* ... */`, and `;`) allowing one to document config directly in the file.
- **Predictable Validation:** It offers specified rules for strict and lenient parsing modes.

⭐ **Enjoying yini-cli?** If you like this project, [star it on GitHub](https://github.com/YINI-lang/yini-cli) — it helps a lot, thank you!

---

## Requirements
YINI CLI requires Node.js **v20 or later**.  

(It has also been tested with Node.js v13+, but v20+ is recommended for best compatibility.)

---

## Quick Start

### Installation

1. **Install it globally from npm — (requires Node.js)**  
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

## Quick Into to YINI Format

YINI code looks like this:
```yini
    // This is a comment in YINI
    // YINI is a simple, human-readable configuration file format.

    // Note: In YINI, spaces and tabs don't change meaning - indentation is just
    // for readability.

    /*  This is a block comment

        In YINI, section headers use repeated characters "^" at the start to
        show their level: (Section header names are case-sensitive.)

        ^ SectionLevel1
        ^^ SectionLevel2
        ^^^ SectionLevel3
    */

    ^ App                      // Definition of section (group) "App" 
      name     = 'My Title'    // Keys and values are written as key = value
      items    = 25
      darkMode = true          // "ON" and "YES" works too

        // Sub-section of the "App" section
        ^^ Special
           primaryColor = #336699   // Hex number format
           isCaching    = false     // "OFF" and "NO" works too
```

**The above YINI converted to a JS object:**
```js
{
    App: {
        name: 'My Title',
        items: 25,
        darkMode: true,
        Special: { 
            primaryColor: 3368601,
            isCaching: false
        }
    }
}
```

**In JSON:**
```json
{
   "App":{
      "name":"My Title",
      "items":25,
      "darkMode":true,
      "Special":{
         "primaryColor":3368601,
         "isCaching":false
      }
   }
}
```

That's it!

- ▶️ Link to [examples/](https://github.com/YINI-lang/yini-parser-typescript/tree/main/examples) files.
- ▶️ Link to [Demo Apps](https://github.com/YINI-lang/yini-demo-apps/tree/main) with complete basic usage.

---

## Bigger Intro into YINI Config Format
**YINI** is a simple and readable configuration format. Sections are defined with `^ SectionName`, and values are assigned using `key = value`. The format supports common data types (same as those found in JSON), including strings, numbers, booleans, nulls, and lists. 

To learn more, see the [Getting Started: Intro to YINI Config Format](https://github.com/YINI-lang/YINI-spec/blob/develop/Docs/Intro-to-YINI-Config-Format.md) tutorial.

---

## Usage of command `yini`

```bash
Usage: yini [options] [command]

CLI for parsing and validating YINI config files.

Options:
  -v, --version              Output the version number.
  -i, --info                 Show extended information (details, links, etc.).
  -s, --strict               Enable strict parsing mode.
  -f, --force                Continue parsing even if errors occur.
  -q, --quiet                Reduce output (show only errors).
  --silent                   Suppress all output (even errors, exit code only).
  -h, --help                 Display help for command.

Commands:
  parse [options] <file>     Parse a YINI file (*.yini) and print the result.
  validate [options] <file>  Checks if the file can be parsed as valid YINI.
  info                       Deprecated: Use `yini --info` or `yini -i` instead.
  help [command]             Display help for command.

Examples:
  $ yini parse config.yini
  $ yini validate --strict config.yini
  $ yini parse config.yini --pretty --output out.json

For help with a specific command, use -h or --help. For example:
  $ yini validate --help
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

## 🛠 Roadmap
Areas of planned and possible future expansion:

1. **Improve existing commands** — Continued functionality improvements, better diagnostics, and expanded QA for `parse` and `validate` and their options.
2. Command `format`: Pretty-print or normalize a `.yini` file.
3. Command `lint`: Stricter stylistic checks (like `validate`, but opinionated).
4. Command `diff`: Compare two YINI files and show structural/config differences.
5. Command `convert`: Convert a `JSON` or `XML` file into YINI format.

---

## Links
- ➡️ [YINI Parser on npm](https://www.npmjs.com/package/yini-parser)  
  *Install and view package details.*

- ➡️ [YINI Project](https://github.com/YINI-lang)  
  *YINI home on gitHub.*

---

## Contribution & Involvement
Interested in contributing or trying ideas?
Issues, feedback, and experiments are welcome — even small ones.

---

## License
This project is licensed under the Apache-2.0 license - see the [LICENSE](<./LICENSE>) file for details.

In this project on GitHub, the `libs` directory contains third party software and each is licensed under its own license which is described in its own license file under the respective directory under `libs`.

---

**^YINI ≡**  
> YINI — Clear, Structured Configuration Files.  

[yini-lang.org](https://yini-lang.org) · [YINI on GitHub](https://github.com/YINI-lang)  
