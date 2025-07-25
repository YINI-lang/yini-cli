import fs from 'node:fs'
import path from 'node:path'
import { execa } from 'execa'
import { describe, expect, it } from 'vitest'

const CLI_PATH = path.resolve('src/index.ts')

/**
 * @param argsLine A line of arguments (command and options) to pass to yini
 * (yini-cli) on execution in CLI.
 * @returns
 */
const yiniCLI = (argsLine: string) =>
    execa('tsx', ['src/index.ts', ...argsLine.split(' ')], { reject: false })

describe('Test yini CLI basic usage:', () => {
    it('Parses a valid YINI file.', async () => {
        const file = path.resolve('tests/fixtures/valid-config.yini')

        // Here, execa(..) is used to run CLI script (like tsx src/index.ts myfile.yini),
        // and to capture stdout, stderr, exitCode, etc.
        const { stdout } = await yiniCLI(`parse ${file}`)

        expect(stdout).toContain('"title": "My App"')
        expect(stdout).toContain('"enabled": true')
    })

    it('Parses nested sections correctly.', async () => {
        const file = path.resolve('tests/fixtures/nested-config.yini')
        const { stdout } = await yiniCLI(`parse ${file}`)
        expect(stdout).toContain('"name": "Nested"')
        expect(stdout).toContain('"host": "localhost"')
    })

    it('Shows error on invalid YINI.', async () => {
        const file = path.resolve('tests/fixtures/invalid-config.yini')
        const { stderr, exitCode } = await yiniCLI(`parse ${file}`)
        expect(exitCode).not.toBe(0)
        expect(stderr).toContain('Error') // customize based on your CLI error output
    })
})
