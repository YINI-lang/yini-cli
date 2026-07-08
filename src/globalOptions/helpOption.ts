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
YINI CLI (by the YINI-lang project)

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
  Parse config.yini and print formatted JSON:
    $ yini parse config.yini

  Parse config.yini and explicitly output JSON:
    $ yini parse config.yini --json

  Parse config.yini as a JavaScript object:
    $ yini parse config.yini --js

  Parse config.yini and write the output to a file:
    $ yini parse config.yini -o output.json

  Validate one YINI file and show stats:
    $ yini validate config.yini --stats

  Check whether one YINI file is valid:
    $ yini check config.yini

  Validate all YINI files in the current directory:
    $ yini validate .

For help with a specific command, use -h or --help. For example:
  $ yini validate --help

========================================================
Example YINI configuration file (config.yini)
========================================================
    ^ App
    title = 'My App'
    items = 10
    debug = ON
    tags  = ['web', 'demo', 'prod']

    ^ Server
    host   = 'localhost'
    port   = 8080
    useTLS = OFF
    limits = { timeout: 30, keepAlive: true }

        // Sub-section of Server.
        ^^ Login
        username = 'user'
        password = 'secret'
========================================================

More information:
  https://github.com/YINI-lang/yini-cli

Homepage:
  https://yini-lang.org
`
}
