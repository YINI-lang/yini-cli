/*
 * validateCommand.ts
 *
 * Behavioral spec and output conventions:
 * see docs/cli/validate-command.md
 */

// commands/validateCommand.ts
import fs from 'node:fs'
import path from 'node:path'
import YINI, {
    IssuePayload,
    ParseOptions,
    ResultMetadata,
    YiniParseResult,
} from 'yini-parser'
import { IGlobalOptions } from '../types.js'
import {
    printStderr,
    printStdout,
    resolveStrictMode,
} from './commonFunctions.js'

// --- CLI command "validate" commandOptions -----------------------------------
export interface IValidateCommandOptions extends IGlobalOptions {
    stats?: boolean
    warningsAsErrors?: boolean
    format?: 'json' | 'text'
    failFast?: boolean
    recursive?: boolean
    maxErrors?: number
}
// -----------------------------------------------------------------------------

type TMode = 'strict' | 'lenient' | 'custom'
type TIssueSeverity = 'error' | 'warning' | 'notice' | 'info'
type TFileStatus = 'passed' | 'passed-with-warnings' | 'failed'
type TOverallStatus = 'passed' | 'passed-with-warnings' | 'failed'

interface IValidationIssue {
    severity: TIssueSeverity
    code: string
    message: string
    line: number
    column: number
    advice?: string
    hint?: string
}

interface IFileValidationResult {
    file: string
    mode: TMode
    status: TFileStatus
    errors: number
    warnings: number
    notices: number
    infos: number
    issues: IValidationIssue[]
    metadata: ResultMetadata | null
    fatalError?: string
}

interface IAggregateValidationResult {
    mode: 'strict' | 'lenient'
    status: TOverallStatus
    filesChecked: number
    failedFiles: number
    errors: number
    warnings: number
    notices: number
    infos: number
    displayBaseDir: string
    results: IFileValidationResult[]
}

// --- Public entrypoint -------------------------------------------------------

export const validateTargets = (
    targets: string[],
    options: IValidateCommandOptions,
) => {
    try {
        const strictMode = resolveStrictMode(options)
        const mode: 'strict' | 'lenient' = strictMode ? 'strict' : 'lenient'
        const recursive = options.recursive ?? true

        const files = collectFilesFromTargets(targets, recursive)

        if (!files.length) {
            throw new Error('No YINI files found to validate.')
        }

        const displayBaseDir = getDisplayBaseDir(targets)
        const aggregate: IAggregateValidationResult = {
            mode,
            status: 'passed',
            filesChecked: 0,
            failedFiles: 0,
            errors: 0,
            warnings: 0,
            notices: 0,
            infos: 0,
            displayBaseDir,
            results: [],
        }

        let totalErrorsSeen = 0

        for (const file of files) {
            const result = validateOneFile(file, options)

            aggregate.results.push(result)
            aggregate.filesChecked += 1
            aggregate.errors += result.errors
            aggregate.warnings += result.warnings
            aggregate.notices += result.notices
            aggregate.infos += result.infos

            if (result.status === 'failed') {
                aggregate.failedFiles += 1
            }

            totalErrorsSeen += result.errors

            if (options.failFast && result.status === 'failed') {
                break
            }

            if (
                typeof options.maxErrors === 'number' &&
                totalErrorsSeen >= options.maxErrors
            ) {
                break
            }
        }

        aggregate.status = resolveAggregateStatus(aggregate, options)

        if (!options.silent) {
            if (options.format === 'json') {
                printStdout(options, formatJsonReport(aggregate, options))
            } else {
                printTextReport(aggregate, options)
            }
        }

        const exitCode = getValidationExitCode(aggregate, options)
        process.exit(exitCode)
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        printStderr(options, `Error: ${msg}`)
        process.exit(2)
    }
}

// --- File collection ---------------------------------------------------------

const collectFilesFromTargets = (
    targets: string[],
    recursive: boolean,
): string[] => {
    const out = new Set<string>()

    for (const target of targets) {
        const resolved = path.resolve(target)

        if (!fs.existsSync(resolved)) {
            throw new Error(`Path does not exist: "${target}"`)
        }

        const stat = fs.statSync(resolved)

        if (stat.isFile()) {
            out.add(resolved)
            continue
        }

        if (!stat.isDirectory()) {
            throw new Error(`Not a file or directory: "${target}"`)
        }

        for (const file of collectFilesFromDirectory(resolved, recursive)) {
            out.add(file)
        }
    }

    // Sort the files before validation for stable output.
    return [...out].sort((a, b) => a.localeCompare(b))
}

