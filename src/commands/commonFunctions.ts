import { IGlobalOptions } from '../types.js'

export const printStdout = (options: IGlobalOptions, text: string) => {
    if (options.silent) return
    console.log(text)
}

export const printStderr = (options: IGlobalOptions, text: string) => {
    if (options.silent) return
    console.error(text)
}

export const printWarning = (options: IGlobalOptions, text: string) => {
    if (options.silent) return
    if (options.quiet) return
    console.warn(text)
}

export const resolveStrictMode = (options: IGlobalOptions): boolean => {
    if (options.strict && options.lenient) {
        throw new Error('--strict and --lenient cannot be used together.')
    }

    if (options.strict) return true
    if (options.lenient) return false

    return false // Default = lenient
}
