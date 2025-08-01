WIP

--

# YINI-CLI
Command-line tool for working with YINI configuration files.

[![npm version](https://img.shields.io/npm/v/yini-parser.svg)](https://www.npmjs.com/package/yini-parser) [![All Tests](https://github.com/YINI-lang/yini-parser-typescript/actions/workflows/run-all-tests.yml/badge.svg)](https://github.com/YINI-lang/yini-parser-typescript/actions/workflows/run-all-tests.yml)


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

## Links
- ➡️ [Why YINI? Why another format!?](./RATIONALE.md) (rationale)
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
