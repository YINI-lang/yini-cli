import { Command } from 'commander'
import { parseFile } from './commands/parse'

const program = new Command()

program
    .name('yini')
    .description(
        'A CLI for parsing, validating, and working with YINI configuration files',
    )
    .version('0.1.0')

// Default action: if only a file is passed, treat it like `parse`
program
    .argument('[file]', 'YINI file to parse')
    .option('--strict', 'Enable strict mode')
    .option('--pretty', 'Pretty-print the output')
    .option('--output <file>', 'Write JSON output to file instead of stdout')
    .action((file, options) => {
        if (file) {
            parseFile(file, options)
        } else {
            program.help()
        }
    })

// Explicit `parse` command (same as above, for clarity)
program
    .command('parse <file>')
    .description('Parse a YINI file and output JSON')
    .option('--strict', 'Enable strict mode')
    .option('--pretty', 'Pretty-print the output')
    .option('--output <file>', 'Write JSON output to file instead of stdout')
    .action((file, options) => {
        parseFile(file, options)
    })

program.parseAsync()
