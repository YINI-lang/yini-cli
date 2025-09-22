/**
 * Smoke Tests.
 */

import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
    debugPrint,
    printObject,
    toJSON,
    toPrettyJSON,
} from '../src/utils/print'
import { yiniCLI } from './test-helpers'

const DIR_OF_FIXTURES = 'fixtures/'

describe('Smoke test yini CLI basic usage:', () => {
    const baseDir = path.join(__dirname, DIR_OF_FIXTURES)

    it('1. Parses (command "parse") a valid YINI file and print as JS object.', async () => {
        // Arrange.
        const fileName = 'valid-config-1.yini'
        const fullPath = path.join(baseDir, fileName)

        // Act.
        // Here, execa(..) is used to run CLI script (like tsx src/index.ts myfile.yini),
        // and to capture stdout, stderr, exitCode, etc.
        const { stdout } = await yiniCLI(`parse ${fullPath}`)
        debugPrint('Test: 1:')
        debugPrint('stdout:')
        printObject(stdout)

        // Assert.
        expect(stdout).toContain('{ App:')
        expect(stdout).toContain('title: ')
        expect(stdout).toContain('My App')
        expect(stdout).toContain('enabled: true')
    })

    it('2. Parses (command "parse") nested sections and print as JS object.', async () => {
        // Arrange.
        const fileName = 'nested-config-1.yini'
        const fullPath = path.join(baseDir, fileName)

        // Act.
        const { stdout } = await yiniCLI(`parse ${fullPath}`)
        debugPrint('Test: 2:')
        debugPrint('stdout:')
        printObject(stdout)

        // Assert.
        expect(stdout).toContain('{ App:')
        expect(stdout).toContain("name: 'Nested'")
        expect(stdout).toContain('Database: {')
        expect(stdout).toContain("host: 'localhost'")
    })

    it('3. Shows error on parsing (command "parse") an invalid YINI (containing some garbage).', async () => {
        // Arrange.
        const fileName = 'invalid/invalid-config-1.yini'
        const fullPath = path.join(baseDir, fileName)

        // Act.
        const { stderr, exitCode } = await yiniCLI(`parse ${fullPath}`)
        debugPrint('Test: 3:')
        debugPrint('stderr:')
        printObject(stderr)
        debugPrint('exitCode:')
        printObject(exitCode)

        // Assert.
        expect(exitCode).not.toBe(0)
        expect(stderr.toLowerCase()).toContain('syntax error')
    })

    it('4. Parse (command "parse", with "--pretty") and print as pretty JSON.', async () => {
        // Arrange.
        const fileName = 'nested-config-1.yini'
        const fullPath = path.join(baseDir, fileName)

        // Act.
        const { stdout } = await yiniCLI(`parse ${fullPath} --pretty`)
        debugPrint('Test: 2:')
        debugPrint('stdout:')
        printObject(stdout)

        // Assert.
        expect(stdout).toContain('    "App": {')
        expect(stdout).toContain('        "name": "Nested",')
        expect(stdout).toContain('        "Database": {')
        expect(stdout).toContain('            "host": "localhost"')
    })

    it('5. Parse (command "parse", with "--json") and print as JSON string.', async () => {
        // Arrange.
        const fileName = 'nested-config-1.yini'
        const fullPath = path.join(baseDir, fileName)

        // Act.
        const { stdout } = await yiniCLI(`parse ${fullPath} --json`)
        debugPrint('Test: 2:')
        debugPrint('stdout:')
        printObject(stdout)

        // Assert.
        expect(stdout).toContain(
            '{"App":{"name":"Nested","Database":{"host":"localhost"}}}',
        )
    })

    it('6.a. Should pass parsing (command "parse", with "--json") a corrupt YINI in lenient (default) mode.', async () => {
        // Arrange.
        const fileName = 'invalid/corrupt-config-1.yini'
        const fullPath = path.join(baseDir, fileName)

        // Act.
        const { stdout } = await yiniCLI(`parse ${fullPath} --json`)
        debugPrint('Test: 6.a:')
        debugPrint('stdout:')
        printObject(stdout)

        // Assert.
        const jsObj = { Section: { value: 42 } }
        expect(stdout).toContain(toJSON(jsObj))
    })

    it.skip('6.b. Show error on corrupt YINI in strict-mode.', async () => {
        // Arrange.
        const fileName = 'corrupt-config-1.yini'
        const fullPath = path.join(baseDir, fileName)

        // Act.
        const { stderr, exitCode } = await yiniCLI(`parse ${fullPath} strict`)
        debugPrint('Test: 6.b:')
        debugPrint('stderr:')
        printObject(stderr)
        debugPrint('exitCode:')
        printObject(exitCode)

        // Assert.
        expect(exitCode).not.toBe(0)
        expect(stderr.toLowerCase()).toContain('syntax error')
    })
})
