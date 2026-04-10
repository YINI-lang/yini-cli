/*
    TODO / SHOULD-DO:

    yini validate <fileOrDirectory...> [options]

    Validate one or more YINI files.

    <file> = Validate one file
    <directory> = Validate .yini files in the directory

    Multiple files and directories may be provided, separated by spaces.

    Default behavior
    ----------------
    - Validates one or more files or directories.
    - If a directory is provided, all .yini files are validated recursively by default.
    - Prints a human-readable validation summary to the terminal.
    - Uses lenient mode by default.
    - Returns a non-zero exit code if one or more files contain validation errors.
    - For single file-mode: summary first
    - For multi file-mode: summary last

    Options
    -------

    Validation mode:
    --strict                     Validate in strict mode
    --lenient                    Validate in lenient mode (default)

    Output verbosity:
    --quiet, -q                  Suppress successful per-file output; show failed files, issue details for failures, and final summary only
                                 - suppress OK ... lines
                                 - still show FAIL ... lines
                                 - still show per-file issue details for failed files
                                 - still show final summary
                                 - still show fatal CLI/runtime errors

    --silent, -s                 Show no output; exit code only. Suppresses validation output. CLI/framework-level argument errors may still print help or error text unless explicitly intercepted.
                                 - no summary
                                 - no per-file lines
                                 - no warnings
                                 - no issue details
                                 - no success output
                                 - no validation failure output

    --verbose                    Show extra processing details
    --stats                      Include optional statistics in the report
                                 TODO: Based on and in the formatToStatsReport(..) function.
    --format <text|json>         Output format for validation results (default: text)

    Input handling:
    <file>                       Validate a single YINI file
    <directory>                  Validate all .yini files in the directory
	--no-recursive/--no-subdirs  Do not descend into subdirectories

    Execution controls:
    --fail-fast                 Stop on the first file that fails
    --max-errors <n>            Stop validation after reporting <n> total errors across all input files
    --warnings-as-errors        Treat warnings as errors for exit code purposes. 
                                - Warnings retain warning severity in the output.
                                - Exit code becomes non-zero (failure) if any warning exists.

    Output handling: 
    (WAIT WITH THIS) --no-summary
    (WAIT WITH THIS) --output, -o <file> = Save/write report to file (No overwrite if dest is more recent than source file (override with --overwrite).)
	(WAIT WITH THIS) --overwrite = Allow to save/write over existing report file.
	(WAIT WITH THIS) --no-overwrite = Do not save/write over existing report file.

    Policy controls (advanced, WAIT WITH THESE):
    (WAIT WITH THIS) --duplicates-policy <error|warn|allow>
    (WAIT WITH THIS) --reserved-policy <error|warn|allow>

    Exit codes:
    0 = all files valid
    1 = one or more files invalid (validation failure)
    2 = CLI usage/runtime error (bad arguments, unreadable directory, internal failure)

    ==========================================================
    OUTPUT RULES
    ==========================================================

    Human-readable output should be the default.

    Single file mode
    ----------------
    - The summary for single file mode should feel more friendly.

    * On success (exit 0)

    To stdout:
    ✔ Validation successful
    File: "configfile.yini"
    Mode: lenient
    Errors: 0
    Warnings: 0

    * Failure:
      - Validation failure (exit 1).
      - CLI/runtime failure (exit 2).

    To stdout:
    ✖ Validation failed (3 issues)
    File: "configfile.yini"
    Mode: strict
    Errors: 2
    Warnings: 1

    To stderr:
      12:8  error    Unexpected token '}'
      27:1  warning  Duplicate key: "port" in ...

    ---

    Multi-file mode (when a directory is given)
    -------------------------------------------
   - The summary for multi-file mode is different from single file mode.


    * On success (exit 0)

    To stdout:
    OK    "configs/file.yini"
    OK    "configs/db.yini"
    OK    "configs/prod.yini"

    Mode: strict
    Summary: 3 files checked, 0 errors, 0 warnings, 0 failed

    * Failure:
      - Validation failure (exit 1).
      - CLI/runtime failure (exit 2).

    To stdout:
    OK    "configs/file.yini"
    FAIL  "configs/db.yini"
    OK    "configs/prod.yini"

    To stdout:
    Mode: strict
    Summary: 3 files checked, 2 errors, 0 warnings, 1 failed

    To stderr:
    "configs/db.yini"
      12:8  error    Unexpected token '}'
      27:1  warning  Duplicate key: "port" in ...

    Detailed issues are printed only for failed files.

    ---

    REQUIREMENTS for report output:

    The output should:
        1. Be human-readable by default
        2. Give a clear verdict
        3. Show useful context for each problem
        4. Be machine-friendly when requested (--format json)
        5. Be stable and predictable for CI usage

    * Header / Summary:
    On success:
    ✔ Validation successful
    File: "config.yini"
    Mode: lenient
    Errors: 0
    Warnings: 2

    On failure:
    ✖ Validation failed
    File: "config.yini"
    Mode: strict
    Errors: 3
    Warnings: 1

    * Issues sections:
    Each issue:
        Severity	error / warning
        Code	stable identifier (DUPLICATE_KEY, UNKNOWN_CONSTRUCT, etc.)
        Message	short explanation
        Location	file + line + column
        Context	snippet of the file (if helpful)
    
    Example:
        Errors:
        [E001] Duplicate key "host"
            at config.yini:14:5
            Previous definition at line 7
            → host = "localhost"

        Warnings:
        [W002] Reserved construct used: "$schema"
            at config.yini:3:1

    * Optional statistics section --stats
        Statistics:
        Sections: 5
        Keys: 27
        Lists: 4
        Objects: 3
        Nesting depth: 4

    * Exit code contract
        - Success, no warnings → 0
        - Warnings only → 0
        - Warnings only with --warnings-as-errors → 1
        - One or more validation errors → 1
        - CLI/runtime failure → 2

    Example: JSON format (--format json)
        {
            "file": "config.yini",
            "mode": "strict",
            "status": "failed",
            "summary": {
                "filesChecked": 1,
                "failedFiles": 1,
                "errors": 2,
                "warnings": 1
            },
          "issues": [
            {
            "severity": "error",
            "code": "DUPLICATE_KEY",
            "message": "Duplicate key \"host\"",
            "location": { "line": 14, "column": 5 }
            },
            {
            "severity": "error",
            "code": "INVALID_TYPE",
            "message": "Expected number, got string",
            "location": { "line": 22, "column": 12 }
            },
            {
            "severity": "warning",
            "code": "RESERVED_CONSTRUCT",
            "message": "Reserved construct \"$schema\"",
            "location": { "line": 3, "column": 1 }
            }
        ],
        "stats": {
            "sections": 5,
            "keys": 27,
            "nestingDepth": 4
        }
        }
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

        const aggregate: IAggregateValidationResult = {
            mode,
            status: 'passed',
            filesChecked: 0,
            failedFiles: 0,
            errors: 0,
            warnings: 0,
            notices: 0,
            infos: 0,
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

    return [...out]
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
        if (result.status === 'failed') {
            printStdout(options, `FAIL  "${result.file}"`)
        } else if (!options.quiet) {
            printStdout(options, `OK    "${result.file}"`)
        }
    }

    printStdout(options, '')
    printStdout(options, `Mode: ${aggregate.mode}`)
    printStdout(
        options,
        `Summary: ${aggregate.filesChecked} files checked, ${aggregate.errors} errors, ${aggregate.warnings} warnings, ${aggregate.failedFiles} failed`,
    )

    for (const result of aggregate.results) {
        if (result.status !== 'failed') continue
        printIssueDetailsForResult(result, options)

        if (options.stats && result.metadata) {
            printStdout(options, '')
            printStdout(
                options,
                formatStatsReport(result.file, result.metadata),
            )
        }
    }
}

const printIssueDetailsForResult = (
    result: IFileValidationResult,
    options: IValidateCommandOptions,
) => {
    const printable = result.issues.filter(
        (issue) => issue.severity === 'error' || issue.severity === 'warning',
    )

    if (!printable.length) return

    printStderr(options, '')
    printStderr(options, `"${result.file}"`)

    for (const issue of printable) {
        printStderr(
            options,
            `  ${issue.line}:${issue.column}  ${issue.severity.padEnd(7)} ${issue.message}`,
        )

        if (issue.advice && !options.quiet) {
            printStderr(options, `           ${issue.advice}`)
        }

        if (issue.hint && !options.quiet) {
            printStderr(options, `           ${issue.hint}`)
        }
    }
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
