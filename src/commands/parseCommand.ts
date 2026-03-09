// src/commands/parseCommand.ts

import fs from 'node:fs'
import path from 'node:path'
import YINI, { ParseOptions, PreferredFailLevel } from 'yini-parser'
import { getSerializer, TOutputFormat } from '../serializers/index.js'
import { IGlobalOptions } from '../types.js'
import { debugPrint, printObject } from '../utils/print.js'

// --- CLI command "parse" commandOptions --------------------------------------------------------
/**
 * @deprecated pretty Deprecated since 2026 Feb! Use `json` instead.
 */
export interface IParseCommandOptions extends IGlobalOptions {
    pretty?: boolean // Deprecated since 2026 Feb! Use `--json` instead.
    json?: boolean // JSON prettyfied (DEFAULT),
    compact?: boolean // Output compact JSON (no whitespace).
    js?: boolean // Output as JavaScript
    yaml?: boolean
    xml?: boolean
    output?: string
    bestEffort?: boolean // --best-effort = 'ignore-errors'
    overwrite?: boolean // Allow to save/write over existing file(s).
    // force?: boolean // Same as --overwrite.
}
// -------------------------------------------------------------------------

const reportAction = (
    action: 'write' | 'skip',
    file: string,
    reason?: string,
) => {
    let txt = ''

    if (reason) {
        txt = `${action.padEnd(6)} "${file}" (${reason})`
    } else {
        txt = `${action.padEnd(6)} "${file}"`
    }

    if (action === 'skip') {
        console.warn(txt)
    } else {
        console.log(txt)
    }
}

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

    const outputFormat = resolveOutputFormat(commandOptions)

    debugPrint('file = ' + file)
    debugPrint('output = ' + commandOptions.output)
    debugPrint('commandOptions:')
    printObject(commandOptions)

    doParseFile(file, commandOptions, outputFormat, outputFile)
}

const resolveOutputFormat = (options: IParseCommandOptions): TOutputFormat => {
    if (options.js && options.compact) {
        throw new Error('--js and --compact cannot be combined.')
    }

    if (options.compact) return 'json-compact'
    if (options.js) return 'js'
    if (options.yaml) return 'yaml'
    if (options.xml) return 'xml'

    if (options.pretty) {
        console.warn('Warning: --pretty is deprecated. Use --json instead.')
    }

    return 'json'
}

/*
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
*/

const doParseFile = (
    file: string,
    commandOptions: IParseCommandOptions,
    outputFormat: TOutputFormat,
    outputFile = '',
) => {
    let preferredFailLevel: PreferredFailLevel = commandOptions.bestEffort
        ? 'ignore-errors'
        : 'auto'
    let includeMetaData = false

    debugPrint('File = ' + file)
    debugPrint('outputFormat = ' + outputFormat)

    const parseOptions: ParseOptions = {
        strictMode: commandOptions.strict ?? false,
        failLevel: commandOptions.bestEffort ? 'ignore-errors' : 'auto',
        includeMetadata: false,
    }

    // If --best-effort then override fail-level.
    // if (commandOptions.bestEffort) {
    //     parseOptions.failLevel = 'ignore-errors'
    // }

    try {
        const parsed = YINI.parseFile(file, parseOptions)

        const serializer = getSerializer(outputFormat)
        const output = serializer.serialize(parsed)

        if (outputFile) {
            const resolved = path.resolve(outputFile)

            const canWrite = enforceWritePolicy(
                file,
                resolved,
                commandOptions.overwrite,
            )

            if (!canWrite) {
                if (commandOptions.verbose) {
                    console.log(`skip    Skipping write to "${resolved}"`)
                }

                return
            }

            // Double check, if the file was actually changed by comparing the contents.
            if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
                const existing = fs.readFileSync(resolved, 'utf-8')

                // Only write the output file if the content actually changed.
                // Prevents constantly showing meaningless rewrites, in some cases.
                if (existing === output) {
                    if (commandOptions.verbose) {
                        // console.log(
                        //     `skip    Output unchanged. Skipping write: "${resolved}"`,
                        // )
                        reportAction('skip', resolved, 'output unchanged')
                    }
                    return
                }
            }

            // Write JSON output to file instead of stdout.
            fs.writeFileSync(resolved, output, 'utf-8')

            if (commandOptions.verbose) {
                // console.log(`write    Output written to file: "${outputFile}"`)
                reportAction('write', resolved)
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
): boolean => {
    if (!fs.existsSync(destPath)) {
        return true // File does not exist, OK to write.
    }

    const srcStat = fs.statSync(srcPath)
    const destStat = fs.statSync(destPath)

    // Only strictly newer triggers skip overwrite.
    const destIsNewer = destStat.mtimeMs > srcStat.mtimeMs

    if (overwrite === true) {
        return true // Explicit overwrite, OK.
    }

    if (overwrite === false) {
        throw new Error(
            `File "${destPath}" already exists. Overwriting disabled (--no-overwrite).`,
        )
    }

    // Default policy (overwrite undefined).
    if (destIsNewer) {
        // console.warn(
        //     // `Destination file "${destPath}" is newer than source. Use --overwrite to force.`,
        //     //`Warning: destination file "${destPath}" is newer than source. Skipping write. Use --overwrite to force.`,
        //     `Warning: destination "${destPath}" is newer than source "${srcPath}". Skipping write. Use --overwrite to force.`,
        // )
        reportAction('skip', destPath, `newer than source "${srcPath}"`)
        return false
    }

    return true
}
