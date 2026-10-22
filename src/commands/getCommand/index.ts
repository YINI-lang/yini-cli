import YINI, { ParseOptions, YiniParseResult } from 'yini-parser'
import { getPrettyJSON } from '../../serializers/jsonSerializer.js'
import { IGlobalOptions } from '../../types.js'
import {
    printStderr,
    printWarning,
    resolveStrictMode,
} from '../commonFunctions.js'
import { getPath, GetPathError } from './getPath.js'

export interface IGetCommandOptions extends IGlobalOptions {
    format?: 'text' | 'json' | 'json-compact'
}

const formatIssue = (issue: {
    message: string
    line?: number
    column?: number
}) => {
    const location =
        issue.line == null
            ? ''
            : `line ${issue.line}${issue.column == null ? '' : `:${issue.column}`}: `
    return `${location}${issue.message}`
}

const describeValue = (value: unknown): string => {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'a list'
    if (typeof value === 'object') return 'an object'
    return `a ${typeof value}`
}

const reportPathError = (options: IGetCommandOptions, error: GetPathError) => {
    switch (error.kind) {
        case 'malformed-path':
            printStderr(
                options,
                `Error: Invalid path ${JSON.stringify(error.path)}. ${error.reason}`,
            )
            break
        case 'missing-property': {
            printStderr(options, `Error: Path not found: ${error.path}`)
            if (!options.quiet && !options.silent && error.keys.length > 0) {
                const keys = [...error.keys].sort()
                const shown = keys.slice(0, 10)
                printStderr(
                    options,
                    `Available keys under "${error.parent || '<document>'}":\n${shown.map((key) => `  ${key}`).join('\n')}${keys.length > 10 ? `\n  ... and ${keys.length - 10} more` : ''}`,
                )
            }
            break
        }
        case 'invalid-list-index':
            printStderr(
                options,
                `Error: Invalid list index "${error.index}" below "${error.parent}". List indexes must be non-negative base-10 integers without leading zeroes and must be safe integers.`,
            )
            break
        case 'out-of-range-index':
            printStderr(
                options,
                `Error: Index ${error.index} is out of range for "${error.parent}" (${error.length} items).`,
            )
            break
        case 'invalid-traversal':
            printStderr(
                options,
                `Error: Cannot access "${error.component}" below "${error.parent}". "${error.parent}" is ${describeValue(error.value)}.`,
            )
            break
    }
}

const formatValue = (value: unknown, format?: IGetCommandOptions['format']) => {
    if (format === 'json') return getPrettyJSON(value)
    if (format === 'json-compact') return JSON.stringify(value)
    if (value !== null && typeof value === 'object') {
        if (format === 'text') {
            throw new Error(
                'Text output is only available for scalar values. Use --format json or --format json-compact for objects and lists.',
            )
        }
        return getPrettyJSON(value)
    }
    if (typeof value === 'string') return value
    return String(value)
}

const readStdin = async (): Promise<string> => {
    process.stdin.setEncoding('utf8')
    let content = ''
    for await (const chunk of process.stdin) content += chunk
    return content
}

export const getValue = async (
    file: string,
    path: string | undefined,
    options: IGetCommandOptions,
): Promise<void> => {
    try {
        const strictMode = resolveStrictMode(options)
        const parseOptions: ParseOptions = {
            strictMode,
            failLevel: 'ignore-errors',
            includeMetadata: true,
            includeDiagnostics: true,
            silent: true,
        }

        if (options.verbose && !options.quiet && !options.silent) {
            printStderr(
                options,
                `Reading YINI from ${file === '-' ? 'stdin' : file}.`,
            )
        }

        const parsed: YiniParseResult =
            file === '-'
                ? YINI.parse(await readStdin(), parseOptions)
                : YINI.parseFile(file, parseOptions)
        const diagnostics = parsed?.meta?.diagnostics
        if (!diagnostics || !diagnostics.errors || !diagnostics.warnings) {
            throw new Error('Missing parser diagnostics metadata.')
        }

        for (const warning of diagnostics.warnings.payload) {
            printWarning(options, `Warning: ${formatIssue(warning)}`)
        }
        if (
            diagnostics.errors.errorCount > 0 ||
            diagnostics.errors.payload.length > 0
        ) {
            if (diagnostics.errors.payload.length === 0) {
                printStderr(options, 'Error: Failed to parse YINI input.')
            }
            for (const error of diagnostics.errors.payload) {
                printStderr(options, `Error: ${formatIssue(error)}`)
            }
            process.exitCode = 1
            return
        }

        const selected = getPath(parsed.result, path)
        if (!selected.ok) {
            reportPathError(options, selected.error)
            process.exitCode = 1
            return
        }

        const output = formatValue(selected.value, options.format)
        if (!options.silent) {
            process.stdout.write(output.endsWith('\n') ? output : `${output}\n`)
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        printStderr(options, `Error: ${message}`)
        process.exitCode = 1
    }
}
