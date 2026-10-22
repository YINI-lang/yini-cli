export type GetPathError =
    | { kind: 'malformed-path'; path: string; reason: string }
    | { kind: 'missing-property'; path: string; parent: string; keys: string[] }
    | { kind: 'invalid-list-index'; index: string; parent: string }
    | {
          kind: 'out-of-range-index'
          index: string
          parent: string
          length: number
      }
    | {
          kind: 'invalid-traversal'
          component: string
          parent: string
          value: unknown
      }

export type GetPathResult =
    | { ok: true; value: unknown }
    | { ok: false; error: GetPathError }

const displayPath = (parts: string[]): string =>
    parts
        .map((part) => part.replace(/\\/g, '\\\\').replace(/\./g, '\\.'))
        .join('.')

const splitPath = (path: string): string[] | null => {
    if (!path) return null

    const parts: string[] = []
    let part = ''

    for (let index = 0; index < path.length; index += 1) {
        const char = path[index]

        if (char === '\\') {
            const escaped = path[index + 1]
            if (escaped !== '.' && escaped !== '\\') return null
            part += escaped
            index += 1
        } else if (char === '.') {
            if (!part) return null
            parts.push(part)
            part = ''
        } else {
            part += char
        }
    }

    if (!part) return null
    parts.push(part)
    return parts
}

export const getPath = (document: unknown, path?: string): GetPathResult => {
    if (path === undefined) return { ok: true, value: document }

    const parts = splitPath(path)
    if (!parts) {
        return {
            ok: false,
            error: {
                kind: 'malformed-path',
                path,
                reason: 'Use non-empty dot-separated components; only \\. and \\\\ are valid escapes.',
            },
        }
    }

    let value = document
    for (let index = 0; index < parts.length; index += 1) {
        const component = parts[index]
        const parent = displayPath(parts.slice(0, index))

        if (Array.isArray(value)) {
            if (!/^(0|[1-9][0-9]*)$/.test(component)) {
                return {
                    ok: false,
                    error: {
                        kind: 'invalid-list-index',
                        index: component,
                        parent,
                    },
                }
            }

            const position = Number(component)
            if (!Number.isSafeInteger(position)) {
                return {
                    ok: false,
                    error: {
                        kind: 'invalid-list-index',
                        index: component,
                        parent,
                    },
                }
            }
            if (
                position >= value.length ||
                !Object.prototype.hasOwnProperty.call(value, position)
            ) {
                return {
                    ok: false,
                    error: {
                        kind: 'out-of-range-index',
                        index: component,
                        parent,
                        length: value.length,
                    },
                }
            }
            value = value[position]
            continue
        }

        if (value !== null && typeof value === 'object') {
            if (!Object.prototype.hasOwnProperty.call(value, component)) {
                return {
                    ok: false,
                    error: {
                        kind: 'missing-property',
                        path: displayPath(parts.slice(0, index + 1)),
                        parent,
                        keys: Object.keys(value),
                    },
                }
            }
            value = (value as Record<string, unknown>)[component]
            continue
        }

        return {
            ok: false,
            error: { kind: 'invalid-traversal', component, parent, value },
        }
    }

    return { ok: true, value }
}
