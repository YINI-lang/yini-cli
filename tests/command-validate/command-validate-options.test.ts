import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { yiniCLI } from '../test-helpers'

const FIXTURES_DIR = path.resolve(__dirname, '../fixtures/validate')
const VALID_FILE = path.join(
    FIXTURES_DIR,
    'lenient/valid/validate-valid-basic-1.yini',
)
const INVALID_FILE = path.join(
    FIXTURES_DIR,
    'lenient/invalid/invalid-garbage-1.yini',
)
const WARNING_FILE = path.join(
    FIXTURES_DIR,
    'lenient/warnings/warning-duplicate-key-1.yini',
)
const INVALID_DIR = path.join(FIXTURES_DIR, 'strict/invalid')
const TEMP_DIR = path.resolve(__dirname, '../temp')

const createWarningDirectory = (): string => {
    const directory = fs.mkdtempSync(path.join(TEMP_DIR, 'warning-policy-'))

    for (const name of ['a.yini', 'b.yini', 'c.yini']) {
        fs.copyFileSync(WARNING_FILE, path.join(directory, name))
    }

    return directory
}

describe('Validate command policies and controls.', () => {
    it('reports warning-only input as passed-with-warnings.', async () => {
        const { stdout, stderr, exitCode } = await yiniCLI([
            'validate',
            WARNING_FILE,
            '--format',
            'json',
        ])
        const report = JSON.parse(stdout)

        expect(exitCode).toBe(0)
        expect(stderr).toBe('')
        expect(report.status).toBe('passed-with-warnings')
        expect(report.summary).toMatchObject({ errors: 0, warnings: 1 })
        expect(report.issues).toEqual([
            expect.objectContaining({
                severity: 'warning',
                code: 'SYNTAX_WARNING',
                location: { line: 5, column: 1 },
            }),
        ])
    })

    it('treats warnings as errors without changing their severity.', async () => {
        const { stdout, stderr, exitCode } = await yiniCLI([
            'validate',
            WARNING_FILE,
            '--format',
            'json',
            '--warnings-as-errors',
        ])
        const report = JSON.parse(stdout)

        expect(exitCode).toBe(1)
        expect(stderr).toBe('')
        expect(report.status).toBe('failed')
        expect(report.summary).toMatchObject({ errors: 0, warnings: 1 })
        expect(report.issues[0].severity).toBe('warning')
    })

    it('aggregates warning failures in directory JSON output.', async () => {
        const warningsDir = createWarningDirectory()

        try {
            const { stdout, stderr, exitCode } = await yiniCLI([
                'validate',
                warningsDir,
                '--format',
                'json',
                '--warnings-as-errors',
            ])
            const report = JSON.parse(stdout)

            expect(exitCode).toBe(1)
            expect(stderr).toBe('')
            expect(report.status).toBe('failed')
            expect(report.summary).toMatchObject({
                filesChecked: 3,
                failedFiles: 3,
                errors: 0,
                warnings: 3,
            })
            expect(
                report.files.every(
                    (file: { issues: Array<{ severity: string }> }) =>
                        file.issues.every(
                            (issue) => issue.severity === 'warning',
                        ),
                ),
            ).toBe(true)
        } finally {
            fs.rmSync(warningsDir, { recursive: true, force: true })
        }
    })

    it('stops on the first warning failure with --fail-fast.', async () => {
        const warningsDir = createWarningDirectory()

        try {
            const { stdout, exitCode } = await yiniCLI([
                'validate',
                warningsDir,
                '--format',
                'json',
                '--warnings-as-errors',
                '--fail-fast',
            ])
            const report = JSON.parse(stdout)

            expect(exitCode).toBe(1)
            expect(report.summary.filesChecked).toBe(1)
            expect(report.summary.failedFiles).toBe(1)
            expect(report.summary).toMatchObject({ errors: 0, warnings: 1 })
            expect(report.files).toHaveLength(1)
        } finally {
            fs.rmSync(warningsDir, { recursive: true, force: true })
        }
    })

    it('suppresses all validation output in silent mode.', async () => {
        const { stdout, stderr, exitCode } = await yiniCLI([
            'validate',
            INVALID_FILE,
            '--silent',
        ])

        expect(exitCode).toBe(1)
        expect(stdout).toBe('')
        expect(stderr).toBe('')
    })

    it('suppresses runtime errors in silent mode.', async () => {
        const missingFile = path.join(FIXTURES_DIR, 'missing.yini')
        const { stdout, stderr, exitCode } = await yiniCLI([
            'validate',
            missingFile,
            '--silent',
        ])

        expect(exitCode).toBe(2)
        expect(stdout).toBe('')
        expect(stderr).toBe('')
    })

    it('suppresses successful per-file lines in quiet mode.', async () => {
        const { stdout, stderr, exitCode } = await yiniCLI([
            'validate',
            VALID_FILE,
            INVALID_FILE,
            '--quiet',
        ])

        expect(exitCode).toBe(1)
        expect(stdout).not.toContain(`OK    "${VALID_FILE}"`)
        expect(stdout).toContain(`FAIL  "${INVALID_FILE}"`)
        expect(stdout).toContain('Summary: 2 checked, 1 failed')
        expect(stderr).toContain(`"${INVALID_FILE}"`)
    })

    it('rejects --strict and --lenient together as a usage error.', async () => {
        const { stdout, stderr, exitCode } = await yiniCLI([
            'validate',
            VALID_FILE,
            '--strict',
            '--lenient',
        ])

        expect(exitCode).toBe(2)
        expect(stdout).toBe('')
        expect(stderr).toContain(
            '--strict and --lenient cannot be used together',
        )
    })

    it.each(['1junk', '1.5', 'NaN', 'Infinity', '-1', '0'])(
        'rejects invalid --max-errors value %s.',
        async (value) => {
            const { stderr, exitCode } = await yiniCLI([
                'validate',
                VALID_FILE,
                '--max-errors',
                value,
            ])

            expect(exitCode).not.toBe(0)
            expect(stderr).toContain('--max-errors must be a positive integer')
        },
    )

    it('stops after the first failed file with --fail-fast.', async () => {
        const { stdout, exitCode } = await yiniCLI([
            'validate',
            INVALID_DIR,
            '--strict',
            '--format',
            'json',
            '--fail-fast',
        ])
        const report = JSON.parse(stdout)

        expect(exitCode).toBe(1)
        expect(report.summary.filesChecked).toBe(1)
        expect(report.files).toHaveLength(1)
        expect(report.files[0].status).toBe('failed')
    })

    it('stops once --max-errors is reached.', async () => {
        const { stdout, exitCode } = await yiniCLI([
            'validate',
            INVALID_DIR,
            '--strict',
            '--format',
            'json',
            '--max-errors',
            '1',
        ])
        const report = JSON.parse(stdout)

        expect(exitCode).toBe(1)
        expect(report.summary.filesChecked).toBe(1)
        expect(report.summary.errors).toBeGreaterThanOrEqual(1)
        expect(report.files).toHaveLength(1)
    })

    it('includes JSON statistics only when requested.', async () => {
        const withoutStats = await yiniCLI([
            'validate',
            VALID_FILE,
            '--format',
            'json',
        ])
        const withStats = await yiniCLI([
            'validate',
            VALID_FILE,
            '--format',
            'json',
            '--stats',
        ])

        expect(JSON.parse(withoutStats.stdout)).not.toHaveProperty('stats')
        expect(JSON.parse(withStats.stdout).stats).toEqual(
            expect.objectContaining({
                lineCount: expect.any(Number),
                byteSize: expect.any(Number),
                sectionCount: expect.any(Number),
                memberCount: expect.any(Number),
                nestingDepth: expect.any(Number),
                hasYiniMarker: expect.any(Boolean),
                hasDocumentTerminator: expect.any(Boolean),
            }),
        )
    })
})
