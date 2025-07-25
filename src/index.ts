#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { Command } from 'commander'
import YINI from 'yini-parser'

//below works
// import * as YINI from 'yini-parser'

interface ICLIParseOptions {
    strict?: boolean
    pretty?: boolean
    output?: string
}
type TBailSensitivity = 'auto' | 0 | 1 | 2

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

function parseFile(file: string, options: ICLIParseOptions) {
    let strictMode = !!options.strict
    let bailSensitivity: TBailSensitivity = 'auto'
    let includeMetaData = false

    console.log('File = ' + file)

    // try {
    // const raw = fs.readFileSync(file, 'utf-8')
    // const parsed = YINI.parseFile(
    //const parsed = YINI.parseFile(file)
    const parsed = YINI.parseFile(
        file,
        strictMode,
        bailSensitivity,
        includeMetaData,
    )
    // const parsed = YINI.parse(raw)

    const output = options.pretty
        ? JSON.stringify(parsed, null, 2)
        : JSON.stringify(parsed)

    if (options.output) {
        fs.writeFileSync(path.resolve(options.output), output, 'utf-8')
        console.log(`✅ Output written to ${options.output}`)
    } else {
        console.log(output)
    }
    // } catch (err: any) {
    //     console.error(`Error: ${err.message}`)
    //     process.exit(1)
    // }
}

program.parseAsync()