const collectFilesFromDirectory = (
    dirPath: string,
    recursive: boolean,
): string[] => {
    const results: string[] = []

    for (const entry of fs.readdirSync(dirPath)) {
        const fullPath = path.join(dirPath, entry)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
            if (recursive) {
                results.push(...collectFilesFromDirectory(fullPath, recursive))
            }
            continue
        }

        if (stat.isFile() && fullPath.toLowerCase().endsWith('.yini')) {
            results.push(fullPath)
        }
    }

    return results
}

// --- Validation --------------------------------------------------------------

const validateOneFile = (
    file: string,
    options: IValidateCommandOptions,
): IFileValidationResult => {
    const strictMode = resolveStrictMode(options)

    const parseOptions: ParseOptions = {
        strictMode,
        failLevel: 'ignore-errors',
        includeMetadata: true,
        includeDiagnostics: true,
        silent: true,
    }

    try {
        const parsed: YiniParseResult = YINI.parseFile(file, parseOptions)
        const metadata = parsed?.meta ?? null
        const diagnostics = metadata?.diagnostics

        if (!diagnostics) {
            return {
                file,
                mode: strictMode ? 'strict' : 'lenient',
                status: 'failed',
                errors: 1,
                warnings: 0,
                notices: 0,
                infos: 0,
                issues: [
                    {
                        severity: 'error',
                        code: 'MISSING_DIAGNOSTICS',
                        message: 'Missing diagnostics metadata.',
                        line: 0,
                        column: 0,
                    },
                ],
                metadata,
                fatalError: 'Missing diagnostics metadata.',
            }
        }

        const issues: IValidationIssue[] = [
            ...mapIssuePayloadArray('error', diagnostics.errors.payload),
            ...mapIssuePayloadArray('warning', diagnostics.warnings.payload),
            ...mapIssuePayloadArray('notice', diagnostics.notices.payload),
            ...mapIssuePayloadArray('info', diagnostics.infos.payload),
        ]

        const errors = diagnostics.errors.errorCount
        const warnings = diagnostics.warnings.warningCount
        const notices = diagnostics.notices.noticeCount
        const infos = diagnostics.infos.infoCount

        const status = resolveFileStatus(errors, warnings, options)

        return {
            file,
            mode:
                metadata?.mode === 'strict' || metadata?.mode === 'lenient'
                    ? metadata.mode
                    : 'custom',
            status,
            errors,
            warnings,
            notices,
            infos,
            issues,
            metadata,
        }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)

        return {
            file,
            mode: strictMode ? 'strict' : 'lenient',
            status: 'failed',
            errors: 1,
            warnings: 0,
            notices: 0,
            infos: 0,
            issues: [
                {
                    severity: 'error',
                    code: 'RUNTIME_ERROR',
                    message,
                    line: 0,
                    column: 0,
                },
            ],
            metadata: null,
            fatalError: message,
        }
    }
}

const mapIssuePayloadArray = (
    severity: TIssueSeverity,
    payload: IssuePayload[],
): IValidationIssue[] => {
    return payload.map((item) => ({
        severity,
        code: toStableIssueCode(item.typeKey, severity),
        message: item.message ?? 'Unknown issue.',
        line: item.line ?? 0,
        column: item.column ?? 0,
        advice: item.advice,
        hint: item.hint,
    }))
}

const toStableIssueCode = (
    typeKey: string | undefined,
    fallbackSeverity: TIssueSeverity,
): string => {
    const base = typeKey && typeKey.trim() ? typeKey : fallbackSeverity

    return base
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toUpperCase()
}

// --- Status / exit code resolution ------------------------------------------

const resolveFileStatus = (
    errors: number,
    warnings: number,
    options: IValidateCommandOptions,
): TFileStatus => {
    if (errors > 0) return 'failed'
    if (options.warningsAsErrors && warnings > 0) return 'failed'
    if (warnings > 0) return 'passed-with-warnings'
    return 'passed'
}

const resolveAggregateStatus = (
    aggregate: IAggregateValidationResult,
    options: IValidateCommandOptions,
): TOverallStatus => {
    if (aggregate.failedFiles > 0) return 'failed'
    if (options.warningsAsErrors && aggregate.warnings > 0) return 'failed'
    if (aggregate.warnings > 0) return 'passed-with-warnings'
    return 'passed'
}

