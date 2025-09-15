import assert from 'node:assert'
import fs from 'node:fs'
import { exit } from 'node:process'
import YINI, {
    AllUserOptions,
    ResultMetadata,
    YiniParseResult,
} from 'yini-parser'
import { IGlobalOptions } from '../types.js'
import { printObject, toPrettyJSON } from '../utils/print.js'

// --- CLI command "validate" commandOptions --------------------------------------------------------
export interface IValidateCommandOptions extends IGlobalOptions {
    report?: boolean
    details?: boolean
}
// -------------------------------------------------------------------------

export const validateFile = (
    file: string,
    commandOptions: IValidateCommandOptions = {},
) => {
    let parsedResult: YiniParseResult | undefined = undefined
    let isCatchedError: boolean = true

    const parseOptions: AllUserOptions = {
        strictMode: commandOptions.strict ?? false,
        // failLevel: 'errors',
        failLevel: commandOptions.force ? 'ignore-errors' : 'errors',
        // failLevel: 'ignore-errors',
        includeMetadata: true,
        includeDiagnostics: true,
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

    console.log()
    console.log('isCatchedError = ' + isCatchedError)
    console.log('TEMP OUTPUT')
    console.log('isCatchedError = ' + isCatchedError)
    console.log('  errors = ' + errors)
    console.log('warnings = ' + warnings)
    console.log(' notices = ' + notices)
    console.log('   infor = ' + infos)
    console.log('metadata = ' + metadata)
    console.log(
        'includeMetadata = ' +
            metadata?.diagnostics?.effectiveOptions.includeMetadata,
    )
    console.log('commandOptions.report = ' + commandOptions?.report)
    console.log()

    if (!commandOptions.silent && !isCatchedError) {
        if (commandOptions.report) {
            if (!metadata) {
                console.error('Internal Error: No meta data found')
            }
            assert(metadata) // Make sure there is metadata!

            console.log(formatToReport(file, metadata))
        }

        if (commandOptions.details) {
            if (!metadata) {
                console.error('Internal Error: No meta data found')
            }
            assert(metadata) // Make sure there is metadata!

            console.log(formatToDetails(file, metadata))
        }
    }

    //state returned:
    // - passed (no errors/warnings),
    // - finished (with warnings, no errors) / or - passed with warnings
    // - failed (errors),

    if (isCatchedError) {
        errors = 1
    }
    if (errors) {
        // red ✖
        console.error(
            formatToStatus('Failed', errors, warnings, notices, infos),
        )

        exit(1)
    } else if (warnings) {
        // yellow ⚠️
        console.warn(
            formatToStatus(
                'Passed-with-Warnings',
                errors,
                warnings,
                notices,
                infos,
            ),
        )

        exit(0)
    } else {
        // green ✔
        console.log(formatToStatus('Passed', errors, warnings, notices, infos))

        exit(0)
    }
}

const formatToStatus = (
    statusType: 'Passed' | 'Passed-with-Warnings' | 'Failed',
    errors: number,
    warnings: number,
    notices: number,
    infos: number,
): string => {
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

    str += ` (${errors} errors, ${warnings} warnings, ${notices + infos} total messages)`
    return str
}

// --- Format to a Report --------------------------------------------------------

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
const formatToReport = (
    fileWithPath: string,
    metadata: ResultMetadata,
): string => {
    console.log('formatToReport(..)')
    printObject(metadata)
    console.log()

    assert(metadata.diagnostics)
    const diag = metadata.diagnostics

    const str = `Validation Report
=================

File      "${fileWithPath}"

Summary
-------
Mode:     '${metadata.mode}'
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
const formatToDetails = (
    fileWithPath: string,
    metadata: ResultMetadata,
): string => {
    console.log('formatToDetails(..)')
    printObject(metadata)
    console.log(toPrettyJSON(metadata))
    console.log()

    const str = `Details`

    return str
}
// -------------------------------------------------------------------------
