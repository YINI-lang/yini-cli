import { Command } from 'commander'
import pkg from '../package.json'
import { convertFile } from './commands/convert'
import { parseFile } from './commands/parse'
import { validateFile } from './commands/validate'

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

program
    .name('yini')
    .description('CLI for parsing and validating YINI config files')
    .version(pkg.version)

// Default command: parse
program
    .argument('', 'Parse a YINI file and print the result')
    .option('--pretty', 'Pretty-print output as JSON')
    .option('--log', 'Use console.log output format (compact, quick view)')
    .option('--json', 'Compact JSON output using JSON.stringify')
    .option('--output ', 'Write output to a specified file')
    .action((file, options) => {
        if (file) {
            parseFile(file, options)
        } else {
            program.help()
        }
    })

// Explicit "parse" command
program
    .command('parse <file>')
    .description('Parse a YINI file and print the result')
    .option('--pretty', 'Pretty-print output as JSON')
    .option('--log', 'Use console.log output format (compact, quick view)')
    .option('--json', 'Compact JSON output using JSON.stringify')
    .option('--output ', 'Write output to a specified file')
    .action((file, options) => {
        parseFile(file, options)
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
    .description('Validate a YINI file against the specification')
    .option('--strict', 'Enable strict mode')
    .option(
        '--details',
        'Print detailed validation info (e.g., key count, nesting, etc.)',
    )
    .option('--silent', 'Will suppress output.')
    .action((file, options) => {
        validateFile(file, options)
    })

// In here other formats than json and js should go.
/**
 * To handle command convert, e.g.:
 *      yini convert config.yini --json
 *      yini convert config.yini --yaml --output config.yaml
 *      yini convert config.yini --xml
 */
// program
//     .command('convert <file>')
//     .description('Convert a YINI file to JSON, YAML, or XML')
//     .option('--json', 'Convert to JSON (default)')
//     .option('--yaml', 'Convert to YAML')
//     .option('--xml', 'Convert to XML')
//     .option('--output <file>', 'Write converted output to a file')
//     .action((file, options) => {
//         convertFile(file, options)
//     })

program.parseAsync()
