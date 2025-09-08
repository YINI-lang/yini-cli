//export type TBailSensitivity = 'auto' | 0 | 1 | 2
export type TPreferredFailLevel = 'auto' | 0 | 1 | 2 // Preferred bail sensitivity level.
export type TBailSensitivityLevel = 0 | 1 | 2 // Bail sensitivity level.

export interface ICLIParseOptions {
    strict?: boolean
    pretty?: boolean
    log?: boolean
    json?: boolean
    output?: string
}

// --- Parser Options --------------------------------------------------------
/*
 * Based on yini-parser options:
 * 1.1.0-beta
 */
export interface IAllUserOptions extends IPrimaryUserParams {
    includeDiagnostics?: boolean // (Requires includeMetaData) Include diagnostics in meta data, when isIncludeMeta.
    includeTiming?: boolean // (Requires includeMetaData) Include timing data of the different phases in meta data, when isIncludeMeta.
    preserveUndefinedInMeta?: boolean // (Requires includeMetaData) If true, keeps properties with undefined values in the returned meta data, when isIncludeMeta.
    requireDocTerminator?: boolean // // If true, the document terminator '/END' at the end of the document is required, otherwise it's optional.
}
interface IPrimaryUserParams {
    strictMode?: boolean
    failLevel?: TPreferredFailLevel // 0 | "auto" | 1 | 2
    includeMetaData?: boolean // Include meta data along the returned result.
}
// -------------------------------------------------------------------------

// Human label types.
export type TPersistThreshold =
    | '0-Ignore-Errors' // 0 - Don't bail/fail on error, persist and try to recover.
    | '1-Abort-on-Errors' // 1 - Stop parsing on the first error.
    | '2-Abort-Even-on-Warnings' // 2 - Stop parsing on the first warning or error.

/**
 * Only for returned meta data to user.
 * NOTE: Only use lower case snake_case for keys.
 */
export type TFailLevelKey =
    | 'ignore_errors' // 0 - Don't bail/fail on error, persist and try to recover.
    | 'abort_on_errors' // 1 - Stop parsing on the first error.
    | 'abort_on_warnings' // 2 - Stop parsing on the first warning or error.

//{ line: 12, column: 8, type: 'Syntax-Error', message1: 'Invalid number' }
export interface IIssuePayload {
    line: number | undefined // NOTE: 1-based, so line 0 does not exist, set to undefined instead.
    column: number | undefined // NOTE: 1-based, so column 0 does not exist, set to undefined instead.
    typeKey: string // Transformed from the corresponding type, keep it lowercase since it's shown in meta, easier for tooling.
    message: string
    advice: string | undefined
    hint: string | undefined
}

// --- Result Meta Interface --------------------------------------------------------
/*
 * Based on metaSchemaVersion: 1.0.0
 */
export interface IResultMetaData {
    parserVersion: string
    mode: 'lenient' | 'strict'
    orderPreserved: boolean
    totalErrors: number
    totalWarnings: number
    totalMessages: number
    runStartedAt: string
    runFinishedAt: string
    durationMs: number
    source: {
        sourceType: string // Transformed from the type, keep it lowercase since it's shown in resulted meta, easier for tooling.
        fileName: undefined | string // Path and file name if from file.
        hasDocumentTerminator: boolean
        hasYiniMarker: boolean
        byteSize: null | number
        lineCount: null | number // Number of lines of content or in the yini file (before possible tampering).
        sha256: null | string // SHA-256 hash of the original source content or file (before possible tampering).
    }
    structure: {
        maxDepth: null | number
        sectionCount: null | number // Section (header) count, section '(root)' NOT included.
        memberCount: null | number // Section (member) count.
        keysParsedCount: null | number // Including keys inside inline objects, and in section members.
        // objectCount: null | number // (?) Incl. sections (objects) + inline objects.
        // listCount: null | number
        sectionNamePaths: string[] | null // All key/access paths to section Headers.
    }
    metaSchemaVersion: '1.0.0'
    diagnostics?: {
        failLevel: {
            preferredLevel: null | 'auto' | 0 | 1 | 2 // Input level into function.
            levelUsed: TBailSensitivityLevel
            levelKey: TFailLevelKey // Mapped from the corresponding type, keep it lowercase since it's shown in meta, easier for tooling.
            levelLabel: TPersistThreshold
            levelDescription: string | null
        }
        errors: { errorCount: number; payload: IIssuePayload[] }
        warnings: { warningCount: number; payload: IIssuePayload[] }
        notices: { noticeCount: number; payload: IIssuePayload[] }
        infos: { infoCount: number; payload: IIssuePayload[] }
        environment: {
            NODE_ENV: undefined | string
            APP_ENV: undefined | string
            lib: {
                nodeEnv: undefined | string
                appEnv: undefined | string
                flags: { isDev: boolean; isDebug: boolean }
            }
        }
        optionsUsed: IAllUserOptions
    }
    timing?: {
        total: null | { timeMs: number; name: string }
        phase0: undefined | { timeMs: number; name: string } // NOTE: When source is 'inline' phase0 is set to undefined as phase0 times I/O.
        phase1: null | { timeMs: number; name: string }
        phase2: null | { timeMs: number; name: string }
        phase3: null | { timeMs: number; name: string }
        phase4: null | { timeMs: number; name: string }
    }
}
