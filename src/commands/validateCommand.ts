import assert from 'node:assert'
import fs from 'node:fs'
import { exit } from 'node:process'
import YINI, {
    IssuePayload,
    ParseOptions,
    PreferredFailLevel,
    ResultMetadata,
    YiniParseResult,
} from 'yini-parser'
import { IGlobalOptions } from '../types.js'
import { printObject, toPrettyJSON } from '../utils/print.js'

const IS_DEBUG: boolean = true // For local debugging purposes, etc.

// --- CLI command "validate" commandOptions --------------------------------------------------------
export interface IValidateCommandOptions extends IGlobalOptions {
    stats?: boolean
    // details?: boolean
}
// -------------------------------------------------------------------------

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
    commandOptions: IValidateCommandOptions = {},
) => {
    let parsedResult: YiniParseResult | undefined = undefined
    let isCatchedError: boolean = true

    // let failLevel: PreferredFailLevel = 'auto'
    // if (commandOptions.failFast) {
    //     failLevel = 'warnings-and-errors'
    // }
    // if (commandOptions.bestEffort) {
    //     failLevel = 'ignore-errors'
    // }

    const parseOptions: ParseOptions = {
        strictMode: commandOptions.strict ?? false,
        // failLevel: 'errors',
        // failLevel: commandOptions.force ? 'ignore-errors' : 'errors',
        // failLevel: 'ignore-errors',
        failLevel: 'ignore-errors',
        includeMetadata: true,
        includeDiagnostics: true,
        silent: true,
    }

    try {
        parsedResult = YINI.parseFile(file, parseOptions)

        isCatchedError = false
    } catch (err: any) {
        isCatchedError = true
    }

    let metadata: ResultMetadata | null = null
    let errors = 0
    let warnings = 0
    let notices = 0
    let infos = 0

    if (!isCatchedError && parsedResult?.meta) {
        metadata = parsedResult?.meta
        assert(metadata) // Make sure there is metadata!
        // printObject(metadata, true)

        assert(metadata.diagnostics)
        const diag = metadata.diagnostics

        errors = diag!.errors.errorCount
        warnings = diag!.warnings.warningCount
        notices = diag!.notices.noticeCount
        infos = diag!.infos.infoCount
    }

    IS_DEBUG && console.log()
    IS_DEBUG && console.log('isCatchedError = ' + isCatchedError)
    IS_DEBUG && console.log('TEMP OUTPUT')
    IS_DEBUG && console.log('isCatchedError = ' + isCatchedError)
    IS_DEBUG && console.log('  errors = ' + errors)
    IS_DEBUG && console.log('warnings = ' + warnings)
    IS_DEBUG && console.log(' notices = ' + notices)
    IS_DEBUG && console.log('   infor = ' + infos)
    IS_DEBUG && console.log('metadata = ' + metadata)
    IS_DEBUG &&
        console.log(
            'includeMetadata = ' +
                metadata?.diagnostics?.effectiveOptions.includeMetadata,
        )
    IS_DEBUG && console.log('commandOptions.stats = ' + commandOptions?.stats)
    IS_DEBUG && console.log()

    //state returned:
    // - passed (no errors/warnings),
    // - finished (with warnings, no errors) / or - passed with warnings
    // - failed (errors),

    if (isCatchedError) {
        errors = 1
    }
    // console.log()

    let statusType: 'Passed' | 'Passed-with-Warnings' | 'Failed'

    if (errors) {
        statusType = 'Failed'
    } else if (warnings) {
        statusType = 'Passed-with-Warnings'
    } else {
        statusType = 'Passed'
    }

    const jsonSummary = toSummaryJson(
        statusType,
        file,
        // metadata,
        metadata?.mode ?? 'custom',
        errors,
        warnings,
        notices,
        infos,
    )

    printSummary(jsonSummary)

    // if (errors) {
    //     // red ✖
    //     console.error(
    //         formatToSummary('Failed', errors, warnings, notices, infos),
    //     )

    //     // exit(1)
    // } else if (warnings) {
    //     // yellow ⚠️
    //     console.warn(
    //         formatToSummary(
    //             'Passed-with-Warnings',
    //             errors,
    //             warnings,
    //             notices,
    //             infos,
    //         ),
    //     )

    //     // exit(0)
    // } else {
    //     // green ✔
    //     console.log(formatToSummary('Passed', errors, warnings, notices, infos))

    //     // exit(0)
    // }

    // Print optional Stats-report if "--stats" was given.
    if (!commandOptions.silent && !isCatchedError) {
        // if (commandOptions.details) {
        if (errors || warnings) {
            if (!metadata) {
                console.error('Internal Error: No meta data found')
            }
            assert(metadata) // Make sure there is metadata!

            console.log()
            printIssuesFound(file, metadata)
        }

        if (commandOptions.stats) {
            if (!metadata) {
                console.error('Internal Error: No meta data found')
            }
            assert(metadata) // Make sure there is metadata!

            console.log()
            console.log(formatToStatsReport(file, metadata).trim())
        }
    }

    if (errors) {
        exit(1)
    }

    exit(0)
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
            result = '✔  Validation successful'
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

    assert(metadata.diagnostics)
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

    assert(metadata.diagnostics)
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
