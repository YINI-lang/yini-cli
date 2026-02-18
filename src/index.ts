#!/usr/bin/env node
//
// (!) IMPORTANT: Leave the top shebang as the very first line! (otherwise command will break)
//
// index.ts
import { createRequire } from 'module'
import { Command, Option } from 'commander'
import { enableHelpAll } from './cli/helpAll.js'
import { printInfo } from './commands/infoCommand.js'
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
import { debugPrint, toPrettyJSON } from './utils/print.js'
import { getPackageVersion } from './utils/yiniCliHelpers.js'

const require = createRequire(import.meta.url)

// --- Helper functions --------------------------------------------------------
function appendGlobalOptionsTo(cmd: Command) {
    const help = program.createHelp()
    const globals = help.visibleOptions(program)
    if (!globals.length) return

    const lines = globals
        .map((option: Option) => {
            const optName = option.name()
            if (optName === 'version' || optName === 'help') {
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
}
// -------------------------------------------------------------------------

const program = new Command()

    .name('yini')
    .description(descr.yini)
    // Below will replace all auto-registered items (especially the descriptions starting with a capital and ending with a period).
    .version(
        getPackageVersion(),
        '-v, --version',
        'Display the version number.',
    )
    .helpOption('-h, --help', 'Display full help for all commands.')
    .helpCommand('help <command>', 'Display help for a specific command.')

program.addHelpText('before', getHelpTextBefore())
program.addHelpText('after', getHelpTextAfter())

/**
 * The (main/global) option: "--strict, --quite, --silent"
 */
// Suggestions for future: --verbose, --debug, --no-color, --color, --timing, --stdin
program
    .option('-s, --strict', 'Enable strict parsing mode.')
    // .option('-f, --force', 'Continue parsing even if errors occur.')
    .option('-q, --quiet', 'Reduce output (show only errors).')
    .option('--silent', 'Suppress all output (even errors, exit code only).')
    .option('--verbose', 'Display extra information.')
    .action((options) => {
        debugPrint('Run global options')
        if (isDebug()) {
            console.log('Global options:')
            console.log(toPrettyJSON(options))
        }
        printInfo()
    })

/**
 * The command: "parse <file>"
 */
const parseCmd = program
    .command('parse <file>')
    .description(descr['For-command-parse'])
    .option('--json', 'Output as formatted JSON (default).')
    .option('--json-compact', 'Output compact JSON (no whitespace).')
    .option('--js', 'Output as JavaScript.')
    .option('--output <file>', 'Write output to file.')
    .option('--pretty', '(deprecated) Use --json instead.')
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
        '--stats',
        'Include a statistics section (e.g., key count, nesting depth, etc.).',
    )
    // .option(
    //     '--details',
    //     'Print detailed validation info (e.g., line locations, error codes, descriptive text, etc.).',
    // )
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

/**
 * The command: "info"
 */
const infoCmd = program
    .command('info')
    .description(descr['For-command-info'])
    .enablePositionalOptions(false) // NOTE: If false, then options must appear before the subcommand (the subcommand will not see them).
    .usage(' ') // NOTE: Must be a space, to override usage (removes [options]) completely.
    .addHelpText('after', '') // (?) Prevents Commander from auto-adding option text.
    .action(() => {
        debugPrint('Run command "info"')
        printInfo()
    })
appendGlobalOptionsTo(infoCmd)

// NOTE: Converting YINI files to other formats than json and js.
// Other format should go into a new CLI-command called 'yini-convert' to not let this command grow too large.

enableHelpAll(program)

program.parseAsync()