const getValidationExitCode = (
    aggregate: IAggregateValidationResult,
    options: IValidateCommandOptions,
): number => {
    if (aggregate.failedFiles > 0) return 1
    if (options.warningsAsErrors && aggregate.warnings > 0) return 1
    return 0
}

// --- Text output -------------------------------------------------------------

const getDisplayBaseDir = (targets: string[]): string => {
    if (!targets.length) {
        return process.cwd()
    }

    if (targets.length === 1) {
        const resolved = path.resolve(targets[0])

        if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
            return resolved
        }

        return path.dirname(resolved)
    }

    return process.cwd()
}

const toDisplayPath = (filePath: string, baseDir: string): string => {
    const relative = path.relative(baseDir, filePath)

    if (!relative || relative.startsWith('..')) {
        return filePath
    }

    return relative
}

const printTextReport = (
    aggregate: IAggregateValidationResult,
    options: IValidateCommandOptions,
) => {
    const isSingleFile = aggregate.results.length === 1

    if (isSingleFile) {
        printSingleFileTextReport(aggregate.results[0], options)
        return
    }

    printMultiFileTextReport(aggregate, options)
}

const printSingleFileTextReport = (
    result: IFileValidationResult,
    options: IValidateCommandOptions,
) => {
    const totalIssues =
        result.errors + result.warnings + result.notices + result.infos

    if (result.status === 'failed') {
        const suffix = totalIssues > 0 ? ` (${totalIssues} issues)` : ''
        printStdout(options, `✖  Validation failed${suffix}`)
    } else if (result.status === 'passed-with-warnings') {
        printStdout(options, '✔  Validation successful (with warnings)')
    } else {
        printStdout(options, '✔  Validation successful')
    }

    printStdout(options, ``)
    printStdout(options, `File:     "${result.file}"`)
    printStdout(options, `Mode:     ${result.mode}`)
    printStdout(options, `Errors:   ${result.errors}`)
    printStdout(options, `Warnings: ${result.warnings}`)

    printIssueDetailsForResult(result, options)

    if (options.stats && result.metadata) {
        printStdout(options, '')
        printStdout(options, formatStatsReport(result.file, result.metadata))
    }
}

const printMultiFileTextReport = (
    aggregate: IAggregateValidationResult,
    options: IValidateCommandOptions,
) => {
    for (const result of aggregate.results) {
        const displayPath = toDisplayPath(result.file, aggregate.displayBaseDir)

        if (result.status === 'failed') {
            printStdout(options, `FAIL  "${displayPath}"`)
        } else if (!options.quiet) {
            printStdout(options, `OK    "${displayPath}"`)
        }
    }

    printStdout(options, '')
    printStdout(options, `Base:    "${aggregate.displayBaseDir}"`)
    printStdout(options, `Mode:    ${aggregate.mode}`)
    printStdout(
        options,
        `Summary: ${aggregate.filesChecked} checked, ${aggregate.failedFiles} failed, ${aggregate.errors} errors, ${aggregate.warnings} warnings`,
    )

    for (const result of aggregate.results) {
        if (result.status !== 'failed') continue
        printIssueDetailsForResult(result, options, aggregate.displayBaseDir)
    }
}

const printIssueDetailsForResult = (
    result: IFileValidationResult,
    options: IValidateCommandOptions,
    displayBaseDir?: string,
) => {
    const printable = result.issues.filter(
        (issue) => issue.severity === 'error' || issue.severity === 'warning',
    )

    if (!printable.length) return

    const displayPath = displayBaseDir
        ? toDisplayPath(result.file, displayBaseDir)
        : result.file

    printStderr(options, '')
    printStderr(options, `"${displayPath}"`)

    printable.forEach((issue, index) => {
        const hasLocation =
            typeof issue.line === 'number' &&
            typeof issue.column === 'number' &&
            issue.line > 0 &&
            issue.column > 0

        const location = hasLocation
            ? `${issue.line}:${issue.column}`.padEnd(7)
            : ''.padEnd(7)

        const severity = issue.severity.padEnd(8)

        printStderr(
            options,
            hasLocation
                ? `  ${location} ${severity}${issue.message}`
                : `  ${severity}${issue.message}`,
        )

        if (issue.advice && !options.quiet) {
            printStderr(options, `          ${issue.advice}`)
        }

        if (issue.hint && !options.quiet) {
            printStderr(options, `          ${issue.hint}`)
        }

        if (index < printable.length - 1) {
            printStderr(options, '')
        }
    })
}

// --- JSON output -------------------------------------------------------------

