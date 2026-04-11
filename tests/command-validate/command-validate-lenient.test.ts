// tests/command-validate/command-validate-lenient.test.ts
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { yiniCLI } from '../test-helpers'

const FIXTURES_DIR = path.resolve(__dirname, '../fixtures/validate/lenient')
const VALID_DIR = path.join(FIXTURES_DIR, 'valid')
const INVALID_DIR = path.join(FIXTURES_DIR, 'invalid')

const validFixture = (fileName: string) => path.join(VALID_DIR, fileName)
const invalidFixture = (fileName: string) => path.join(INVALID_DIR, fileName)

describe('Validate command in lenient mode.', () => {
    describe('File mode with one valid file.', () => {
        it('1.a) Validates one valid file successfully in text format.', async () => {
            // Arrange.
            const fullPath = validFixture('validate-valid-basic-1.yini')

            // Act.
            const { stdout, stderr, exitCode } = await yiniCLI([
                'validate',
                fullPath,
                '--lenient',
                '--format',
                'text',
            ])

            // Assert.
            expect(exitCode).toBe(0)
            expect(stdout).toContain('✔  Validation successful')
            expect(stdout).toContain(`File:     "${fullPath}"`)
            expect(stdout).toContain('Mode:     lenient')
            expect(stdout).toContain('Errors:   0')
            expect(stdout).toContain('Warnings: 0')
            expect(stderr).toBe('')
        })

        it('1.b) Includes statistics for one valid file when --stats is used.', async () => {
            // Arrange.
            const fullPath = validFixture('validate-valid-basic-2.yini')

            // Act.
            const { stdout, exitCode } = await yiniCLI([
                'validate',
                fullPath,
                '--lenient',
                '--format',
                'text',
                '--stats',
            ])

            // Assert.
            expect(exitCode).toBe(0)
            expect(stdout).toContain('✔  Validation successful')
            expect(stdout).toContain('Statistics')
            expect(stdout).toContain('Line Count:')
            expect(stdout).toContain('Section Count:')
            expect(stdout).toContain('Member Count:')
            expect(stdout).toContain('Nesting Depth:')
        })

        it('1.c) Produces file-mode JSON for one valid file.', async () => {
            // Arrange.
            const fullPath = validFixture(
                'validate-valid-no-newline-at-eof.yini',
            )

            // Act.
            const { stdout, stderr, exitCode } = await yiniCLI([
                'validate',
                fullPath,
                '--lenient',
                '--format',
                'json',
            ])

            // Assert.
            const parsed = JSON.parse(stdout)

            expect(exitCode).toBe(0)
            expect(stderr).toBe('')
            expect(parsed.file).toBe(fullPath)
            expect(parsed.mode).toBe('lenient')
            expect(parsed.status).toBe('passed')
            expect(parsed.summary.errors).toBe(0)
            expect(parsed.summary.warnings).toBe(0)
            expect(Array.isArray(parsed.issues)).toBe(true)
        })
    })

    describe('File mode with one invalid file.', () => {
        it('2.a) Fails for one invalid file in text format.', async () => {
            // Arrange.
            const fullPath = invalidFixture('invalid-section-jump-1.yini')

            // Act.
            const { stdout, stderr, exitCode } = await yiniCLI([
                'validate',
                fullPath,
                '--lenient',
                '--format',
                'text',
            ])

            // Assert.
            expect(exitCode).toBe(1)
            expect(stdout).toContain('✖  Validation failed')
            expect(stdout).toContain(`File:     "${fullPath}"`)
            expect(stdout).toContain('Mode:     lenient')
            expect(stdout).toContain('Errors:')
            expect(stderr).toContain(`"${fullPath}"`)
            expect(stderr.toLowerCase()).toContain('error')
        })

        it('2.b) Produces file-mode JSON for one invalid file.', async () => {
            // Arrange.
            const fullPath = invalidFixture('invalid-garbage-1.yini')

            // Act.
            const { stdout, stderr, exitCode } = await yiniCLI([
                'validate',
                fullPath,
                '--lenient',
                '--format',
                'json',
            ])

            // Assert.
            const parsed = JSON.parse(stdout)

            expect(exitCode).toBe(1)
            expect(stderr).toBe('')
            expect(parsed.file).toBe(fullPath)
            expect(parsed.mode).toBe('lenient')
            expect(parsed.status).toBe('failed')
            expect(parsed.summary.errors).toBeGreaterThan(0)
            expect(Array.isArray(parsed.issues)).toBe(true)
            expect(parsed.issues.length).toBeGreaterThan(0)
        })

        it('2.c) Includes statistics for one invalid file when --stats is used.', async () => {
            // Arrange.
            const fullPath = invalidFixture('invalid-object-literal-1.yini')

            // Act.
            const { stdout, exitCode } = await yiniCLI([
                'validate',
                fullPath,
                '--lenient',
                '--format',
                'text',
                '--stats',
            ])

            // Assert.
            expect(exitCode).toBe(1)
            expect(stdout).toContain('✖  Validation failed')
            expect(stdout).toContain('Statistics')
            expect(stdout).toContain('Line Count:')
            expect(stdout).toContain('Section Count:')
            expect(stdout).toContain('Member Count:')
            expect(stdout).toContain('Nesting Depth:')
        })
    })

    describe('File mode with multiple file targets.', () => {
        it('3.a) Uses grouped file-mode output for multiple valid file targets.', async () => {
            // Arrange.
            const fileA = validFixture('validate-valid-basic-1.yini')
            const fileB = validFixture('validate-valid-basic-2.yini')

            // Act.
            const { stdout, stderr, exitCode } = await yiniCLI([
                'validate',
                fileA,
                fileB,
                '--lenient',
                '--format',
                'text',
            ])

            // Assert.
            expect(exitCode).toBe(0)
            expect(stdout).toContain(`OK    "${fileA}"`)
            expect(stdout).toContain(`OK    "${fileB}"`)
            expect(stdout).toContain('Mode:    lenient')
            expect(stdout).toContain('Summary:')
            expect(stderr).toBe('')
        })

        it('3.b) Uses grouped file-mode output for mixed valid and invalid file targets.', async () => {
            // Arrange.
            const fileA = validFixture('validate-valid-basic-1.yini')
            const fileB = invalidFixture('invalid-bad-comment-1.yini')

            // Act.
            const { stdout, stderr, exitCode } = await yiniCLI([
                'validate',
                fileA,
                fileB,
                '--lenient',
                '--format',
                'text',
            ])

            // Assert.
            expect(exitCode).toBe(1)
            expect(stdout).toContain(`OK    "${fileA}"`)
            expect(stdout).toContain(`FAIL  "${fileB}"`)
            expect(stdout).toContain('Mode:    lenient')
            expect(stdout).toContain('Summary:')
            expect(stderr).toContain(`"${fileB}"`)
        })

        it('3.c) Produces multi-file JSON for multiple file targets.', async () => {
            // Arrange.
            const fileA = validFixture('validate-valid-basic-1.yini')
            const fileB = invalidFixture('invalid-section-jump-1.yini')

            // Act.
            const { stdout, stderr, exitCode } = await yiniCLI([
                'validate',
                fileA,
                fileB,
                '--lenient',
                '--format',
                'json',
            ])

            // Assert.
            const parsed = JSON.parse(stdout)

            expect(exitCode).toBe(1)
            expect(stderr).toBe('')
            expect(parsed.mode).toBe('lenient')
            expect(parsed.status).toBe('failed')
            expect(parsed.summary.filesChecked).toBe(2)
            expect(parsed.summary.failedFiles).toBe(1)
            expect(Array.isArray(parsed.files)).toBe(true)
            expect(parsed.files).toHaveLength(2)
        })
    })

    describe('Directory mode.', () => {
        it('4.a) Validates one valid directory in directory mode.', async () => {
            // Arrange.
            const fullPath = VALID_DIR

            // Act.
            const { stdout, stderr, exitCode } = await yiniCLI([
                'validate',
                fullPath,
                '--lenient',
                '--format',
                'text',
            ])

            // Assert.
            expect(exitCode).toBe(0)
            expect(stdout).toContain('OK    ')
            expect(stdout).toContain('Base:    ')
            expect(stdout).toContain(`Base:    "${fullPath}"`)
            expect(stdout).toContain('Mode:    lenient')
            expect(stdout).toContain('Summary:')
            expect(stderr).toBe('')
        })

        it('4.b) Validates one invalid directory in directory mode.', async () => {
            // Arrange.
            const fullPath = INVALID_DIR

            // Act.
            const { stdout, stderr, exitCode } = await yiniCLI([
                'validate',
                fullPath,
                '--lenient',
                '--format',
                'text',
            ])

            // Assert.
            expect(exitCode).toBe(1)
            expect(stdout).toContain('FAIL  ')
            expect(stdout).toContain(`Base:    "${fullPath}"`)
            expect(stdout).toContain('Mode:    lenient')
            expect(stdout).toContain('Summary:')
            expect(stderr).not.toBe('')
        })

        it('4.c) Does not print text statistics blocks in directory mode, even when --stats is used.', async () => {
            // Arrange.
            const fullPath = VALID_DIR

            // Act.
            const { stdout, exitCode } = await yiniCLI([
                'validate',
                fullPath,
                '--lenient',
                '--format',
                'text',
                '--stats',
            ])

            // Assert.
            expect(exitCode).toBe(0)
            expect(stdout).toContain('Summary:')
            expect(stdout).not.toContain('Statistics')
        })

        it('4.d) Produces multi-file JSON in directory mode.', async () => {
            // Arrange.
            const fullPath = INVALID_DIR

            // Act.
            const { stdout, stderr, exitCode } = await yiniCLI([
                'validate',
                fullPath,
                '--lenient',
                '--format',
                'json',
            ])

            // Assert.
            const parsed = JSON.parse(stdout)

            expect(exitCode).toBe(1)
            expect(stderr).toBe('')
            expect(parsed.base).toBe(fullPath)
            expect(parsed.mode).toBe('lenient')
            expect(typeof parsed.summary.filesChecked).toBe('number')
            expect(Array.isArray(parsed.files)).toBe(true)
            expect(parsed.files.length).toBeGreaterThan(0)
        })
    })

    describe('Execution controls.', () => {
        it('5.a) Stops early with --fail-fast in directory mode.', async () => {
            // Arrange.
            const fullPath = INVALID_DIR

            // Act.
            const { stdout, exitCode } = await yiniCLI([
                'validate',
                fullPath,
                '--lenient',
                '--format',
                'text',
                '--fail-fast',
            ])

            // Assert.
            expect(exitCode).toBe(1)
            expect(stdout).toContain('Base:    ')
            expect(stdout).toContain('Summary:')
        })

        it('5.b) Stops after the configured maximum number of errors in directory mode.', async () => {
            // Arrange.
            const fullPath = INVALID_DIR

            // Act.
            const { stdout, exitCode } = await yiniCLI([
                'validate',
                fullPath,
                '--lenient',
                '--format',
                'text',
                '--max-errors',
                '1',
            ])

            // Assert.
            expect(exitCode).toBe(1)
            expect(stdout).toContain('Base:    ')
            expect(stdout).toContain('Summary:')
        })

        it('5.c) Rejects an invalid value for --max-errors.', async () => {
            // Arrange.
            const fullPath = INVALID_DIR

            // Act.
            const { stderr, exitCode } = await yiniCLI([
                'validate',
                fullPath,
                '--lenient',
                '--format',
                'text',
                '--max-errors',
                '0',
            ])

            // Assert.
            expect(exitCode).not.toBe(0)
            expect(stderr.toLowerCase()).toContain('--max-errors')
        })
    })

    describe('Input handling.', () => {
        it('6.a) Fails when the target path does not exist.', async () => {
            // Arrange.
            const fullPath = path.join(FIXTURES_DIR, 'does-not-exist')

            // Act.
            const { stderr, exitCode } = await yiniCLI([
                'validate',
                fullPath,
                '--lenient',
                '--format',
                'text',
            ])

            // Assert.
            expect(exitCode).toBe(2)
            expect(stderr).toContain('Path does not exist')
        })

        it('6.b) Does not descend into subdirectories when --no-recursive is used.', async () => {
            // Arrange.
            const fullPath = FIXTURES_DIR

            // Act.
            const { stdout, exitCode } = await yiniCLI([
                'validate',
                fullPath,
                '--lenient',
                '--format',
                'text',
                '--no-recursive',
            ])

            // Assert.
            expect(exitCode).toBe(2)
            expect(stdout).toBe('')
        })
    })
})
