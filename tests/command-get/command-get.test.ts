import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { yiniCLI } from '../test-helpers.js'

const fixture = (...parts: string[]) =>
    path.join(__dirname, '../fixtures', ...parts)
const values = fixture('get', 'values.yini')
const run = (args: string[], options = {}) =>
    yiniCLI(args, { stripFinalNewline: false, ...options })

describe('get command', () => {
    it('prints the complete document as pretty JSON', async () => {
        const whole = await run(['get', values])
        expect(whole.exitCode).toBe(0)
        expect(whole.stderr).toBe('')
        expect(JSON.parse(whole.stdout)).toHaveProperty('App.name', 'Demo')
        expect(whole.stdout).toContain('\n    "App": {')
        expect(whole.stdout.endsWith('\n')).toBe(true)
    })

    it.each([
        ['App.settings', { theme: 'dark', retries: 2 }],
        [
            'App.servers',
            [
                { host: 'alpha', port: 443 },
                { host: 'beta', port: 8443 },
            ],
        ],
    ])('prints %s as pretty JSON', async (selected, expected) => {
        const result = await run(['get', values, selected])
        expect(result.exitCode).toBe(0)
        expect(result.stdout).toBe(`${JSON.stringify(expected, null, 4)}\n`)
    })

    it.each([
        ['App.name', 'Demo\n'],
        ['App.empty', '\n'],
        ['App.count', '0\n'],
        ['App.pi', '3.14\n'],
        ['App.enabled', 'false\n'],
        ['App.unset', 'null\n'],
        ['App.servers.0.host', 'alpha\n'],
        ['App.servers.1.port', '8443\n'],
        ['App.connection\\.host', 'localhost\n'],
        ['App.0', 'numeric key\n'],
        ['App.slash\\\\key', 'backslash key\n'],
    ])('prints %s as exact scalar text', async (selected, expected) => {
        const result = await run(['get', values, selected])
        expect(result).toMatchObject({
            exitCode: 0,
            stdout: expected,
            stderr: '',
        })
    })

    it.each([
        ['json', '"Demo"\n'],
        ['json-compact', '"Demo"\n'],
        ['text', 'Demo\n'],
    ])('prints a scalar with --format %s', async (format, expected) => {
        const result = await run(['get', values, 'App.name', '--format', format])
        expect(result.stdout).toBe(expected)
    })

    it('prints structured values as compact JSON when requested', async () => {
        const result = await run([
            'get',
            values,
            'App.settings',
            '--format',
            'json-compact',
        ])
        expect(result.stdout).toBe('{"theme":"dark","retries":2}\n')
    })

    it('rejects text output for structured values', async () => {
        const invalid = await run([
            'get',
            values,
            'App.settings',
            '--format',
            'text',
        ])
        expect(invalid.exitCode).toBe(1)
        expect(invalid.stdout).toBe('')
        expect(invalid.stderr).toContain(
            'Text output is only available for scalar',
        )
    })

    const multilineInput =
        '^ App\nmessage = """Hello\nworld"""\nending = """Hello\n"""\n'

    it.each([
        ['App.message', 'Hello\nworld\n'],
        ['App.ending', 'Hello\n'],
    ])('prints %s with one final line feed', async (selected, expected) => {
        const result = await run(['get', '-', selected], {
            input: multilineInput,
        })
        expect(result.stdout).toBe(expected)
    })

    it('escapes multiline strings in JSON output', async () => {
        const json = await run(['get', '-', 'App.message', '--format', 'json'], {
            input: multilineInput,
        })
        expect(json.stdout).toBe('"Hello\\nworld"\n')
    })

    it('reads UTF-8 stdin', async () => {
        const input = '^ App\ncity = "München"\n'
        expect((await run(['get', '-', 'App.city'], { input })).stdout).toBe(
            'München\n',
        )
    })

    it('accepts an empty document in lenient mode but cannot select a path', async () => {
        const empty = await run(['get', '-'], { input: '' })
        expect(empty.exitCode).toBe(0)
        expect(empty.stdout).toBe('{}\n')
        expect(empty.stderr).toMatch(/warning/i)
        const missing = await run(['get', '-', 'App'], { input: '' })
        expect(missing.exitCode).toBe(1)
        expect(missing.stdout).toBe('')
    })

    it('rejects an empty document in strict mode', async () => {
        const strict = await run(['--strict', 'get', '-'], { input: '' })
        expect(strict.exitCode).toBe(1)
        expect(strict.stdout).toBe('')
    })

    it('shows available-key advice for missing paths unless quiet', async () => {
        const missing = await run(['get', values, 'App.hostname'])
        expect(missing.exitCode).toBe(1)
        expect(missing.stdout).toBe('')
        expect(missing.stderr).toContain('Error: Path not found: App.hostname')
        expect(missing.stderr).toContain('Available keys under "App"')
        const quiet = await run(['--quiet', 'get', values, 'App.hostname'])
        expect(quiet.stderr).toContain('Error: Path not found: App.hostname')
        expect(quiet.stderr).not.toContain('Available keys')
    })

    it('suppresses missing-path errors in silent mode', async () => {
        const silent = await run(['--silent', 'get', values, 'App.hostname'])
        expect(silent).toMatchObject({ exitCode: 1, stdout: '', stderr: '' })
    })

    it('sorts available keys and limits the advice to ten entries', async () => {
        const keys = [
            'z',
            'k',
            'a',
            'n',
            'd',
            'b',
            'y',
            'h',
            'f',
            'c',
            'j',
            'e',
        ]
        const input = `^ App\n${keys.map((key) => `${key} = 1`).join('\n')}\n`
        const result = await run(['get', '-', 'App.missing'], { input })
        expect(result.exitCode).toBe(1)
        expect(result.stderr).toContain('  ... and 2 more')
        const shown = result.stderr.match(/^  [a-z]$/gm) ?? []
        expect(shown).toEqual([
            '  a',
            '  b',
            '  c',
            '  d',
            '  e',
            '  f',
            '  h',
            '  j',
            '  k',
            '  n',
        ])
    })

    it.each([
        ['App.servers.first', 'Invalid list index'],
        ['App.servers.02', 'Invalid list index'],
        ['App.servers.2', 'out of range'],
        ['App.count.child', 'Cannot access'],
        ['App..name', 'Invalid path'],
        ['App.name\\x', 'Invalid path'],
    ])('reports a precise error for %s', async (selected, message) => {
        const result = await run(['get', values, selected])
        expect(result.exitCode).toBe(1)
        expect(result.stdout).toBe('')
        expect(result.stderr).toContain(message)
    })

    it('rejects recovered parser errors in lenient mode', async () => {
        const corrupt = fixture(
            'parse',
            'lenient',
            'invalid',
            'corrupt-config-1.yini',
        )
        const lenient = await run(['get', corrupt, 'Section.value'])
        expect(lenient.exitCode).toBe(1)
        expect(lenient.stdout).toBe('')
        expect(lenient.stderr).toContain('Error:')
    })

    it('rejects invalid input and accepts valid input in strict mode', async () => {
        const strict = await run(['--strict', 'get', values, 'App.name'])
        expect(strict.exitCode).toBe(1)
        expect(strict.stdout).toBe('')
        const valid = fixture(
            'parse',
            'strict',
            'valid',
            'strict-common-config-1.yini',
        )
        expect(
            (await run(['--strict', 'get', valid, 'MyPrefs.Buffers'])).stdout,
        ).toBe('10\n')
    })

    it('shows warnings unless quiet', async () => {
        const warning = fixture(
            'validate',
            'lenient',
            'warnings',
            'warning-duplicate-key-1.yini',
        )
        const ordinary = await run(['get', warning, 'App.title'])
        expect(ordinary.exitCode).toBe(0)
        expect(ordinary.stderr).toMatch(/warning/i)
        const quiet = await run(['--quiet', 'get', warning, 'App.title'])
        expect(quiet.exitCode).toBe(0)
        expect(quiet.stdout).toBe(ordinary.stdout)
        expect(quiet.stderr).toBe('')
    })

    it('shows file details in verbose mode', async () => {
        const verbose = await run(['--verbose', 'get', values, 'App.name'])
        expect(verbose.stdout).toBe('Demo\n')
        expect(verbose.stderr).toContain('Reading YINI')
    })

    it('rejects conflicting parser modes', async () => {
        const conflict = await run(['--strict', '--lenient', 'get', values])
        expect(conflict.exitCode).toBe(1)
        expect(conflict.stderr).toContain('cannot be used together')
    })

    it('rejects unreadable files', async () => {
        const unreadable = await run(['get', `${values}.missing`])
        expect(unreadable.exitCode).toBe(1)
        expect(unreadable.stdout).toBe('')
    })

    it('provides an equivalent peek alias', async () => {
        const primary = await run(['get', values, 'App.name'])
        const alias = await run(['peek', values, 'App.name'])
        expect(alias).toMatchObject({
            exitCode: primary.exitCode,
            stdout: primary.stdout,
            stderr: primary.stderr,
        })
    })

    it('shows get help with the alias and path escaping examples', async () => {
        const help = await run(['get', '--help'])
        expect(help.stdout).toContain('get|peek [options] <file> [path]')
        expect(help.stdout).toContain('peek')
        expect(help.stdout).toContain('connection\\.host')
        expect(help.stdout).toContain('App.slash\\\\key')
    })

    it.each([
        { name: 'unsupported format', args: ['get', values, '--format', 'yaml'] },
        {
            name: 'extra path argument',
            args: ['get', values, 'App.name', 'extra'],
        },
        { name: 'missing file argument', args: ['get'] },
    ])('rejects $name', async ({ args }) => {
        const result = await run(args)
        expect(result.exitCode).toBe(1)
        expect(result.stdout).toBe('')
        expect(result.stderr).not.toBe('')
    })

    it('suppresses invalid-argument diagnostics in silent mode', async () => {
        const result = await run([
            '--silent',
            'get',
            values,
            '--format',
            'yaml',
        ])
        expect(result).toMatchObject({ exitCode: 1, stdout: '', stderr: '' })
    })

    it('suppresses help in silent mode', async () => {
        const result = await run(['--silent', 'get', '--help'])
        expect(result).toMatchObject({ exitCode: 0, stdout: '', stderr: '' })
    })
})
