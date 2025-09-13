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

Parse and validate YINI configuration files.
A config format, inspired by INI, with type-safe values, nested
sections, comments, minimal syntax noise, and optional strict mode.

Designed for clarity and consistency. :)\n`
}

/**
 * Text to be displayed AFTER the built-in help text block.
 */
export const getHelpTextAfter = () => {
    return `
Examples:
  $ yini parse config.yini
  $ yini validate config.yini --strict
  $ yini parse config.yini --pretty --output out.json

For help with a specific command, use -h or --help. For example:
  $ yini validate --help

Sample "config.yini":
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

More info:
https://github.com/YINI-lang/yini-cli

Into to YINI Config:
https://github.com/YINI-lang/YINI-spec/blob/develop/Docs/Intro-to-YINI-Config-Format.md`
}
