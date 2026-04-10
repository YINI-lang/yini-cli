// src/commands/commonFunctions.ts
import path from 'node:path'
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

/**
 *
 * @note Windows safe, since Windows paths are case-insensitive,
 * so on Windows cases are normalized too.
 */
export const assertInputAndOutputAreDifferent = (
    srcPath: string,
    destPath: string,
) => {
    const resolvedSrc = path.resolve(srcPath)
    const resolvedDest = path.resolve(destPath)

    const normalizedSrc =
        process.platform === 'win32' ? resolvedSrc.toLowerCase() : resolvedSrc

    const normalizedDest =
        process.platform === 'win32' ? resolvedDest.toLowerCase() : resolvedDest

    if (normalizedSrc === normalizedDest) {
        throw new Error('Output file must be different from the input file.')
    }
}
