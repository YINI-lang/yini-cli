import { Command } from 'commander'
import pkg from '../package.json'
import { printInfo } from './commands/info'
import { parseFile } from './commands/parse'
import { validateFile } from './commands/validate'
import { isDebug } from './config/env'
import { descriptions as descripts } from './descriptions'
import { debugPrint, toPrettyJSON } from './utils/print'

const program = new Command()

/*

Idea/suggestion
yini [parse] [--strict] [--pretty] [--output]

Current suggestion:
* yini parse config.yini
	JS-style object using printObject()
	to stdout
* yini parse config.yini --pretty
	Pretty JSON	using JSON.stringify(obj, null, 4)
	to stdout
* yini parse config.yini --output out.txt
	JS-style object	
	to out.txt
* yini parse config.yini --pretty --output out.json
	Pretty JSON	
	to out.json

New suggestion:
Current suggestion:
* yini parse config.yini
	JS-style object using printObject(obj) (using using util.inspect)
	to stdout
* yini parse config.yini --pretty
	Pretty JSON	using JSON.stringify(obj, null, 4) (formatted, readable)
	to stdout
* yini parse config.yini --log
	Intended for quick output using console.log (nested object may get compacted/abbreviate)
	to stdout
* yini parse config.yini --json
	Stringigies JSON using using JSON.stringify(obj) (compact, machine-parseable)
	to stdout
* yini parse config.yini --output out.txt
	JS-style object	
	to out.txt
* yini parse config.yini --pretty --output out.json
	Pretty JSON	
	to out.json

*/

// display help for command
program.name('yini').description(descripts.yini).version(pkg.version)

program.addHelpText(
    'after',
    `
Examples:
  $ yini parse config.yini
  $ yini validate config.yini --strict
  $ yini parse config.yini --pretty --output out.json

More info: https://github.com/YINI-lang/yini-parser
`,
)

//program.command('help [command]').description('Display help for command')

// Command info
program
    .command('info')
    .description(descripts['For-command-info'])
    .action(printInfo)

/**
 *
 * Maybe later, to as default command: parse <parse>
 */
// program
//     .argument('<file>', 'File to parse')
//     .option('--strict', 'Parse YINI in strict-mode')
//     .option('--pretty', 'Pretty-print output as JSON')
//     // .option('--log', 'Use console.log output format (compact, quick view)')
//     .option('--json', 'Compact JSON output using JSON.stringify')
//     .option('--output <file>', 'Write output to a specified file')
//     .action((file, options) => {
//         if (file) {
//             parseFile(file, options)
//         } else {
//             program.help()
//         }
//     })

// Explicit "parse" command
program
    .command('parse <file>')
    .description(descripts['For-command-parse'])
    .option('--strict', 'Parse YINI in strict-mode')
    .option('--pretty', 'Pretty-print output as JSON')
    // .option('--log', 'Use console.log output format (compact, quick view)')
    .option('--json', 'Compact JSON output using JSON.stringify')
    .option('--output <file>', 'Write output to a specified file')
    .action((file, options) => {
        debugPrint('Run command "parse"')
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
program
    .command('validate <file>')
    .description(descripts['For-command-validate'])
    .option('--strict', 'Enable parsing in strict-mode')
    .option(
        '--details',
        'Print detailed meta-data info (e.g., key count, nesting, etc.)',
    )
    .option('--silent', 'Suppress output')
    .action((file, options) => {
        //@todo add debugPrint
        if (file) {
            validateFile(file, options)
        } else {
            program.help()
        }
    })

// NOTE: Converting YINI files to other formats than json and js.
// Other format should go into a new CLI-command called 'yini-convert'.

program.parseAsync()
