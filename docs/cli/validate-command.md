# validate command

## Purpose

Validate one or more YINI files.

- `<file>` = Validate one file
- `<directory>` = Validate `.yini` files in the directory

Multiple files and directories may be provided, separated by spaces.

The `check` command is an alias for `validate`.

---

## Default behavior

- Validates one or more files or directories.
- If a directory is provided, all `.yini` files are validated recursively by default.
- Prints a human-readable validation summary to the terminal.
- Uses lenient mode by default.
- Returns a non-zero exit code if validation fails for one or more files, or if warnings are treated as errors.
- In **file mode**:
  - For one validated file, show a friendly summary first, then issue details.
  - For multiple file targets, show per-file `OK` / `FAIL` lines, then a final summary, then issue details for failed files.
- In **directory mode**:
  - Show per-file `OK` / `FAIL` lines first, then a final summary, then issue details for failed files.
- In text output, `--stats` is shown only when file mode validates exactly one file.
- In JSON output, `--stats` may be included for each validated file.

### Run modes

The validate command operates in two run modes: **file mode** and **directory mode**.

- **File mode** is used when all original input targets are files.
- **Directory mode** is used when at least one original input target is a directory.

Examples:

- `yini validate config.yini` → file mode
- `yini check config.yini` → file mode
- `yini validate a.yini b.yini` → file mode
- `yini validate .` → directory mode
- `yini validate configs/` → directory mode
- `yini validate a.yini configs/` → directory mode

---

## CLI syntax

```sh
yini validate <fileOrDirectory...> [options]
yini check <fileOrDirectory...> [options]
```

---

## Options

### Validation mode

- `--strict`  
  Validate in strict mode

- `--lenient`  
  Validate in lenient mode (default)

### Output verbosity

- `--quiet, -q`  
  Suppress successful per-file output; show failed files, issue details for failures, and final summary only.
  - Suppress `OK ...` lines
  - Still show `FAIL ...` lines
  - Still show per-file issue details for failed files
  - Still show the final summary
  - Still show fatal CLI/runtime errors

- `--silent, -s`  
  Show no output; exit code only. Suppresses validation output.  
  CLI/framework-level argument errors may still print help or error text unless explicitly intercepted.
  - No summary
  - No per-file lines
  - No warnings
  - No issue details
  - No success output
  - No validation failure output

- `--verbose`  
  Show extra processing details

- `--stats`  
  Include optional statistics in the report. In text output, statistics are shown only when file mode validates exactly one file.

- `--format <text|json>`  
  Output format for validation results (default: `text`)

### Input handling

- `<file>`  
  Validate a single YINI file

- `<directory>`  
  Validate all `.yini` files in the directory

- `--no-recursive, --no-subdirs`  
  Do not descend into subdirectories

### Execution controls

- `--fail-fast`  
  Stop on the first file that fails

- `--max-errors <n>`  
  Stop validation after reporting `<n>` total errors across all input files

- `--warnings-as-errors`  
  Treat warnings as errors for exit code purposes
  - Warnings retain warning severity in the output
  - Exit code becomes non-zero if any warning exists

### Output handling

- `(WAIT WITH THIS) --no-summary`
- `(WAIT WITH THIS) --output, -o <file>` = Save/write report to file
- `(WAIT WITH THIS) --overwrite` = Allow overwriting an existing report file
- `(WAIT WITH THIS) --no-overwrite` = Do not overwrite an existing report file

### Policy controls (advanced, WAIT WITH THESE)

- `(WAIT WITH THIS) --duplicates-policy <error|warn|allow>`
- `(WAIT WITH THIS) --reserved-policy <error|warn|allow>`

---

## Exit codes

- `0` = all files valid
- `1` = one or more files invalid (validation failure)
- `2` = CLI usage/runtime error (bad arguments, unreadable directory, internal failure)

---

## Output rules

Human-readable output should be the default.

### File mode

File mode is used when **all original input targets are files**.

This mode has two common cases:

- **One file target**  
  Show a friendly summary first, then issue details.

- **Multiple file targets**  
  Show per-file `OK` / `FAIL` lines first, then a final summary, then issue details for failed files.

In text output, `--stats` is shown only when file mode validates exactly one file.

#### File mode with one file target: success (exit 0)

To stdout:

```txt
✔  Validation successful

File:     "configfile.yini"
Mode:     lenient
Errors:   0
Warnings: 0
```

#### File mode with one file target: validation failure (exit 1)

To stdout:

```txt
✖  Validation failed (3 issues)

File:     "configfile.yini"
Mode:     strict
Errors:   2
Warnings: 1
```

To stderr:

```txt
  12:8   error    Unexpected token '}'
  27:1   warning  Duplicate key: "port"
```

#### Optional statistics in file mode (`--stats`)

```txt
Statistics
----------
Notices:       0
Infos:         0
Line Count:    8
Section Count: 2
Member Count:  4
Nesting Depth: 2
Has @YINI:     false
Has /END:      false
Byte Size:     135 bytes
```

#### File mode with multiple file targets

Example input:

```sh
yini validate a.yini b.yini
```

To stdout:

```txt
OK    "a.yini"
FAIL  "b.yini"

Mode:    strict
Summary: 2 checked, 1 failed, 2 errors, 0 warnings
```

To stderr:

