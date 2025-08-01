/**
 * General Tests.
 */
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import pkg from '../package.json'
import {
    debugPrint,
    printObject,
    toJSON,
    toPrettyJSON,
} from '../src/utils/print'
import { yiniCLI } from './test-helpers'

const DIR_OF_FIXTURES = 'fixtures/'

describe('Test general yini CLI usage:', () => {
    const baseDir = path.join(__dirname, DIR_OF_FIXTURES)

    it('1. The yini command "--version" correctly outputs version.', async () => {
        // Arrange.
        // const fileName = 'valid-config-1.yini'
        // const fullPath = path.join(baseDir, fileName)

        // Arrange and Act.
        // Here, execa(..) is used to run CLI script (like tsx src/index.ts myfile.yini),
        // and to capture stdout, stderr, exitCode, etc.
        //const { stdout } = await yiniCLI(`parse ${fullPath}`)
        const { stdout } = await yiniCLI(`--version`)
        debugPrint('Test: 1:')
        debugPrint('stdout:')
        printObject(stdout)

        // Assert.
        //expect(stdout).toContain('{ App:')
        expect(stdout.trim()).equal(pkg.version)
    })

    it('2. The yini command "-V" (uppecase) correctly outputs version.', async () => {
        // Arrange and Act.
        const { stdout } = await yiniCLI(`-V`)
        debugPrint('Test: 1:')
        debugPrint('stdout:')
        printObject(stdout)

        // Assert.
        expect(stdout.trim()).equal(pkg.version)
    })
})
