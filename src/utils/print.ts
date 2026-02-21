/**
 * This file contains general system helper functions (utils).
 * @note More specific YINI helper functions should go into yiniHelpers.ts-file.
 */
import util from 'util'
import { isDebug, isDev, isProdEnv, isTestEnv } from '../config/env.js'

type ToPrettyJSOptions = {
    indent?: number // default: 4
    exportDefault?: boolean // default: false  -> if true: "export default ...;"
    trailingSemicolon?: boolean // default: true when exportDefault
}

export const debugPrint = (str: any = '') => {
    isDebug() && console.debug('DEBUG: ' + str)
}

export const devPrint = (str: any = '') => {
    isDev() && !isTestEnv() && console.log('DEV: ' + str)
}

export const toJSON = (obj: any): string => {
    const str = JSON.stringify(obj)
    return str
}

export const toPrettyJSON = (obj: any): string => {
    const str = JSON.stringify(obj, null, 4)
    return str
}

/** Pretty-prints a JavaScript object as formatted JSON to the console.
 * Strict JSON, all keys are enclosed in ", etc.
 */
export const printJSON = (obj: any, isForce = false) => {
    if (!isForce) {
        if (isProdEnv() || (isTestEnv() && !isDebug())) return
    }

    const str = toPrettyJSON(obj)
    console.log(str)
}

/**
 * Print a full JavaScript object in a human-readable way (not as JSON).
 * Not strict JSON, and shows functions, symbols, getters/setters, and class names.
 * @param isColors If true, the output is styled with ANSI color codes.
 *
 * @note This function relies on util.inspect(..).
 */
export const printObject = (obj: any, isForce = false, isColors = true) => {
    if (!isForce) {
        if (isProdEnv() || (isTestEnv() && !isDebug())) return
    }

    console.log(util.inspect(obj, { depth: null, colors: isColors }))
}

/**
 * A clean and stable toPrettyJS(..) without relying on util.inspect(..).
 * - Deterministic output (unlike util.inspect, which can vary across Node versions).
 * - Exactly 4 spaces.
 * - Clean single quotes.
 * - Proper escaping, and safe quoting of non-identifier keys.
 */
export function toPrettyJS(
    value: unknown,
    opts: ToPrettyJSOptions = {},
): string {
    const indent = opts.indent ?? 4
    const exportDefault = opts.exportDefault ?? false
    const trailingSemicolon = opts.trailingSemicolon ?? exportDefault

    const pad = (level: number) => ' '.repeat(level * indent)

    const isPlainObject = (v: any): v is Record<string, unknown> =>
        v !== null &&
        typeof v === 'object' &&
        Object.getPrototypeOf(v) === Object.prototype

    const isValidIdentifier = (key: string) =>
        /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)

    const escapeString = (s: string) =>
        s
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n')
            .replace(/\t/g, '\\t')
            .replace(/\u2028/g, '\\u2028')
            .replace(/\u2029/g, '\\u2029')

    const formatKey = (key: string) =>
        isValidIdentifier(key) ? key : `'${escapeString(key)}'`

    const format = (v: unknown, level: number): string => {
        if (v === null) return 'null'

        const t = typeof v

        if (t === 'string') return `'${escapeString(v as string)}'`
        if (t === 'number') return Number.isFinite(v) ? String(v) : 'null'
        if (t === 'boolean') return v ? 'true' : 'false'
        if (t === 'bigint') return `${v}n`
        if (t === 'undefined') return 'undefined'
        if (t === 'function') return '[Function]'
        if (t === 'symbol') return 'Symbol()'

        if (v instanceof Date) return `'${v.toISOString()}'`
        if (Array.isArray(v)) {
            if (v.length === 0) return '[]'

            const inner = v
                .map((item) => `${pad(level + 1)}${format(item, level + 1)}`)
                .join(',\n')

            return `[\n${inner}\n${pad(level)}]`
        }

        if (isPlainObject(v)) {
            const keys = Object.keys(v)
            if (keys.length === 0) return '{}'

            const inner = keys
                .map(
                    (k) =>
                        `${pad(level + 1)}${formatKey(k)}: ${format((v as any)[k], level + 1)}`,
                )
                .join(',\n')

            return `{\n${inner}\n${pad(level)}}`
        }

        // Fallback for Map/Set/class instances etc.
        try {
            // JSON fallback keeps it stable-ish for "weird" objects
            return `'${escapeString(JSON.stringify(v))}'`
        } catch {
            return "'[Unserializable]'"
        }
    }

    const body = format(value, 0)
    if (!exportDefault) return body

    return `export default ${body}${trailingSemicolon ? ';' : ''}\n`
}