```txt
"b.yini"
  12:8   error    Unexpected token '}'
  27:1   warning  Duplicate key: "port"
```

---

### Directory mode

Directory mode is used when **at least one original input target is a directory**.

- Show per-file `OK` / `FAIL` lines first
- Show the summary after the per-file lines
- Then show issue details only for failed files
- In text output, do not show per-file statistics blocks in directory mode, even if `--stats` is set

#### Directory mode: success (exit 0)

To stdout:

```txt
OK    "configs/file.yini"
OK    "configs/db.yini"
OK    "configs/prod.yini"

Base:    "<absolute path>"
Mode:    strict
Summary: 3 checked, 0 failed, 0 errors, 0 warnings
```

#### Directory mode: validation failure (exit 1)

To stdout:

```txt
OK    "configs/file.yini"
FAIL  "configs/db.yini"
OK    "configs/prod.yini"

Base:    "<absolute path>"
Mode:    strict
Summary: 3 checked, 1 failed, 2 errors, 0 warnings
```

To stderr:

```txt
"configs/db.yini"
  12:8   error    Unexpected token '}'
  27:1   warning  Duplicate key: "port"
```

Detailed issues are printed only for failed files.

#### Directory mode example

```txt
OK    "indent-ex-conf1.yini"
OK    "indent-ex-conf2.yini"
FAIL  "config3.yini"
FAIL  "settings-bad-escaping.yini"

Base:    "<absolute path>"
Mode:    lenient
Summary: 67 checked, 14 failed, 132 errors, 0 warnings

"config3.yini"
  11:13  error    Syntax error.
          Extraneous input '33__33'; expected end of line.

"settings-bad-escaping.yini"
  10:8   error    Invalid escape sequence in string.
          Invalid escape sequence "\\l".
          Use "\\" in C-strings, or use a raw string.
```

---

## Requirements for report output

The output should:

1. Be human-readable by default
2. Give a clear verdict
3. Show useful context for each problem
4. Be machine-friendly when requested (`--format json`)
5. Be stable and predictable for CI usage

### Header / summary

#### On success

```txt
✔  Validation successful

File:     "config.yini"
Mode:     lenient
Errors:   0
Warnings: 0
```

#### On failure

```txt
✖  Validation failed

File:     "config.yini"
Mode:     strict
Errors:   3
Warnings: 1
```

### Issue details

Each issue should show:

- Severity: `error` / `warning`
- Code: stable identifier (`DUPLICATE_KEY`, `UNKNOWN_CONSTRUCT`, etc.)
- Message: short explanation
- Location: file + line + column
- Context: snippet of the file, if helpful

#### Example

```txt
Errors:
[E001] Duplicate key "host"
    at config.yini:14:5
    Previous definition at line 7
    → host = "localhost"

Warnings:
[W002] Reserved construct used: "$schema"
    at config.yini:3:1
```

### Exit code contract

- Success, no warnings → `0`
- Warnings only → `0`
- Warnings only with `--warnings-as-errors` → `1`
- One or more validation errors → `1`
- CLI/runtime failure → `2`

---

## Example: JSON format (`--format json`)

### File mode

File mode is used when all original input targets are files.

Example:

```json
{
  "file": "config.yini",
  "runMode": "file",
  "mode": "strict",
  "status": "failed",
  "summary": {
    "errors": 2,
    "warnings": 1,
    "notices": 0,
    "infos": 0
  },
  "issues": [
    {
      "severity": "error",
      "code": "DUPLICATE_KEY",
      "message": "Duplicate key \"host\"",
      "location": {
        "line": 14,
        "column": 5
      },
      "advice": "Rename or remove one of the keys."
    },
    {
      "severity": "warning",
      "code": "RESERVED_CONSTRUCT",
      "message": "Reserved construct \"$schema\"",
      "location": {
        "line": 3,
        "column": 1
      }
    }
  ],
  "stats": {
    "lineCount": 42,
    "byteSize": 805,
    "sectionCount": 8,
    "memberCount": 21,
    "nestingDepth": 2,
    "hasYiniMarker": true,
    "hasDocumentTerminator": false
  }
}
```

### Directory mode

Directory mode is used when at least one original input target is a directory.

Example:

```json
{
  "base": "<absolute path>",
  "runMode": "directory",
  "mode": "strict",
  "status": "failed",
  "summary": {
    "filesChecked": 3,
    "failedFiles": 1,
    "errors": 2,
    "warnings": 1,
    "notices": 0,
    "infos": 0
  },
  "files": [
    {
      "file": "configs/db.yini",
      "mode": "strict",
      "status": "failed",
      "summary": {
        "errors": 2,
        "warnings": 1,
        "notices": 0,
        "infos": 0
      },
      "issues": [
        {
          "severity": "error",
          "code": "DUPLICATE_KEY",
          "message": "Duplicate key \"host\"",
          "location": {
            "line": 14,
            "column": 5
          }
        },
        {
          "severity": "warning",
          "code": "RESERVED_CONSTRUCT",
          "message": "Reserved construct \"$schema\"",
          "location": {
            "line": 3,
            "column": 1
          }
        }
      ],
      "stats": {
        "lineCount": 42,
        "byteSize": 805,
        "sectionCount": 8,
        "memberCount": 21,
        "nestingDepth": 2,
        "hasYiniMarker": true,
        "hasDocumentTerminator": false
      }
    }
  ]
}
```
