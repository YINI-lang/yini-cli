import fs from 'node:fs'
import path from 'node:path'
import { execa } from 'execa'
import { describe, expect, it } from 'vitest'
import { debugPrint, printObject } from '../src/utils/print'

// const CLI_PATH = path.resolve('src/index.ts')
const DIR_OF_FIXTURES = 'tests/fixtures/'

/**
 * @param argsLine A line of arguments (command and options) to pass to yini
 * (yini-cli) on execution in CLI.
 * @returns
 */
const yiniCLI = (argsLine: string) =>
    execa('tsx', ['src/index.ts', ...argsLine.split(' ')], { reject: false })

describe('Test yini CLI basic usage:', () => {
    const baseDir = path.join(__dirname, DIR_OF_FIXTURES)

    it('Parses a valid YINI file.', async () => {
        // Arrange.
        // const file = path.resolve('tests/fixtures/valid-config.yini')
        const fileName = 'valid-config.yini'
        const fullPath = path.join(baseDir, fileName)

        // Act.
        // Here, execa(..) is used to run CLI script (like tsx src/index.ts myfile.yini),
        // and to capture stdout, stderr, exitCode, etc.
        const { stdout } = await yiniCLI(`parse ${fullPath}`)
        debugPrint('stdout:')
        printObject(stdout)

        // Assert.
        expect(stdout).toContain('"title": "My App"')
        expect(stdout).toContain('"enabled": true')
    })

    it('Parses nested sections correctly.', async () => {
        const file = path.resolve('tests/fixtures/nested-config.yini')

        const { stdout } = await yiniCLI(`parse ${file}`)
        debugPrint('stdout:')
        printObject(stdout)

        expect(stdout).toContain('"name": "Nested"')
        expect(stdout).toContain('"host": "localhost"')
    })

    it('Shows error on invalid YINI.', async () => {
        const file = path.resolve('tests/fixtures/invalid-config.yini')

        const { stderr, exitCode } = await yiniCLI(`parse ${file}`)
        debugPrint('stderr:')
        printObject(stderr)
        debugPrint('exitCode:')
        printObject(exitCode)

        expect(exitCode).not.toBe(0)
        expect(stderr).toContain('Error') // customize based on your CLI error output
    })
})
