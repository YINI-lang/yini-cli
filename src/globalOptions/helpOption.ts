// helpOption.ts

/*
 * The main (global) option help.
 */

import { getPackageName, getPackageVersion } from '../utils/yiniCliHelpers.js'

/**
 * Text to be displayed BEFORE the built-in help text block.
 */
export const getHelpTextBefore = () => {
    return `${getPackageName()} ${getPackageVersion()}
YINI CLI (Yet another INI)

The official terminal / command-line (CLI) for parsing and validating YINI
configuration files. A config format, inspired by INI, with type-safe values,
nested sections, comments, minimal syntax noise, and optional strict mode.

Designed for clarity and consistency. :)\n`
}

/**
 * Text to be displayed AFTER the built-in help text block.
 */
export const getHelpTextAfter = () => {
    return `
========================================================

Quick Examples:
  $ yini parse file.yini
  $ yini parse file.yini --json
  $ yini parse file.yini --js
  $ yini parse file.yini -o output.json
  $ yini validate --strict config.yini

For help with a specific command, use -h or --help. For example:
  $ yini validate --help

========================================================
Example YINI configuration file (config.yini)
========================================================
    ^ App
    title = 'My App'
    items = 10
    debug = ON

    ^ Server
    host = 'localhost'
    port = 8080
    useTLS = OFF

        // Sub-section of Server.
        ^^ Login
        username = 'user'
        password = 'secret'
========================================================

More info:
  https://github.com/YINI-lang/yini-cli

YINI homepage:
  https://yini-lang.org
`
}
