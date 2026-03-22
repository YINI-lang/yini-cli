// src/commands/parseCommand.ts
import fs from 'node:fs'
import path from 'node:path'
import YINI, {
    ParseOptions,
    PreferredFailLevel,
    YiniParseResult,
} from 'yini-parser'
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

/**
 * Will return true if:
 *   * --overwrite was not explicitly given
 *   * destination exists
 *   * destination is newer than source
 * @returns
 */
export const shouldSkipBecauseDestNewer = (
    file: string,
    optionOverwrite?: boolean | undefined,
    // optionVerbose?: boolean | undefined,
    outputFile = '',
): boolean => {
    if (outputFile && optionOverwrite === undefined) {
        const resolved = path.resolve(outputFile)

        if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
            const srcStat = fs.statSync(file)
            const destStat = fs.statSync(resolved)

            if (destStat.mtimeMs > srcStat.mtimeMs) {
                return true
            }
        }
    }

    return false
}

export const isAllowWriteOutput = (
    srcPath: string,
    destPath: string,
    newContent: string,
    overwrite?: boolean,
): boolean => {
    if (!fs.existsSync(destPath)) {
        return true
    }

    if (overwrite === true) {
        return true
    }

    if (overwrite === false) {
        throw new Error(
            `File "${destPath}" already exists. Overwriting disabled (--no-overwrite).`,
        )
    }

    const srcStat = fs.statSync(srcPath)
    const destStat = fs.statSync(destPath)

    if (destStat.mtimeMs > srcStat.mtimeMs) {
        reportAction('skip', destPath, `newer than source "${srcPath}"`)
        return false
    }

    const existing = fs.readFileSync(destPath, 'utf-8')

    if (existing === newContent) {
        reportAction('skip', destPath, 'output unchanged')
        return false
    }

    return true
}

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

/**
 * Returns true if the parsed result appears to contain usable output data.
 *
 * This is used by the CLI to distinguish between:
 * - parse runs that reported errors but still recovered meaningful data, and
 * - parse runs that failed so badly that no useful parsed structure was produced.
 *
 * A value is considered meaningful only if it is:
 * - not null or undefined,
 * - an object,
 * - and contains at least one own top-level property.
 *
 * @param value The parsed result data to inspect.
 * @returns True if the parsed result looks usable for output; otherwise false.
 */
const hasMeaningfulParsedData = (value: unknown): boolean => {
    if (value == null) return false
    if (typeof value !== 'object') return false
    return Object.keys(value as Record<string, unknown>).length > 0
}

const doParseFile = (
    file: string,
    commandOptions: IParseCommandOptions,
    outputFormat: TOutputFormat,
    outputFile = '',
) => {
    debugPrint('File = ' + file)
    debugPrint('outputFormat = ' + outputFormat)

    const parseOptions: ParseOptions = {
        strictMode: commandOptions.strict ?? false,
        failLevel: commandOptions.bestEffort ? 'ignore-errors' : 'auto',
        includeMetadata: true,
        includeDiagnostics: true,
    }

    // Check early if should skip before parsing,
    // saves a lot of time in some cases.
    if (
        shouldSkipBecauseDestNewer(
            file,
            commandOptions.overwrite,
            // commandOptions.verbose,
            outputFile,
        )
    ) {
        if (commandOptions.verbose) {
            const resolved = path.resolve(outputFile)
            reportAction('skip', resolved, `newer than source "${file}"`)
        }

        return
    }

    try {
        const parsedWithMeta: YiniParseResult = YINI.parseFile(
            file,
            parseOptions,
        )
        const errorCount =
            parsedWithMeta?.meta?.diagnostics?.errors?.errorCount ?? 0

        const parsedData = parsedWithMeta.result
        const hasUsableOutput = hasMeaningfulParsedData(parsedData)

        if (
            errorCount > 0 &&
            !commandOptions.bestEffort &&
            (commandOptions.strict || !hasUsableOutput)
        ) {
            process.exit(1)
        }

        const serializer = getSerializer(outputFormat)
        const output = serializer.serialize(parsedData)

        if (outputFile) {
            const resolved = path.resolve(outputFile)

            if (
                !isAllowWriteOutput(
                    file,
                    resolved,
                    output,
                    commandOptions.overwrite,
                )
            ) {
                return
            }

            fs.writeFileSync(resolved, output, 'utf-8')

            if (commandOptions.verbose) {
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
