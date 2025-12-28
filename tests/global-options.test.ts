/**
 * General Tests.
 */

import { createRequire } from 'module'
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { descriptions as descripts } from '../src/descriptions.js'
import {
    debugPrint,
    printObject,
    toJSON,
    toPrettyJSON,
} from '../src/utils/print.js'
import { yiniCLI } from './test-helpers.js'

const require = createRequire(import.meta.url)
const pkg = require('../package.json')

const DIR_OF_FIXTURES = 'fixtures/'

describe('Test main (global) options in yini CLI:', () => {
    const baseDir = path.join(__dirname, DIR_OF_FIXTURES)

    /*
     * Note: --version and -V are generated automatically by Commander.
     */
    it('1.a) The yini option "--version" correctly outputs version.', async () => {
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

    /*
     * Note: --version and -V are generated automatically by Commander.
     */
    it('1.b) The yini option "-v" (lowercase) correctly outputs version.', async () => {
        // Arrange and Act.
        const { stdout } = await yiniCLI(`-v`)
        debugPrint('Test: 1:')
        debugPrint('stdout:')
        printObject(stdout)

        // Assert.
        expect(stdout.trim()).equal(pkg.version)
    })

    /*
     * Note: --help and -h are generated automatically by Commander.
     */
    it('2.a) The yini option "--help" correctly outputs help/usage message.', async () => {
        // Arrange and Act.
        const { stdout } = await yiniCLI(`--help`)
        debugPrint('Test: 1:')
        debugPrint('stdout:')
        printObject(stdout)

        // Assert.
        // expect(stdout).contain(descripts.yini)
        expect(stdout).contain('YINI')
        expect(stdout).contain(descripts['For-command-info'])
        expect(stdout).contain(descripts['For-command-parse'])
        expect(stdout).contain(descripts['For-command-validate'])
    })

    /*
     * Note: --help and -h are generated automatically by Commander.
     */
    it('2.b) The yini option "-h" correctly outputs help/usage message.', async () => {
        // Arrange and Act.
        const { stdout } = await yiniCLI(`-h`)
        debugPrint('Test: 1:')
        debugPrint('stdout:')
        printObject(stdout)

        // Assert.
        // expect(stdout).contain(descripts.yini)
        expect(stdout).contain('YINI')
        expect(stdout).contain(descripts['For-command-info'])
        expect(stdout).contain(descripts['For-command-parse'])
        expect(stdout).contain(descripts['For-command-validate'])
    })
})
