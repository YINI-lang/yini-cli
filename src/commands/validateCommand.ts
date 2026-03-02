import fs from 'node:fs'
import path from 'node:path'
import { exit } from 'node:process'
import YINI, {
    IssuePayload,
    ParseOptions,
    PreferredFailLevel,
    ResultMetadata,
    YiniParseResult,
} from 'yini-parser'
import { IGlobalOptions } from '../types.js'

const IS_DEBUG: boolean = false // For local debugging purposes, etc.

// --- CLI command "validate" commandOptions --------------------------------------------------------
export interface IValidateCommandOptions extends IGlobalOptions {
    stats?: boolean
    warningsAsErrors?: boolean
    format?: 'json' | 'text'
    // details?: boolean
}
// -------------------------------------------------------------------------

export interface ValidationResult {
    file: string
    mode: 'strict' | 'lenient' | 'custom'
    errors: number
    warnings: number
    notices: number
    infos: number
    metadata: ResultMetadata | null
    fatalError?: string
}

export interface ValidationReport {
    status: 'Passed' | 'Passed-with-Warnings' | 'Failed'
    summary: {
        errors: number
        warnings: number
        notices: number
        infos: number
        total: number
    }
    file: string
    mode: string
    metadata?: ResultMetadata | null
}

const collectFiles = (inputPath: string, recursive = true): string[] => {
    const stat = fs.statSync(inputPath)

    if (stat.isFile()) return [inputPath]

    let results: string[] = []

    for (const entry of fs.readdirSync(inputPath)) {
        const full = path.join(inputPath, entry)
        const s = fs.statSync(full)

        if (s.isDirectory() && recursive) {
            results.push(...collectFiles(full, recursive))
        }

        if (s.isFile() && full.toLowerCase().endsWith('.yini')) {
            results.push(full)
        }
    }

    return results
}

export const buildReport = (
    result: ValidationResult,
    warningsAsErrors?: boolean,
): ValidationReport => {
    let effectiveErrors = result.errors

    if (warningsAsErrors && result.warnings > 0) {
        effectiveErrors += result.warnings
    }

    let status: ValidationReport['status']

    if (effectiveErrors > 0) {
        status = 'Failed'
    } else if (result.warnings > 0) {
        status = 'Passed-with-Warnings'
    } else {
        status = 'Passed'
    }

    return {
        status,
        file: result.file,
        mode: result.mode,
        summary: {
            errors: result.errors,
            warnings: result.warnings,
            notices: result.notices,
            infos: result.infos,
            total:
                result.errors + result.warnings + result.notices + result.infos,
        },
        metadata: result.metadata,
    }
}

interface ISummary {
    result: string
    file: string
    mode: 'strict' | 'lenient' | 'custom'
    summary: {
        issuesCount: number
        errors: number
        warnings: number
        notices: number
        infos: number
    }
}

export const formatJson = (report: ValidationReport) => {
    return JSON.stringify(
        {
            file: report.file,
            mode: report.mode,
            summary: {
                errors: report.summary.errors,
                warnings: report.summary.warnings,
                notices: report.summary.notices,
                infos: report.summary.infos,
            },
        },
        null,
        2,
    )
}

export const formatText = (report: ValidationReport): string => {
    let out = ''

    switch (report.status) {
        case 'Passed':
            out += '✔ Validation successful\n'
            break
        case 'Passed-with-Warnings':
            out += '✔ Validation successful (with warnings)\n'
            break
        case 'Failed':
            out += '✖ Validation failed\n'
            break
    }

    out += `\nFile: ${report.file}\n`
    out += `Mode: ${report.mode}\n`
    out += `Errors: ${report.summary.errors}\n`
    out += `Warnings: ${report.summary.warnings}\n`

    return out
}

