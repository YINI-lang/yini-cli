#!/usr/bin/env node
//
// (!) IMPORTANT: Leave the top shebang as the very first line! (otherwise command will break)
//
import { createRequire } from 'module'
import { Command, Option } from 'commander'
import { IParseCommandOptions, parseFile } from './commands/parseCommand.js'
import {
    IValidateCommandOptions,
    validateFile,
} from './commands/validateCommand.js'
import { isDebug, isDev } from './config/env.js'
import { descriptions as descr } from './descriptions.js'
import {
    getHelpTextAfter,
    getHelpTextBefore,
} from './globalOptions/helpOption.js'
import { printInfo } from './globalOptions/infoOption.js'
import { debugPrint, toPrettyJSON } from './utils/print.js'
import { getPackageVersion } from './utils/yiniCliHelpers.js'

const require = createRequire(import.meta.url)
// const pkg = require('../package.json')

// --- Helper functions --------------------------------------------------------
function appendGlobalOptionsTo(cmd: Command) {
    const help = program.createHelp()
    const globals = help.visibleOptions(program)
    if (!globals.length) return

    const lines = globals
        // .map(
        //     (opt) =>
        //         `  ${help.optionTerm(opt)}  ${help.optionDescription(opt)}`,
        // )
        // .join('\n')
        .map((option: Option) => {
            const optName = option.name()
            if (
                optName === 'version' ||
                optName === 'info' ||
                optName === 'help'
            ) {
                debugPrint(
                    'Skip patching option.name() = ' +
                        option.name() +
                        ' into per-command help',
                )
            } else {
                return `  ${help.optionTerm(option)}  ${help.optionDescription(option)}`
            }
        })
        .join('\n')
        .trim()

    cmd.addHelpText('after', `\nGlobal options:\n  ${lines}`)
    // cmd.addHelpText('after', `  ${lines}`)
}
// -------------------------------------------------------------------------

const program = new Command()

    .name('yini')
    .description(descr.yini)
    // Below will replace all auto-registered items (especially the descriptions starting with a capital and ending with a period).
    .version(getPackageVersion(), '-v, --version', 'Output the version number.')
    .helpOption('-h, --help', 'Display help for command.')
    .helpCommand('help [command]', 'Display help for command.')

program.addHelpText('before', getHelpTextBefore())
program.addHelpText('after', getHelpTextAfter())

/**
 * The (main/global) option: "--info, --strict, --quite, --silent"
 */
// Suggestions for future: --verbose, --debug, --no-color, --color, --timing, --stdin
program
    .option('-i, --info', 'Show extended information (details, links, etc.).')
    .option('-s, --strict', 'Enable strict parsing mode.')
    .option('-f, --force', 'Continue parsing even if errors occur.')
    .option('-q, --quiet', 'Reduce output (show only errors).')
    .option('--silent', 'Suppress all output (even errors, exit code only).')
    .action((options) => {
        debugPrint('Run global options')
        if (isDebug()) {
            console.log('Global options:')
            console.log(toPrettyJSON(options))
        }
        printInfo()
    })

/**
 * The (main/global) option: "--info"
 */
// program
//     .option('-s, --strict', 'Enable parsing in strict-mode.')
//     .action((options) => {
//         debugPrint('Run (global) option "strict"')
//         if (isDebug()) {
//             console.log('options:')
//             console.log(toPrettyJSON(options))
//         }
//         printInfo()
//     })

/**
 * The command: "parse <file>"
 */
const parseCmd = program
    .command('parse <file>')
    .description(descr['For-command-parse'])
    .option('--pretty', 'Pretty-print output as JSON.')
    .option('--json', 'Compact JSON output using JSON.stringify.')
    .option('--output <file>', 'Write output to a specified file.')
    .action((file, options: IParseCommandOptions) => {
        const globals = program.opts() // Global options.
        const mergedOptions = { ...globals, ...options } // Merge global options with per-command options.

        debugPrint('Run command "parse"')
        debugPrint('isDebug(): ' + isDebug())
        debugPrint('isDev()  : ' + isDev())
        debugPrint(`<file> = ${file}`)
        if (isDebug()) {
            console.log('mergedOptions:')
            console.log(toPrettyJSON(mergedOptions))
        }
        if (file) {
            parseFile(file, mergedOptions)
        } else {
            program.help()
        }
    })
appendGlobalOptionsTo(parseCmd)

/**
 * The command: "validate <file>"
 */
const validateCmd = program
    .command('validate <file>')
    .description(descr['For-command-validate'])
    .option(
        '--report',
        'Print detailed meta-data info (e.g., key count, nesting, etc.).',
    )
    .option(
        '--details',
        'Print detailed validation info (e.g., line locations, error codes, descriptive text, etc.).',
    )
    // .option('--silent', 'Suppress output')
    .action((file, options: IValidateCommandOptions) => {
        const globals = program.opts() // Global options.
        const mergedOptions = { ...globals, ...options } // Merge global options with per-command options.

        debugPrint('Run command "parse"')
        debugPrint('isDebug(): ' + isDebug())
        debugPrint('isDev()  : ' + isDev())
        debugPrint(`<file> = ${file}`)
        if (isDebug()) {
            console.log('mergedOptions:')
            console.log(toPrettyJSON(mergedOptions))
        }
        if (file) {
            validateFile(file, mergedOptions)
        } else {
            program.help()
        }
    })
appendGlobalOptionsTo(validateCmd)

// About to get deleted, moved to main option --info
//@todo Delete
program
    .command('info')
    .description(descr['For-command-info'])
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
