// tests/command-validate/command-check-alias.test.ts
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { yiniCLI } from '../test-helpers'

const FIXTURES_DIR = path.resolve(__dirname, '../fixtures/validate/lenient')
const VALID_DIR = path.join(FIXTURES_DIR, 'valid')
const INVALID_DIR = path.join(FIXTURES_DIR, 'invalid')

const validFixture = (fileName: string) => path.join(VALID_DIR, fileName)
const invalidFixture = (fileName: string) => path.join(INVALID_DIR, fileName)

describe('Check command alias.', () => {
    it('validates one valid file successfully.', async () => {
        // Arrange.
        const fullPath = validFixture('validate-valid-basic-1.yini')

        // Act.
        const { stdout, stderr, exitCode } = await yiniCLI([
            'check',
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
    })

    it('fails for one invalid file.', async () => {
        // Arrange.
        const fullPath = invalidFixture('invalid-garbage-1.yini')

        // Act.
        const { stdout, stderr, exitCode } = await yiniCLI([
            'check',
            fullPath,
            '--lenient',
            '--format',
            'text',
        ])

        // Assert.
        expect(exitCode).toBe(1)
        expect(stdout).toContain('Validation failed')
        expect(stdout).toContain(`File:     "${fullPath}"`)
        expect(stderr).toContain(`"${fullPath}"`)
    })

    it('shows validate command help.', async () => {
        // Act.
        const { stdout, stderr, exitCode } = await yiniCLI(['check', '--help'])

        // Assert.
        expect(exitCode).toBe(0)
        expect(stderr).toBe('')
        expect(stdout).toContain('Usage: yini validate|check')
        expect(stdout).toContain('--warnings-as-errors')
        expect(stdout).toContain('--format <type>')
    })
})
