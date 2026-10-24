/**
 * Tests that `parse --output` writes the expected content without changing files
 * it should protect. Covers overwrite options, unchanged output, parse failures,
 * and output paths that refer to the input file.
 */
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { yiniCLI } from '../test-helpers'

const INPUT_FILE = path.resolve(
    __dirname,
    '../fixtures/parse/lenient/valid/simple-config.yini',
)
const INVALID_FILE = path.resolve(
    __dirname,
    '../fixtures/parse/lenient/invalid/invalid-config-1.yini',
)
const TEMP_DIR = path.resolve(__dirname, '../temp')

const expectedOutput = JSON.stringify(
    {
        App: {
            name: 'Demo',
            version: '1.0',
            features: ['search', 'dark-mode'],
        },
    },
    null,
    4,
)

describe('Parse command output-file safety.', () => {
    it('Writes the exact serialized output and nothing to stdout.', async () => {
        const outputFile = path.join(TEMP_DIR, 'exact-output.json')
        if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile)

        try {
            const { stdout, stderr, exitCode } = await yiniCLI([
                'parse',
                INPUT_FILE,
                '--output',
                outputFile,
            ])

            expect(exitCode).toBe(0)
            expect(stdout).toBe('')
            expect(stderr).toBe('')
            expect(fs.readFileSync(outputFile, 'utf8')).toBe(expectedOutput)
        } finally {
            if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile)
        }
    })

    it('Does not modify a destination newer than the input.', async () => {
        const outputFile = path.join(TEMP_DIR, 'newer-output.json')
        const original = 'do not replace'
        fs.writeFileSync(outputFile, original)

        const srcMtime = fs.statSync(INPUT_FILE).mtimeMs
        const newerTime = (srcMtime + 60_000) / 1000
        fs.utimesSync(outputFile, newerTime, newerTime)
        const mtimeBefore = fs.statSync(outputFile).mtimeMs

        try {
            const { exitCode } = await yiniCLI([
                'parse',
                INPUT_FILE,
                '--output',
                outputFile,
            ])

            expect(exitCode).toBe(0)
            expect(fs.readFileSync(outputFile, 'utf8')).toBe(original)
            expect(fs.statSync(outputFile).mtimeMs).toBe(mtimeBefore)
        } finally {
            if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile)
        }
    })

    it('Replaces an older destination with the exact output.', async () => {
        const outputFile = path.join(TEMP_DIR, 'older-output.json')
        fs.writeFileSync(outputFile, 'old output')

        const srcMtime = fs.statSync(INPUT_FILE).mtimeMs
        const olderTime = (srcMtime - 60_000) / 1000
        fs.utimesSync(outputFile, olderTime, olderTime)

        try {
            const { exitCode } = await yiniCLI([
                'parse',
                INPUT_FILE,
                '--output',
                outputFile,
            ])

            expect(exitCode).toBe(0)
            expect(fs.readFileSync(outputFile, 'utf8')).toBe(expectedOutput)
        } finally {
            if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile)
        }
    })

    it('Does not rewrite unchanged output.', async () => {
        const outputFile = path.join(TEMP_DIR, 'unchanged-output.json')
        fs.writeFileSync(outputFile, expectedOutput)

        const srcMtime = fs.statSync(INPUT_FILE).mtimeMs
        const olderTime = (srcMtime - 60_000) / 1000
        fs.utimesSync(outputFile, olderTime, olderTime)
        const mtimeBefore = fs.statSync(outputFile).mtimeMs

        try {
            const { exitCode } = await yiniCLI([
                'parse',
                INPUT_FILE,
                '--output',
                outputFile,
            ])

            expect(exitCode).toBe(0)
            expect(fs.statSync(outputFile).mtimeMs).toBe(mtimeBefore)
        } finally {
            if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile)
        }
    })

    it('Leaves existing content unchanged with --no-overwrite.', async () => {
        const outputFile = path.join(TEMP_DIR, 'no-overwrite-output.json')
        const original = 'keep this content'
        fs.writeFileSync(outputFile, original)

        try {
            const { stderr, exitCode } = await yiniCLI([
                'parse',
                INPUT_FILE,
                '--output',
                outputFile,
                '--no-overwrite',
            ])

            expect(exitCode).toBe(1)
            expect(stderr).toContain('Overwriting disabled')
            expect(fs.readFileSync(outputFile, 'utf8')).toBe(original)
        } finally {
            if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile)
        }
    })

    it('Preserves an existing destination when parsing fails with --overwrite.', async () => {
        const outputFile = path.join(TEMP_DIR, 'failed-parse-output.json')
        const original = 'keep this content'
        fs.writeFileSync(outputFile, original)
        const mtimeBefore = fs.statSync(outputFile).mtimeMs

        try {
            const { stdout, stderr, exitCode } = await yiniCLI([
                'parse',
                INVALID_FILE,
                '--output',
                outputFile,
                '--overwrite',
            ])

            expect(exitCode).toBe(1)
            expect(stdout).toBe('')
            expect(stderr).toMatch(/syntax error/i)
            expect(fs.readFileSync(outputFile, 'utf8')).toBe(original)
            expect(fs.statSync(outputFile).mtimeMs).toBe(mtimeBefore)
        } finally {
            if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile)
        }
    })

    it('Refuses an output hard link that refers to the input file.', async () => {
        const sourceFile = path.join(TEMP_DIR, 'hard-link-source.yini')
        const outputFile = path.join(TEMP_DIR, 'hard-link-output.json')
        const original = fs.readFileSync(INPUT_FILE, 'utf8')
        fs.writeFileSync(sourceFile, original)
        if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile)
        fs.linkSync(sourceFile, outputFile)

        try {
            const { stderr, exitCode } = await yiniCLI([
                'parse',
                sourceFile,
                '--output',
                outputFile,
                '--overwrite',
            ])

            expect(exitCode).toBe(1)
            expect(stderr).toContain(
                'Output file must be different from the input file',
            )
            expect(fs.readFileSync(sourceFile, 'utf8')).toBe(original)
        } finally {
            if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile)
            if (fs.existsSync(sourceFile)) fs.unlinkSync(sourceFile)
        }
    })
})
