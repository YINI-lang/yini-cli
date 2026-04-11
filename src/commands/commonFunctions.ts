// src/commands/commonFunctions.ts
import fs from 'node:fs'
import path from 'node:path'
import { IGlobalOptions } from '../types.js'

export type TValidateRunMode = 'file' | 'directory'

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

export const resolveRunModeFromTargets = (
    targets: string[],
): TValidateRunMode => {
    for (const target of targets) {
        const resolved = path.resolve(target)

        if (!fs.existsSync(resolved)) {
            throw new Error(`Path does not exist: "${target}"`)
        }

        if (fs.statSync(resolved).isDirectory()) {
            return 'directory'
        }
    }

    return 'file'
}

export const getDisplayBaseDir = (targets: string[]): string => {
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

export const toDisplayPath = (filePath: string, baseDir: string): string => {
    const relative = path.relative(baseDir, filePath)

    if (!relative || relative.startsWith('..')) {
        return filePath
    }

    return relative
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
