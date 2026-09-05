import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { yiniCLI } from '../test-helpers'

const FIXTURES_DIR = path.resolve(__dirname, '../fixtures/parse/lenient')
const VALID_FILE = path.join(FIXTURES_DIR, 'valid/simple-config.yini')
const INVALID_FILE = path.join(FIXTURES_DIR, 'invalid/invalid-config-1.yini')
const TEMP_DIR = path.resolve(__dirname, '../temp')

describe('Parse command options and failure handling.', () => {
    it.each([
        ['--json', '--compact'],
        ['--json', '--js'],
        ['--json', '--yaml'],
        ['--json', '--xml'],
        ['--compact', '--js'],
        ['--compact', '--yaml'],
        ['--compact', '--xml'],
        ['--js', '--yaml'],
        ['--js', '--xml'],
        ['--yaml', '--xml'],
    ])('rejects conflicting formats %s and %s cleanly.', async (a, b) => {
        const { stdout, stderr, exitCode } = await yiniCLI([
            'parse',
            VALID_FILE,
            a,
            b,
        ])

        expect(exitCode).toBe(1)
        expect(stdout).toBe('')
        expect(stderr).toContain('Choose only one output format')
        expect(stderr).not.toContain('at resolveOutputFormat')
    })

    it('rejects --strict and --lenient together.', async () => {
        const { stdout, stderr, exitCode } = await yiniCLI([
            'parse',
            VALID_FILE,
            '--strict',
            '--lenient',
        ])

        expect(exitCode).toBe(1)
        expect(stdout).toBe('')
        expect(stderr).toContain(
            '--strict and --lenient cannot be used together',
        )
    })

    it.each([
        ['--overwrite', '--no-overwrite'],
        ['--no-overwrite', '--overwrite'],
    ])('rejects conflicting overwrite options %s and %s.', async (a, b) => {
        const outputFile = path.join(TEMP_DIR, 'conflicting-overwrite.json')
        const { stdout, stderr, exitCode } = await yiniCLI([
            'parse',
            VALID_FILE,
            '--output',
            outputFile,
            a,
            b,
        ])

        expect(exitCode).toBe(1)
        expect(stdout).toBe('')
        expect(stderr).toContain(
            '--overwrite and --no-overwrite cannot be used together',
        )
    })

    it('suppresses parse output in silent mode.', async () => {
        const { stdout, stderr, exitCode } = await yiniCLI([
            'parse',
            VALID_FILE,
            '--silent',
        ])

        expect(exitCode).toBe(0)
        expect(stdout).toBe('')
        expect(stderr).toBe('')
    })

    it('warns for --pretty but still emits JSON.', async () => {
        const { stdout, stderr, exitCode } = await yiniCLI([
            'parse',
            VALID_FILE,
            '--pretty',
        ])

        expect(exitCode).toBe(0)
        expect(JSON.parse(stdout)).toEqual({
            App: {
                name: 'Demo',
                version: '1.0',
                features: ['search', 'dark-mode'],
            },
        })
        expect(stderr).toContain('--pretty is deprecated')
    })

    it('suppresses the --pretty warning in quiet mode.', async () => {
        const { stdout, stderr, exitCode } = await yiniCLI([
            'parse',
            VALID_FILE,
            '--pretty',
            '--quiet',
        ])

        expect(exitCode).toBe(0)
        expect(JSON.parse(stdout)).toBeTypeOf('object')
        expect(stderr).toBe('')
    })

    it('emits an empty object for unrecoverable input with --best-effort.', async () => {
        const { stdout, stderr, exitCode } = await yiniCLI([
            'parse',
            INVALID_FILE,
            '--best-effort',
            '--compact',
        ])

        expect(exitCode).toBe(0)
        expect(stdout).toBe('{}')
        expect(stderr).toBe('')
    })

    it('does not create an output file after a parse failure.', async () => {
        const outputFile = path.join(TEMP_DIR, 'invalid-parse-output.json')
        if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile)

        try {
            const { exitCode } = await yiniCLI([
                'parse',
                INVALID_FILE,
                '--output',
                outputFile,
            ])

            expect(exitCode).toBe(1)
            expect(fs.existsSync(outputFile)).toBe(false)
        } finally {
            if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile)
        }
    })

    it('reports a missing input file without a stack trace.', async () => {
        const missingFile = path.join(TEMP_DIR, 'does-not-exist.yini')
        const { stdout, stderr, exitCode } = await yiniCLI([
            'parse',
            missingFile,
        ])

        expect(exitCode).toBe(1)
        expect(stdout).toBe('')
        expect(stderr).toContain('Error:')
        expect(stderr).not.toContain('\n    at ')
    })
})