const formatJsonReport = (
    aggregate: IAggregateValidationResult,
    options: IValidateCommandOptions,
): string => {
    const payload = {
        mode: aggregate.mode,
        status: aggregate.status,
        summary: {
            filesChecked: aggregate.filesChecked,
            failedFiles: aggregate.failedFiles,
            errors: aggregate.errors,
            warnings: aggregate.warnings,
            notices: aggregate.notices,
            infos: aggregate.infos,
        },
        files: aggregate.results.map((result) => ({
            file: result.file,
            mode: result.mode,
            status: result.status,
            summary: {
                errors: result.errors,
                warnings: result.warnings,
                notices: result.notices,
                infos: result.infos,
            },
            issues: result.issues.map((issue) => ({
                severity: issue.severity,
                code: issue.code,
                message: issue.message,
                location: {
                    line: issue.line,
                    column: issue.column,
                },
                advice: issue.advice,
                hint: issue.hint,
            })),
            stats:
                options.stats && result.metadata
                    ? {
                          lineCount: result.metadata.source.lineCount,
                          byteSize:
                              result.metadata.source.sourceType === 'inline'
                                  ? null
                                  : result.metadata.source.byteSize,
                          sections: result.metadata.structure.sectionCount,
                          keys: result.metadata.structure.memberCount,
                          nestingDepth: result.metadata.structure.maxDepth,
                          hasYiniMarker: result.metadata.source.hasYiniMarker,
                          hasDocumentTerminator:
                              result.metadata.source.hasDocumentTerminator,
                      }
                    : undefined,
        })),
    }

    return JSON.stringify(payload, null, 2)
}

// --- Stats -------------------------------------------------------------------

const formatStatsReport = (
    fileWithPath: string,
    metadata: ResultMetadata,
): string => {
    if (!metadata?.diagnostics) {
        throw new Error('Internal error: Missing diagnostics metadata.')
    }

    const diag = metadata.diagnostics
    const issuesCount =
        diag.errors.errorCount +
        diag.warnings.warningCount +
        diag.notices.noticeCount +
        diag.infos.infoCount

    return `Statistics
----------
Notices:       ${diag.notices.noticeCount}
Infos:         ${diag.infos.infoCount}
Line Count:    ${metadata.source.lineCount}
Section Count: ${metadata.structure.sectionCount}
Member Count:  ${metadata.structure.memberCount}
Nesting Depth: ${metadata.structure.maxDepth}
Has @YINI:     ${metadata.source.hasYiniMarker}
Has /END:      ${metadata.source.hasDocumentTerminator}
Byte Size:     ${
        metadata.source.sourceType === 'inline'
            ? 'n/a'
            : `${metadata.source.byteSize} bytes`
    }`
}

/*
    - Produce a summary-level validation report.
    - Output is structured and concise (e.g. JSON or table-like).
    - Focus on counts, pass/fail, severity summary.

    Example:
    Validation report for config.yini:
    Errors:   3
    Warnings: 1
    Notices:  0
    Result: INVALID
*/
/*
const old_formatToStatsReport = (
    fileWithPath: string,
    metadata: ResultMetadata,
): string => {
    // console.log('formatToStatsReport(..)')
    // printObject(metadata)
    // console.log()

    if (!metadata?.diagnostics) {
        console.error('Internal error: Missing diagnostics')
        exit(1)
    }
    const diag = metadata.diagnostics

    const issuesCount: number =
        diag.errors.errorCount +
        diag.warnings.warningCount +
        diag.notices.noticeCount +
        diag.infos.infoCount
    const str = `Validation Report
=================

File      "${fileWithPath}"
Issues:   ${issuesCount}

Summary
-------
Mode:     ${metadata.mode}
Strict:   ${metadata.mode === 'strict'}

Errors:   ${diag.errors.errorCount}
Warnings: ${diag.warnings.warningCount}
Notices:  ${diag.notices.noticeCount}
Infos:    ${diag.infos.infoCount}

Stats
-----
Line Count:    ${metadata.source.lineCount}
Section Count: ${metadata.structure.sectionCount}
Member Count:  ${metadata.structure.memberCount}
Nesting Depth: ${metadata.structure.maxDepth}

Has @YINI:     ${metadata.source.hasYiniMarker}
Has /END:      ${metadata.source.hasDocumentTerminator}
Byte Size:     ${metadata.source.sourceType === 'inline' ? 'n/a' : metadata.source.byteSize + ' bytes'}
`

    return str
}
*/
