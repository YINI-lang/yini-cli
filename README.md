# YINI-CLI
**Command-line tool for validating, inspecting, and converting YINI configuration files to JSON.**

*YINI is an INI-inspired configuration format designed for clarity and predictability. It supports nesting, comments, and a formally defined syntax, so configuration files stay easy to read and reason about as they grow.*

[![npm version](https://img.shields.io/npm/v/yini-cli.svg)](https://www.npmjs.com/package/yini-cli) [![All Test Suites](https://github.com/YINI-lang/yini-cli/actions/workflows/run-all-tests.yml/badge.svg)](https://github.com/YINI-lang/yini-cli/actions/workflows/run-all-tests.yml) [![Regression Tests](https://github.com/YINI-lang/yini-cli/actions/workflows/run-regression-tests.yml/badge.svg)](https://github.com/YINI-lang/yini-cli/actions/workflows/run-regression-tests.yml) [![CLI Test CI](https://github.com/YINI-lang/yini-cli/actions/workflows/run-cli-test.yml/badge.svg)](https://github.com/YINI-lang/yini-cli/actions/workflows/run-cli-test.yml)

This tool is useful if you work with human-edited configuration files and want predictable structure without indentation-based rules.

---

## Quick Start

### Requirements
YINI CLI requires Node.js **v20 or later**.  

(It has also been tested with Node.js v13+, but v20+ is recommended for best compatibility.)

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

⭐ If this was useful, [star it on GitHub](https://github.com/YINI-lang/yini-cli) — it helps a lot, thank you!

---

### Typical use cases

- Validating configuration files during development or CI.
- Inspecting and debugging structured configuration.
- Converting YINI files to JSON for tooling and automation.

---

## 🙋‍♀️ Why YINI?
- **Indentation-independent structure:** The YINI config format is indentation-independent, meaning any space or tab never changes meaning.
- **Explicit nesting:** It uses clear header markers (`^`, `^^`, `^^^`) to define hierarchy (like in Markdown), without long dotted keys.
- **Multiple data types:** Supports boolean literals (`true` / `false`, `Yes` / `No`, etc), numbers, arrays (lists), and JS-style objects natively, with explicit string syntax.
- **Comments support:** YINI supports multiple comment styles (`#`, `//`, `/* ... */`, and `;`) allowing one to document config directly in the file.
- **Predictable parsing rules:** Well-defined rules with optional strict and lenient modes, for different use-requirements.

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

## Quick Look at YINI

Here's a small example showing YINI structure and comments:
```yini
    // This is a comment in YINI

    ^ App                      // Defines section (group) "App" 
      name     = 'My Title'    // Keys and values are written as key = value
      items    = 25
      darkMode = true          // "ON" and "YES" works too

        // Sub-section of the "App" section
        ^^ Special
           primaryColor = #336699   // Hex number format
           isCaching    = false     // "OFF" and "NO" works too
    
    # This is a comment too.
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

If you found this useful, a GitHub star helps the project a lot ⭐

**^YINI ≡**  
> YINI — Clear, Structured Configuration Files.  

[yini-lang.org](https://yini-lang.org) · [YINI on GitHub](https://github.com/YINI-lang)  