/*
    TODO / SHOULD-DO:

    yini validate <file|path...> [options]

    Validate one or more YINI files.
    If a directory is provided, all .yini files (case-insensitive) are processed recursively by default.

    On successful validation, a report (summary, issues, optional stats) is printed to the terminal.

    Options
    -------

    Validation mode:
    --strict                Enable strict validation mode
    --lenient               (default) Enable lenient validation mode
    --quiet, -q             Suppress normal output (show errors only)
    --silent, -s            Suppress all output (exit code only)
    --stats                 Include stats, show meta-data section (counts, depth, etc.)
    --format <text|yini|json>	Output format for the report (staus, stats, issues) (default: text)

    Input handling:
    <file>                  Validate a single YINI file
    <path>                  Validate all .yini files in the directory (recursive by default)
    --no-recursive, --no-subdirs	Do not descend into subdirectories

    Output handling:
    --output <file>, -o <file>	Write validation report to file
    --overwrite             Allow overwriting existing report file
    --no-overwrite          (default) Prevent overwriting existing report file (default)    

    Execution controls (Nice-to-Have)
    --fail-fast	            Stop on the first validation error
    --max-errors <n>        Stop after <n> errors
    --verbose	            Show detailed processing information
    --warnings-as-errors    Treat warnings as errors

    Policy controls (advanced):
    --duplicates-policy <error|warn|allow>	Control handling of duplicate keys / section names
    --reserved-policy <error|warn|allow>

    ===========================================================

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
    File: config.yini
    Mode: lenient
    Errors: 0
    Warnings: 2

    On failure:
    ✖ Validation failed
    File: config.yini
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

    * Optional meta-data section --stats
        Statistics:
        Sections: 5
        Keys: 27
        Arrays: 4
        Objects: 3
        Nesting depth: 4

    * Exit code contract
        Success, no warnings	0
        Warnings only	0 (or 1 if --warnings-as-errors)
        Errors	1

    Example: JSON format (--format json)
        {
        "file": "config.yini",
        "mode": "strict",
        "summary": {
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
export const validateFile = (
    file: string,
    options: IValidateCommandOptions = {},
) => {
    const result = runValidation(file, options)
    const report = buildReport(result, options.warningsAsErrors)

    if (!options.silent) {
        if (options.format === 'json') {
            console.log(formatJson(report))
        } else {
            console.log(formatText(report))
        }
    }

    const exitCode = report.status === 'Failed' ? 1 : 0

    exit(exitCode)
}

export const runValidation = (
    file: string,
    options: IValidateCommandOptions = {},
): ValidationResult => {
    const parseOptions: ParseOptions = {
        strictMode: options.strict ?? false,
        failLevel: 'ignore-errors',
        includeMetadata: true,
        includeDiagnostics: true,
        silent: true,
    }

    try {
        const parsed = YINI.parseFile(file, parseOptions)
        const meta = parsed?.meta ?? null

        if (!meta?.diagnostics) {
            return {
                file,
                mode: 'custom',
                errors: 1,
                warnings: 0,
                notices: 0,
                infos: 0,
                metadata: null,
                fatalError: 'Missing diagnostics metadata',
            }
        }

        const d = meta.diagnostics

        return {
            file,
            mode: meta.mode ?? 'custom',
            errors: d.errors.errorCount,
            warnings: d.warnings.warningCount,
            notices: d.notices.noticeCount,
            infos: d.infos.infoCount,
            metadata: meta,
        }
    } catch (err: unknown) {
        return {
            file,
            mode: options.strict ? 'strict' : 'lenient',
            errors: 1,
            warnings: 0,
            notices: 0,
            infos: 0,
            metadata: null,
            fatalError: err instanceof Error ? err.message : String(err),
        }
    }
}

/**
 * @returns Map to a short summary.
 */
const toSummaryJson = (
    statusType: 'Passed' | 'Passed-with-Warnings' | 'Failed',
    fileWithPath: string,
    // metadata: ResultMetadata | null,
    mode: 'strict' | 'lenient' | 'custom',
    errors: number,
    warnings: number,
    notices: number,
    infos: number,
): ISummary => {
    let result = ''

    switch (statusType) {
        case 'Passed':
            // result = '✔  Validation passed'
            result = '✔  Validation successful'
            break
        case 'Passed-with-Warnings':
            // result = '⚠️ Validation finished'
            result = '✔  Validation successful (with warnings)'
            break
        case 'Failed':
            // result = '✖  Validation failed'
            result = '✖  Validation failed'
            break
    }

    // const diag = metadata.diagnostics

    const issuesCount: number = errors + warnings + notices + infos

    return {
        result: result,
        file: fileWithPath,
        mode: mode,
        summary: {
            issuesCount: issuesCount,
            errors,
            warnings,
            notices,
            infos,
        },
    }
}

