import { describe, expect, it } from 'vitest'
import { getPath } from '../../src/commands/getCommand/getPath.js'

const document = {
    App: {
        'connection.host': 'localhost',
        'slash\\key': 'escaped',
        '0': 'numeric key',
        values: [null, false, 0, ''],
        nested: { name: 'Demo' },
    },
}

const errorKind = (path: string) => {
    const result = getPath(document, path)
    return result.ok ? null : result.error.kind
}

describe('get path resolver', () => {
    it('selects the whole document and present falsy values', () => {
        expect(getPath(document)).toEqual({ ok: true, value: document })
        for (const [index, value] of [null, false, 0, ''].entries()) {
            expect(getPath(document, `App.values.${index}`)).toEqual({
                ok: true,
                value,
            })
        }
    })

    it('decodes escaped dots and backslashes and treats numeric object keys as keys', () => {
        expect(getPath(document, 'App.connection\\.host')).toEqual({
            ok: true,
            value: 'localhost',
        })
        expect(getPath(document, 'App.slash\\\\key')).toEqual({
            ok: true,
            value: 'escaped',
        })
        expect(getPath(document, 'App.0')).toEqual({
            ok: true,
            value: 'numeric key',
        })
    })

    it.each(['', '.App', 'App.', 'App..name', 'App.name\\', 'App.name\\x'])(
        'rejects malformed path %s',
        (path) => expect(errorKind(path)).toBe('malformed-path'),
    )

    it.each(['-1', '+1', '01', '1\\.5', 'first', '9007199254740992'])(
        'rejects invalid list index %s',
        (index) =>
            expect(errorKind(`App.values.${index}`)).toBe('invalid-list-index'),
    )

    it('reports out-of-range indexes and traversal below scalars', () => {
        expect(errorKind('App.values.4')).toBe('out-of-range-index')
        for (const index of [0, 1, 2, 3]) {
            expect(errorKind(`App.values.${index}.child`)).toBe(
                'invalid-traversal',
            )
        }
    })

    it('uses own properties only, including prototype-like names', () => {
        expect(errorKind('App.toString')).toBe('missing-property')
        expect(errorKind('App.__proto__')).toBe('missing-property')
        const own = Object.create(null) as Record<string, unknown>
        own['__proto__'] = 'own value'
        expect(getPath(own, '__proto__')).toEqual({
            ok: true,
            value: 'own value',
        })
    })
})
