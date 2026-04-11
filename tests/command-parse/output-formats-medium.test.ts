// tests/command-parse/output-formats-medium.test.ts
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import YAML from 'yaml'
import { yiniCLI } from '../test-helpers'

const FIXTURE = path.join(
    __dirname,
    '../fixtures/lenient/valid/medium-config.yini',
)

const expected = {
    App: {
        name: 'Demo',
        version: '1.0.0',
        features: ['search', 'dark-mode'],
        Database: {
            host: 'localhost',
            port: 5432,
            auth: {
                user: 'admin',
                pass: 'secret',
            },
        },
    },
}

describe('CLI parse command: medium output formats', () => {
    describe('JSON output', () => {
        it('1) Outputs formatted JSON with --json', async () => {
            // Arrange.
            const command = `parse ${FIXTURE} --json`

            // Act.
            const { stdout, exitCode } = await yiniCLI(command)
            const parsed = JSON.parse(stdout)

            // Assert.
            expect(exitCode).toBe(0)
            expect(parsed).toEqual(expected)
        })

        it('2) Outputs compact JSON with --compact', async () => {
            // Arrange.
            const command = `parse ${FIXTURE} --compact`

            // Act.
            const { stdout, exitCode } = await yiniCLI(command)
            const parsed = JSON.parse(stdout)

            // Assert.
            expect(exitCode).toBe(0)
            expect(parsed).toEqual(expected)
        })
    })

    describe('JavaScript output', () => {
        it('3) Outputs JavaScript with --js', async () => {
            // Arrange.
            const command = `parse ${FIXTURE} --js`

            // Act.
            const { stdout, exitCode } = await yiniCLI(command)
            const parsed = eval(`(${stdout})`)

            // Assert.
            expect(exitCode).toBe(0)
            expect(parsed).toEqual(expected)
        })
    })

    describe('YAML output', () => {
        it('4) Outputs YAML with --yaml', async () => {
            // Arrange.
            const command = `parse ${FIXTURE} --yaml`

            // Act.
            const { stdout, exitCode } = await yiniCLI(command)
            const parsed = YAML.parse(stdout)

            // Assert.
            expect(exitCode).toBe(0)
            expect(parsed).toEqual(expected)
        })
    })

    describe('XML output', () => {
        it('5) Outputs XML with --xml', async () => {
            // Arrange.
            const command = `parse ${FIXTURE} --xml`

            // Act.
            const { stdout, exitCode } = await yiniCLI(command)

            // Assert.
            expect(exitCode).toBe(0)
            expect(stdout).toContain('<yini>')
            expect(stdout).toContain('<App>')
            expect(stdout).toContain('<name>Demo</name>')
            expect(stdout).toContain('<version>1.0.0</version>')
            expect(stdout).toContain('<Database>')
            expect(stdout).toContain('<host>localhost</host>')
            expect(stdout).toContain('<port>5432</port>')
            expect(stdout).toContain('<user>admin</user>')
            expect(stdout).toContain('<pass>secret</pass>')
            expect(stdout).toContain('</Database>')
            expect(stdout).toContain('</App>')
            expect(stdout).toContain('</yini>')
        })
    })
})
