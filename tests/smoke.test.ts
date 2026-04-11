/**
 * Smoke tests for basic yini CLI usage.
 */

// tests/smoke.test.ts
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { debugPrint, printObject, toJSON } from '../src/utils/print'
import { yiniCLI } from './test-helpers'

const DIR_OF_FIXTURES = 'fixtures'

describe('Smoke tests: yini CLI basic usage', () => {
    const baseDir = path.join(__dirname, DIR_OF_FIXTURES)

    const fixture = (...parts: string[]) => path.join(baseDir, ...parts)

    describe('parse command: valid lenient fixtures', () => {
        it('1. Parses a valid YINI file and prints pretty JSON by default.', async () => {
            // Arrange.
            const fullPath = fixture('lenient', 'valid', 'valid-config-1.yini')

            // Act.
            const { stdout } = await yiniCLI(`parse ${fullPath}`)
            debugPrint('Test 1 stdout:')
            printObject(stdout)

            // Assert.
            expect(stdout).toContain('    "App":')
            expect(stdout).toContain('        "title": "My App",')
            expect(stdout).toContain('"enabled": true')
        })

        it('2. Parses a valid YINI file with --js and prints a JavaScript object.', async () => {
            // Arrange.
            const fullPath = fixture('lenient', 'valid', 'valid-config-1.yini')

            // Act.
            const { stdout } = await yiniCLI(`parse ${fullPath} --js`)
            debugPrint('Test 2 stdout:')
            printObject(stdout)

            // Assert.
            expect(stdout).toContain('    App:')
            expect(stdout).toContain('title: ')
            expect(stdout).toContain('My App')
            expect(stdout).toContain('enabled: true')
        })

        it('3. Parses nested sections with --js and prints a JavaScript object.', async () => {
            // Arrange.
            const fullPath = fixture('lenient', 'valid', 'nested-config-1.yini')

            // Act.
            const { stdout } = await yiniCLI(`parse ${fullPath} --js`)
            debugPrint('Test 3 stdout:')
            printObject(stdout)

            // Assert.
            expect(stdout).toContain('    App:')
            expect(stdout).toContain("name: 'Nested'")
            expect(stdout).toContain('Database: {')
            expect(stdout).toContain("host: 'localhost'")
        })

        it('4. Parses nested sections with --json and prints pretty JSON.', async () => {
            // Arrange.
            const fullPath = fixture('lenient', 'valid', 'nested-config-1.yini')

            // Act.
            const { stdout } = await yiniCLI(`parse ${fullPath} --json`)
            debugPrint('Test 4 stdout:')
            printObject(stdout)

            // Assert.
            expect(stdout).toContain('    "App": {')
            expect(stdout).toContain('        "name": "Nested",')
            expect(stdout).toContain('        "Database": {')
            expect(stdout).toContain('            "host": "localhost"')
        })

        it('5. Parses nested sections with --compact and prints compact JSON.', async () => {
            // Arrange.
            const fullPath = fixture('lenient', 'valid', 'nested-config-1.yini')

            // Act.
            const { stdout } = await yiniCLI(`parse ${fullPath} --compact`)
            debugPrint('Test 5 stdout:')
            printObject(stdout)

            // Assert.
            expect(stdout).toContain(
                '{"App":{"name":"Nested","Database":{"host":"localhost"}}}',
            )
        })
    })

    describe('parse command: invalid lenient fixtures', () => {
        it('6. Shows an error when parsing an invalid YINI file.', async () => {
            // Arrange.
            const fullPath = fixture(
                'lenient',
                'invalid',
                'invalid-config-1.yini',
            )

            // Act.
            const { stderr, exitCode } = await yiniCLI(`parse ${fullPath}`)
            debugPrint('Test 6 stderr:')
            printObject(stderr)
            debugPrint('Test 6 exitCode:')
            printObject(exitCode)

            // Assert.
            expect(exitCode).not.toBe(0)
            expect(stderr.toLowerCase()).toContain('syntax error')
        })

        it('7. Parses a corrupt YINI file in lenient mode and recovers usable output.', async () => {
            // Arrange.
            const fullPath = fixture(
                'lenient',
                'invalid',
                'corrupt-config-1.yini',
            )

            // Act.
            const { stdout } = await yiniCLI(`parse ${fullPath} --compact`)
            debugPrint('Test 7 stdout:')
            printObject(stdout)

            // Assert.
            const jsObj = { Section: { value: 42 } }
            expect(stdout).toContain(toJSON(jsObj))
        })
    })

    describe('parse command: strict fixtures', () => {
        it.skip('8. Shows an error when parsing a invalid YINI file in strict mode.', async () => {
            // Arrange.
            const fullPath = fixture(
                'strict',
                'invalid',
                'invalid-in-strict-mode-1.yini',
            )

            // Act.
            const { stderr, exitCode } = await yiniCLI(
                `parse ${fullPath} --strict`,
            )
            debugPrint('Test 8 stderr:')
            printObject(stderr)
            debugPrint('Test 8 exitCode:')
            printObject(exitCode)

            // Assert.
            expect(exitCode).not.toBe(0)
            expect(stderr.toLowerCase()).toContain('syntax error')
        })
    })
})
