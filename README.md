# YINI-CLI
> **Readable configuration without YAML foot-guns or JSON noise.**  

**The official terminal / command-line (CLI) tool for validating, inspecting, and converting YINI configuration files to JSON.**

*YINI is an INI-inspired and human-readable text format for representing structured information. It is designed to be clear, predictable, and easy for humans to read and write. It supports nesting, comments, and a formally defined syntax. It is suitable for configuration files, application settings, and general data-storage use cases.*

[![npm version](https://img.shields.io/npm/v/yini-cli.svg)](https://www.npmjs.com/package/yini-cli) [![All Test Suites](https://github.com/YINI-lang/yini-cli/actions/workflows/run-all-tests.yml/badge.svg)](https://github.com/YINI-lang/yini-cli/actions/workflows/run-all-tests.yml) [![Regression Tests](https://github.com/YINI-lang/yini-cli/actions/workflows/run-regression-tests.yml/badge.svg)](https://github.com/YINI-lang/yini-cli/actions/workflows/run-regression-tests.yml) [![CLI Test CI](https://github.com/YINI-lang/yini-cli/actions/workflows/run-cli-test.yml/badge.svg)](https://github.com/YINI-lang/yini-cli/actions/workflows/run-cli-test.yml)

This tool is ideal for anyone working with human-edited configuration who wants predictable structure without indentation-based rules.

---

## Example of YINI code
> A basic YINI configuration example, showing a section, nested section, comments:  
![YINI Config Example](./samples/basic.yini.png)
Source: [basic.yini](./samples/basic.yini)

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
    ```json
    {
        "App": {
            "name": "My App Title",
            "version": "1.2.3",
            "pageSize": 25,
            "darkTheme": false
        }
    }    
    ```

### Typical use cases

- Validating configuration files during development or CI.
- Inspecting and debugging structured configuration.
- Converting YINI files to JSON for tooling and automation.

---

## Example 2
> A real-world YINI configuration example, showing sections, nesting, comments, and multiple data types:  
![YINI Config Example](./samples/config.yini.png)
Source: [config.yini](./samples/config.yini)

---

## 🙋‍♀️ Why YINI?
- **Indentation-independent structure:** The YINI config format is indentation-independent, meaning any space or tab never changes meaning.
- **Explicit nesting & refactoring safety:** It uses clear header markers (`^`, `^^`, `^^^`) to define hierarchy (like in Markdown), without long dotted keys.
- **Multiple data types:** Supports boolean literals (`true` / `false`, `Yes` / `No`, etc), numbers, arrays (lists), and JS-style objects natively, with explicit string syntax.
- **Comments support:** YINI supports multiple comment styles (`#`, `//`, `/* ... */`, and `;`) allowing one to document config directly in the file.
- **Predictable parsing rules:** Well-defined rules with optional strict and lenient modes, for different use-requirements.

⭐ Don't forget to, [star it on GitHub](https://github.com/YINI-lang/yini-cli) — it helps a lot, thank you!

---

## Usage of command `yini`

Quick Examples:
  $ yini parse config.yini
      → Parse and print formatted JSON (default).

  $ yini parse config.yini --json-compact
      → Output compact JSON.

  $ yini parse config.yini --js
      → Output as JavaScript.

  $ yini parse config.yini --output out.json
      → Write formatted JSON to a file.

  $ yini validate --strict config.yini
      → Validate using strict mode.

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

- ▶️ See more on [YINI Homepage](https://yini-lang.org/?utm_source=github&utm_medium=referral&utm_campaign=yini_cli&utm_content=readme_middle).
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
| `yini parse config.yini --pretty --output out.json`| File (**Pretty JSON**)| Formatted JSON written to file.                                              |

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

[yini-lang.org](https://yini-lang.org/?utm_source=github&utm_medium=referral&utm_campaign=yini_cli&utm_content=readme_footer) · [YINI on GitHub](https://github.com/YINI-lang)  