const printSummary = (sum: ISummary) => {
    let str = ''

    str += sum.result + '\n'
    str += '\n'
    str += `File:         "${sum.file}"\n`
    str += `Mode:         ${sum.mode.toLowerCase()}\n`
    str += `Errors:       ${sum.summary.errors}\n`
    str += `Warnings:     ${sum.summary.warnings}\n`

    if (sum.summary.notices) {
        str += `Notices:      ${sum.summary.notices}\n`
    }
    if (sum.summary.infos) {
        str += `Infos:        ${sum.summary.infos}\n`
    }

    str += `Total issues: ${sum.summary.issuesCount}\n`

    console.log(str)
}

/**
 * @deprecated Use toSummaryJson(..), this TO BE deleted.
 */
const formatToSummary = (
    statusType: 'Passed' | 'Passed-with-Warnings' | 'Failed',
    errors: number,
    warnings: number,
    notices: number,
    infos: number,
): string => {
    const totalMsgs: number = errors + warnings + notices + infos
    let str = ``

    switch (statusType) {
        case 'Passed':
            str = '✔  Validation passed'
            break
        case 'Passed-with-Warnings':
            str = '⚠️ Validation finished'
            break
        case 'Failed':
            str = '✖  Validation failed'
            break
    }

    str += ` (${errors} errors, ${warnings} warnings, ${totalMsgs} total messages)`
    return str
}

// --- Format to a Stats report --------------------------------------------------------

//@todo format parsed.meta to report as
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
const formatToStatsReport = (
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
// -------------------------------------------------------------------------

// --- Format to a Details --------------------------------------------------------
//@todo format parsed.meta to details as
/*
    - Show full detailed validation messages.
    - Output includes line numbers, columns, error codes, and descriptive text.
    - Useful for debugging YINI files.

    Example:
    Error at line 5, column 9: Unexpected '/END' — expected <EOF>
    Warning at line 10, column 3: Section level skipped (0 → 2)
    Notice at line 1: Unused @yini directive
*/
const printIssuesFound = (
    fileWithPath: string,
    metadata: ResultMetadata,
): void => {
    // console.log('printDetails(..)')
    // printObject(metadata)
    // console.log(toPrettyJSON(metadata))
    // console.log()

    if (!metadata?.diagnostics) {
        console.error('Internal error: Missing diagnostics metadata')
        exit(1)
    }
    const diag = metadata.diagnostics

    IS_DEBUG && console.log('*** Issues Found')
    IS_DEBUG && console.log('*** ------------')
    IS_DEBUG && console.log()

    const errors: IssuePayload[] = diag.errors.payload
    printIssues('Error  ', 'E', errors)

    const warnings: IssuePayload[] = diag.warnings.payload
    printIssues('Warning', 'W', warnings)

    const notices: IssuePayload[] = diag.notices.payload
    printIssues('Notice ', 'N', notices)

    const infos: IssuePayload[] = diag.infos.payload
    printIssues('Info   ', 'I', infos)

    return
}

// -------------------------------------------------------------------------

const printIssues = (
    typeLabel: string,
    prefix: string,
    issues: IssuePayload[],
): void => {
    const leftPadding = '        '

    issues.forEach((iss: IssuePayload, i: number) => {
        const id: string = '#' + prefix + '-0' + (i + 1)
        // const id: string = '' + prefix + '-0' + (i+1) + ':'

        let str = `${typeLabel} [${id}]:\n`
        str +=
            leftPadding +
            `At line ${iss.line}, column ${iss.column}: ${iss.message}`

        if (iss.advice) str += '\n' + leftPadding + iss.advice
        if (iss.hint) str += '\n' + leftPadding + iss.hint

        console.log(str)
        console.log()
    })
}
