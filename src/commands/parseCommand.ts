import fs from 'node:fs'
import path from 'node:path'
import util from 'util'
import YINI, { ParseOptions, PreferredFailLevel } from 'yini-parser'
import { IGlobalOptions } from '../types.js'
import {
    debugPrint,
    printObject,
    toPrettyJS,
    toPrettyJSON,
} from '../utils/print.js'

type TOutputStyle = 'JS-style' | 'Pretty-JSON' | 'Console.log' | 'JSON-compact'

// --- CLI command "parse" commandOptions --------------------------------------------------------
/**
 * @deprecated pretty Deprecated since 2026 Feb! Use `json` instead.
 */
export interface IParseCommandOptions extends IGlobalOptions {
    pretty?: boolean // Deprecated since 2026 Feb! Use `--json` instead.
    json?: boolean // JSON prettyfied (DEFAULT),
    compact?: boolean // Output compact JSON (no whitespace).
    js?: boolean // Output as JavaScript
    output?: string
    bestEffort?: boolean // --best-effort = 'ignore-errors'
    overwrite?: boolean // Allow to save/write over existing file(s).
    force?: boolean // Same as --overwrite.
}
// -------------------------------------------------------------------------

/*
    TODO / SHOULD-DO:

    yini parse <file> [options]

    Options
    -------

    Parsing mode:
    --strict
    --lenient                   (default)

    Output format:
    --to <json|json-compact>    (default, --to json)
    --json                      (alias for --to json, default)
    --json-compact              (alias for --to json-compact)

    Output handling:
    -o, --output <file>         (default) No overwrite if dest is more recent than source file (override with --overwrite)
    --overwrite
    --no-overwrite           

    Execution control:
    --fail-fast
	--best-effort = ignore-errors within a file, attempt recovery and still emit outp
	            --No for parse, --keep-going = continue to the next file when one fails
    --max-errors <n>
    --verbose
    --checks                    (default)
    --no-checks

    Policy control (advanced):
    --duplicates-policy <error|warn|allow>
    --reserved-policy   <error|warn|allow>
 */
export const parseFile = (
    file: string,
    commandOptions: IParseCommandOptions,
) => {
    const outputFile = commandOptions.output || ''
    const isStrictMode = !!commandOptions.strict
    let outputStyle: TOutputStyle = 'Pretty-JSON'

    debugPrint('file = ' + file)
    debugPrint('output = ' + commandOptions.output)
    debugPrint('commandOptions:')
    printObject(commandOptions)

    if (commandOptions.compact) {
        outputStyle = 'JSON-compact'
    } else if (commandOptions.js) {
        outputStyle = 'JS-style'
    } else if (commandOptions.pretty) {
        console.warn('Warning: --pretty is deprecated. Use --json instead.')
    }

    doParseFile(file, commandOptions, outputStyle, outputFile)
}

const doParseFile = (
    file: string,
    commandOptions: IParseCommandOptions,
    outputStyle: TOutputStyle,
    outputFile = '',
) => {
    // let strictMode = !!commandOptions.strict
    let preferredFailLevel: PreferredFailLevel = 'auto'
    let includeMetaData = false

    debugPrint('File = ' + file)
    debugPrint('outputStyle = ' + outputStyle)

    const parseOptions: ParseOptions = {
        strictMode: commandOptions.strict ?? false,
        // failLevel: 'errors',
        failLevel: preferredFailLevel,
        // failLevel: 'ignore-errors',
        includeMetadata: includeMetaData,
    }

    // If --best-effort then override fail-level.
    if (commandOptions.bestEffort) {
        parseOptions.failLevel = 'ignore-errors'
    }

    try {
        const parsed = YINI.parseFile(file, parseOptions)

        let output = ''
        switch (outputStyle) {
            case 'JS-style':
                //output = util.inspect(parsed, { depth: null, colors: true })
                output = toPrettyJS(parsed)
                break

            case 'Pretty-JSON':
                output = toPrettyJSON(parsed)
                break

            case 'Console.log':
                output = '<todo>'
                break

            case 'JSON-compact':
                output = JSON.stringify(parsed)
                break

            default:
                output = util.inspect(parsed, { depth: null, colors: false })
        }

        if (outputFile) {
            if (
                fs.existsSync(outputFile) &&
                (!commandOptions.force || !commandOptions.overwrite)
            ) {
                console.error(
                    `Error: File "${outputFile}" already exists. Use --force to overwrite.`,
                )
                process.exit(1)
            }

            // Write JSON output to file instead of stdout.
            fs.writeFileSync(path.resolve(outputFile), output, 'utf-8')
            console.log(`Output written to file: "${outputFile}"`)
        } else {
            console.log(output)
        }
    } catch (err: any) {
        console.error(`Error: ${err.message}`)
        process.exit(1)
    }
}
function toCleanPrettyJS(parsed: any): string {
    throw new Error('Function not implemented.')
}
