# get command

## Purpose

Read one value or the complete parsed document from a YINI file. `peek` is an alias for `get`.

```sh
yini get <file|-> [path] [--format text|json|json-compact]
```

Use `-` instead of a file name to read UTF-8 YINI from stdin. With no path, the command prints the complete document as pretty JSON.

## Paths

A path selects one exact value. Separate object keys and list indexes with dots:

```sh
yini get config.yini database.host
yini get config.yini servers.0.host
```

The first list item has index `0`. List indexes must be non-negative base-10 safe integers without a sign or leading zeroes. A numeric component under an object is an object key. Empty components, leading or trailing dots, and invalid escapes are errors. Escape a literal dot in a key as `\.` and a literal backslash as `\\`.

For a YINI key written as `` `connection.host` ``, quote the whole CLI path so the backslash reaches `get`:

```sh
# POSIX shell
yini get config.yini 'database.connection\.host'
```

```cmd
rem Windows Command Prompt
yini get config.yini "database.connection\.host"
```

For a YINI key written as `` `slash\\key` `` (which represents one literal backslash in the key), escape that backslash in the CLI path too:

```sh
# POSIX shell
yini get config.yini 'App.slash\\key'
```

```cmd
rem Windows Command Prompt
yini get config.yini "App.slash\\key"
```

The backticks in the YINI key are not part of the CLI path. Paths use own object properties only; inherited JavaScript properties are never selected.

## Output

By default, strings, numbers, booleans, and null are printed as plain text. Objects and lists are printed as JSON with four-space indentation. A string is printed without surrounding quotes. The command preserves its content and adds a final line feed only if it does not already end with one.

| Format | Output |
| --- | --- |
| `text` | Plain text for a scalar; error for an object or list |
| `json` | Pretty JSON for any value, including quoted strings |
| `json-compact` | Compact JSON for any value |

Plain text is useful in scripts, while JSON preserves string escapes and value types. For example:

```sh
yini get config.yini database.host
yini get config.yini database.host --format json
yini get config.yini database --format json-compact
cat config.yini | yini get - database.host
```

Successful data goes to stdout. Warnings, errors, and verbose information go to stderr. `--quiet` hides warnings and optional available-key advice but keeps the selected value and errors. `--silent` hides all command output and leaves only the exit status. `--verbose` adds processing details to stderr.

The command uses lenient parsing by default. `--strict` applies strict YINI syntax; `--lenient` selects lenient mode explicitly. Parser errors always fail before a value is returned, even when the parser recovered partial data. A missing path, malformed path, unreadable file, or incompatible format also fails. Exit status is `0` on success and `1` on error.

See `yini get --help` for command and global options.
