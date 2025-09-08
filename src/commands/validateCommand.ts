import assert from 'node:assert'
import fs from 'node:fs'
import { exit } from 'node:process'
import YINI from 'yini-parser'
import { IResultMetaData } from '../types.js'
import { printObject } from '../utils/print.js'

// --- CLI command "validate" options --------------------------------------------------------
export interface ICLIValidateOptions {
    strict?: boolean
    report?: boolean
    details?: boolean
    silent?: boolean
}
// -------------------------------------------------------------------------

export const validateFile = (
    file: string,
    options: ICLIValidateOptions = {},
) => {
    let parsedResult: any
    let isCatchedError: boolean = true

    try {
        const content = fs.readFileSync(file, 'utf-8')
        const isMeta = true
        parsedResult = YINI.parse(content, {
            strictMode: options.strict ?? false,
            includeMetaData: true,
            includeDiagnostics: true,
        })

        isCatchedError = false
    } catch (err: any) {
        isCatchedError = true
    }

    let metaData: IResultMetaData | null = null
    let errors = 0
    let warnings = 0
    let notices = 0
    let infos = 0

    if (parsedResult?.meta) {
        metaData = parsedResult?.meta
        assert(metaData) // Make sure there is metaData!
        // printObject(metaData, true)

        const diag = metaData.diagnostics

        errors = diag!.errors.errorCount
        warnings = diag!.warnings.warningCount
        notices = diag!.notices.noticeCount
        infos = diag!.infos.infoCount
    }

    console.log('metaData = ' + metaData)
    console.log(
        'includeMetaData = ' +
            metaData?.diagnostics?.optionsUsed.includeMetaData,
    )
    console.log('options.report = ' + !options.report)

    if (!options.silent) {
        if (options.report) {
            if (!metaData) {
                console.error('Internal Error: No meta data found')
            }
            assert(metaData) // Make sure there is metaData!

            console.log(formatToReport(file, metaData))
        }

        if (options.details) {
            if (!metaData) {
                console.error('Internal Error: No meta data found')
            }
            assert(metaData) // Make sure there is metaData!

            console.log(formatToDetails(file, metaData))
        }
    }

    //state returned:
    // - passed (no errors/warnings),
    // - finished (with warnings, no errors) / or - passed with warnings
    // - failed (errors),

    if (!isCatchedError) {
        // green ✔
        console.log(
            `✔  Validation passed (${99} errors, ${99} warnings, ${99} total messages)`,
        )

        // yellow ⚠️
        console.log(
            `⚠️ Validation finished (${99} errors, ${99} warnings, ${99} total messages)`,
        )

        exit(0)
    } else {
        // red ✖
        console.error(
            `✖ Validation failed (${99} errors, ${99} warnings, ${99} total messages)`,
        )
        exit(1)
    }
}

//@todo
const formatToStatus = (
    isCatchedError: boolean,
    metaData: IResultMetaData | null,
): string => {
    const str: string = ``

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
    metaData: IResultMetaData,
): string => {
    console.log('formatToReport(..)')
    printObject(metaData)
    console.log()

    const diag = metaData.diagnostics

    const str: string = `Validation report
-----------------
For file "${fileWithPath}"

  Errors: ${diag!.errors.errorCount}
Warnings: ${diag!.warnings.warningCount}
 Notices: ${diag!.notices.noticeCount}
   Infos: ${diag!.infos.infoCount}

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
    metaData: IResultMetaData,
): string => {
    console.log('formatToDetails(..)')
    printObject(metaData)
    console.log()

    const str: string = ``

    return str
}
// -------------------------------------------------------------------------
