export interface ICLIParseOptions {
    strict?: boolean
    pretty?: boolean
    log?: boolean
    json?: boolean
    output?: string
}

export type TBailSensitivity = 'auto' | 0 | 1 | 2
