# YINI-CLI
> **Readable configuration without indentation pitfalls or JSON verbosity.**  

**The official terminal / command-line (CLI) tool for validating, inspecting, and converting YINI configuration files to JSON or JavaScript.**

*YINI is an INI-inspired and human-readable text format for representing structured information. It is designed to be clear, predictable, and easy for humans to read and write. It supports nesting, comments, and a formally defined syntax. It is suitable for configuration files, application settings, and general data-storage use cases.*

[![npm version](https://img.shields.io/npm/v/yini-cli.svg)](https://www.npmjs.com/package/yini-cli) [![All Test Suites](https://github.com/YINI-lang/yini-cli/actions/workflows/run-all-tests.yml/badge.svg)](https://github.com/YINI-lang/yini-cli/actions/workflows/run-all-tests.yml) [![Regression Tests](https://github.com/YINI-lang/yini-cli/actions/workflows/run-regression-tests.yml/badge.svg)](https://github.com/YINI-lang/yini-cli/actions/workflows/run-regression-tests.yml) [![CLI Test CI](https://github.com/YINI-lang/yini-cli/actions/workflows/run-cli-test.yml/badge.svg)](https://github.com/YINI-lang/yini-cli/actions/workflows/run-cli-test.yml)

This tool is designed for teams and developers working with human-edited configuration files who require explicit structure without indentation-based semantics.

---

## Example of YINI code
> A basic YINI configuration example, showing a section, nested section, comments:  
![YINI Config Example](./samples/basic.yini.png)
Source: [basic.yini](./samples/basic.yini)

## Quick Start

### Requirements
YINI CLI requires Node.js **v20 or later**.  

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
    This should print the installed version (e.g., 1.0.0).

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
- **Indentation-independent structure:** YINI is indentation-independent — whitespace never alters structural meaning.
- **Explicit nesting & refactoring safety:** It uses clear header markers (`^`, `^^`, `^^^`) to define hierarchy (like in Markdown), without long dotted keys.
- **Multiple data types:** Supports boolean literals (`true` / `false`, `Yes` / `No`, etc), numbers, arrays (lists), and JS-style objects natively, with explicit string syntax.
- **Comments support:** YINI supports multiple comment styles (`#`, `//`, `/* ... */`, and `;`) allowing one to document config directly in the file.
- **Predictable parsing rules:** Well-defined rules with optional strict and lenient modes, for different use-requirements.

---

## Usage

### Quick Examples

```bash
yini parse config.yini
```
→ Parse and print formatted JSON (default).

```bash
yini parse config.yini --compact
```
→ Output compact JSON (no whitespace).

```bash
yini parse config.yini --js
```
→ Output as JavaScript-style object.

```bash
yini parse config.yini -o out.json
```
→ Write formatted JSON to a file.

```bash
yini validate --strict config.yini
```
→ Validate using strict mode.

For help with a specific command:

```bash
yini parse --help
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

The `parse` command supports multiple output formats:

| Command Example                         | Output Format       | Description |
|------------------------------------------|----------------------|------------|
| `yini parse config.yini`                | Pretty JSON (default) | Formatted JSON with indentation (4 spaces). |
| `yini parse config.yini --json`         | Pretty JSON          | Explicit pretty JSON output. |
| `yini parse config.yini --compact`      | Compact JSON         | Minified JSON (no whitespace). |
| `yini parse config.yini --js`           | JavaScript object    | JavaScript-style object (unquoted keys, single quotes). |
| `yini parse config.yini -o out.json`    | File output          | Writes formatted JSON to file (default format). |

>💡 `--js` and `--compact` are mutually exclusive.  
>💡 Tip: You can combine --output with any style flag to control both formatting and destination.

---

## 📁 Output File Handling

When using `-o, --output <file>`, YINI CLI applies safe write rules:

| Scenario | Result |
|----------|--------|
| File does not exist | File is written |
| File exists and is **older** than the input YINI file | File is overwritten |
| File exists and is **newer** than the input YINI file | Command fails |
| `--overwrite` is used | File is always overwritten |
| `--no-overwrite` is used | Command fails if file exists |

This prevents accidental overwriting of newer generated files.

Use:
`--overwrite` to force replacement.

---

## 🛠 Roadmap
Areas of planned and possible future expansion:

1. **Improve existing commands** — Continued functionality improvements, better diagnostics, and expanded QA for `parse` and `validate` and their options.
2. Command `convert`: Batch convert YINI files to JSON or JavaScript.
3. Command `format`: Pretty-print or normalize a `.yini` file.
4. Command `lint`: Stricter stylistic checks (like `validate`, but opinionated).
5. Command `diff`: Compare two YINI files and show structural/config differences.
6. Import JSON or XML into YINI format.

---

## Links
- ➡️ [YINI Parser on npm](https://www.npmjs.com/package/yini-parser)  
  *Install and view package details.*

- ➡️ [YINI Project](https://github.com/YINI-lang)  
  *YINI home on GitHub.*

---

## Contribution & Involvement
Contributions, issues, and feedback are welcome. Even small improvements or suggestions are appreciated.

---

## License
This project is licensed under the Apache-2.0 license - see the [LICENSE](<./LICENSE>) file for details.

In this project on GitHub, the `libs` directory contains third party software and each is licensed under its own license which is described in its own license file under the respective directory under `libs`.

---

**^YINI ≡**  
> YINI — Clear, Structured Configuration Files.  

[yini-lang.org](https://yini-lang.org/?utm_source=github&utm_medium=referral&utm_campaign=yini_cli&utm_content=readme_footer) · [YINI on GitHub](https://github.com/YINI-lang)  
