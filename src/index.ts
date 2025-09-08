#!/usr/bin/env node
//
// (!) IMPORTANT: Leave the top shebang as the very first line! (otherwise command will break)
//
import { createRequire } from 'module'
import { Command, Option } from 'commander'
import { parseFile } from './commands/parseCommand.js'
import { IValidateOptions, validateFile } from './commands/validateCommand.js'
import { isDebug, isDev } from './config/env.js'
import { descriptions as descr } from './descriptions.js'
import {
    getHelpTextAfter,
    getHelpTextBefore,
} from './globalOptions/helpOption.js'
import { printInfo } from './globalOptions/infoOption.js'
import { debugPrint, toPrettyJSON } from './utils/print.js'

const require = createRequire(import.meta.url)
const pkg = require('../package.json')

const program = new Command()

    .name('yini')
    .description(descr.yini)
    // Below will replace all auto-registered items (especially the descriptions starting with a capital and ending with a period).
    .version(pkg.version, '-v, --version', 'Output the version number.')
    .helpOption('-h, --help', 'Display help for command.')
    .helpCommand('help [command]', 'Display help for command.')

program.addHelpText('before', getHelpTextBefore())
program.addHelpText('after', getHelpTextAfter())

/**
 * The option (main/global): "--info"
 */
program
    .option('-i, --info', 'Show extended information (details, links, etc.).')
    .action((options) => {
        debugPrint('Run (global) option "info"')
        if (isDebug()) {
            console.log('options:')
            console.log(toPrettyJSON(options))
        }
        printInfo()
    })

/**
 * The command: "parse <file>"
 */
program
    .command('parse <file>')
    .description(descr['For-command-parse'])
    .option('--strict', 'Parse YINI in strict-mode.')
    .option('--pretty', 'Pretty-print output as JSON.')
    // .option('--log', 'Use console.log output format (compact, quick view)')
    .option('--json', 'Compact JSON output using JSON.stringify.')
    .option('--output <file>', 'Write output to a specified file.')
    .action((file, options) => {
        debugPrint('Run command "parse"')
        debugPrint('isDebug(): ' + isDebug())
        debugPrint('isDev()  : ' + isDev())
        debugPrint(`<file> = ${file}`)
        if (isDebug()) {
            console.log('options:')
            console.log(toPrettyJSON(options))
        }
        if (file) {
            parseFile(file, options)
        } else {
            program.help()
        }
    })

/**
 * To handle command validate, e.g.:
 *      yini validate config.yini
 *      yini validate config.yini --strict
 *      yini validate config.yini --report
 *      yini validate config.yini --details
 *      yini validate config.yini --silent
 *
 * If details:
 * Details:
 * - YINI version: 1.0.0-beta.6
 * - Mode: strict
 * - Keys: 42
 * - Sections: 6
 * - Nesting depth: 3
 * - Has @yini: true
 */
/**
 * The command: "validate <file>"
 */
program
    .command('validate <file>')
    .description(descr['For-command-validate'])
    .option('--strict', 'Enable parsing in strict-mode')
    .option(
        '--report',
        'Print detailed meta-data info (e.g., key count, nesting, etc.).',
    )
    .option(
        '--details',
        'Print detailed validation info (e.g., line locations, error codes, descriptive text, etc.).',
    )
    .option('--silent', 'Suppress output')
    .action((file, options: IValidateOptions) => {
        //@todo add debugPrint
        console.log('"validate" options:')
        console.log(options)

        if (file) {
            validateFile(file, options)
        } else {
            program.help()
        }
    })

// About to get deleted, moved to main option --info
//@todo Delete
program
    .command('info')
    // .command('')
    .description(descr['For-command-info'])
    // .option('info')
    .action((options) => {
        debugPrint('Run command "info"')
        if (isDebug()) {
            console.log('options:')
            console.log(toPrettyJSON(options))
        }
        console.warn(
            'Deprecated: Use `yini --info` or `yini -i` instead of `yini info`.',
        )
        printInfo()
    })

// NOTE: Converting YINI files to other formats than json and js.
// Other format should go into a new CLI-command called 'yini-convert'.

program.parseAsync()
