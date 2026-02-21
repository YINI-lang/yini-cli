import fs from 'node:fs'
import path from 'node:path'
import YINI, { ParseOptions, PreferredFailLevel } from 'yini-parser'
import { IGlobalOptions } from '../types.js'
import {
    debugPrint,
    printObject,
    toPrettyJS,
    toPrettyJSON,
} from '../utils/print.js'

type TOutputStyle = 'JS-style' | 'Pretty-JSON' | 'JSON-compact'

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
    // force?: boolean // Same as --overwrite.
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
    --compact              (alias for --to json-compact)

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
    // const isStrictMode = !!commandOptions.strict

    const outputStyle = resolveOutputStyle(commandOptions)

    debugPrint('file = ' + file)
    debugPrint('output = ' + commandOptions.output)
    debugPrint('commandOptions:')
    printObject(commandOptions)

    doParseFile(file, commandOptions, outputStyle, outputFile)
}

const resolveOutputStyle = (options: IParseCommandOptions): TOutputStyle => {
    if (options.js && options.compact) {
        throw new Error('--js and --compact cannot be combined.')
    }

    if (options.compact) return 'JSON-compact'
    if (options.js) return 'JS-style'

    if (options.pretty) {
        console.warn('Warning: --pretty is deprecated. Use --json instead.')
    }

    return 'Pretty-JSON'
}

const renderOutput = (parsed: unknown, style: TOutputStyle): string => {
    switch (style) {
        case 'JS-style':
            return toPrettyJS(parsed)

        case 'JSON-compact':
            return JSON.stringify(parsed)

        case 'Pretty-JSON':
        default:
            return toPrettyJSON(parsed)
    }
}

const doParseFile = (
    file: string,
    commandOptions: IParseCommandOptions,
    outputStyle: TOutputStyle,
    outputFile = '',
) => {
    // let strictMode = !!commandOptions.strict
    let preferredFailLevel: PreferredFailLevel = commandOptions.bestEffort
        ? 'ignore-errors'
        : 'auto'
    let includeMetaData = false

    debugPrint('File = ' + file)
    debugPrint('outputStyle = ' + outputStyle)

    const parseOptions: ParseOptions = {
        strictMode: commandOptions.strict ?? false,
        failLevel: preferredFailLevel,
        includeMetadata: includeMetaData,
    }

    // If --best-effort then override fail-level.
    if (commandOptions.bestEffort) {
        parseOptions.failLevel = 'ignore-errors'
    }

    try {
        const parsed = YINI.parseFile(file, parseOptions)
        const output = renderOutput(parsed, outputStyle)

        if (outputFile) {
            const resolved = path.resolve(outputFile)

            enforceWritePolicy(file, resolved, commandOptions.overwrite)

            // Write JSON output to file instead of stdout.
            fs.writeFileSync(resolved, output, 'utf-8')

            if (commandOptions.verbose) {
                console.log(`Output written to file: "${outputFile}"`)
            }
        } else {
            console.log(output)
        }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)

        console.error(`Error: ${message}`)
        process.exit(1)
    }
}

const enforceWritePolicy = (
    srcPath: string,
    destPath: string,
    overwrite?: boolean,
) => {
    if (!fs.existsSync(destPath)) {
        return // File does not exist, OK to write.
    }

    const srcStat = fs.statSync(srcPath)
    const destStat = fs.statSync(destPath)

    const destIsNewer = destStat.mtimeMs >= srcStat.mtimeMs

    if (overwrite === true) {
        return // Explicit overwrite, OK.
    }

    if (overwrite === false) {
        throw new Error(
            `File "${destPath}" already exists. Overwriting disabled (--no-overwrite).`,
        )
    }

    // Default policy (overwrite undefined).
    if (destIsNewer) {
        throw new Error(
            `Destination file "${destPath}" is newer than source. Use --overwrite to force.`,
        )
    }
}
