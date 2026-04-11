// tests/command-parse/command-parse-strict.test.ts
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { debugPrint, printObject } from '../../src/utils/print'
import { yiniCLI } from '../test-helpers'

const FIXTURES_DIR = path.join(__dirname, '../fixtures/parse')

const strictValid = (...parts: string[]) =>
    path.join(FIXTURES_DIR, 'strict', 'valid', ...parts)

const strictInvalid = (...parts: string[]) =>
    path.join(FIXTURES_DIR, 'strict', 'invalid', ...parts)

describe('parse command - strict mode', () => {
    //@todo Enable when can eval strings with escapes correctly, especially \\ -> \
    it.skip('1.a) Have correct output when using the command "parse" with option --strict.', async () => {
        // Arrange.
        const fullPath = strictValid('strict-common-config-1.yini')

        // Act.
        const { stdout } = await yiniCLI(['parse', fullPath, '--strict'])
        debugPrint('stdout:')
        printObject(stdout)

        // Assert.
        const correct = `{
  MyPrefs: {
    HomeDir: 'C:\\Users\\John Smith\\',
    Buffers: 10,
    IsNight: false,
    KeyWords: [ 'Orange', 'Banana', 'Pear', 'Peach' ]
  }
}`
        expect(stdout).toContain(correct)
    })

    it('1.b) [strict] Have correct output when using the command "parse" with option --strict.', async () => {
        // Arrange.
        const fullPath = strictValid('strict-common-config-2.yini')

        // Act.
        const { stdout } = await yiniCLI(['parse', fullPath, '--strict'])
        debugPrint('stdout:')
        printObject(stdout)

        // Assert.
        const correct = `{
    "App": {
        "Window": {
            "title": "Sample Window",
            "id": "window_main"
        },
        "Image": {
            "src": "gfx/bg.png",
            "id": "bg1",
            "isCentered": true
        },
        "Text": {
            "content": "Click here!",
            "id": "text1",
            "isCentered": true,
            "url": "images/",
            "styles": [
                [
                    "font-weight",
                    "bold"
                ],
                [
                    "size",
                    36
                ],
                [
                    "font",
                    "arial"
                ]
            ]
        }
    }
}`
        expect(stdout).toContain(correct)
    })

    it('1.c) [strict] Corrupt result should NOT match output when using the command "parse" with option --strict.', async () => {
        // Arrange.
        const fullPath = strictValid('strict-common-config-2.yini')

        // Act.
        const { stdout } = await yiniCLI(['parse', fullPath, '--strict'])
        debugPrint('stdout:')
        printObject(stdout)

        // Assert.
        const corruptObj = `XXXX{
  window: { title: 'Sample Window', id: 'window_main' },
  image: { src: 'gfx/bg.png', id: 'bg1', isCentered: true },
  text: {
    content: 'Click here!',
    id: 'text1',
    isCentered: true,
    url: 'images/',
    styles: [ [ 'font-weight', 'bold' ], [ 'size', 36 ], [ 'font', 'arial' ] ]
  }
}`
        expect(stdout).not.toContain(corruptObj)
    })

    it('2.a) [strict] Should fail when parsing an invalid strict-mode file.', async () => {
        // Arrange.
        const fullPath = strictInvalid('invalid-in-strict-mode-1.yini')

        // Act.
        const { exitCode } = await yiniCLI(['parse', fullPath, '--strict'])

        // Assert.
        expect(exitCode).toBe(1)
    })

    it('2.b) [strict] Should fail when parsing an invalid strict-mode file (missing /END).', async () => {
        // Arrange.
        const fullPath = strictInvalid('invalid-in-strict-mode-2.yini')

        // Act.
        const { exitCode } = await yiniCLI(['parse', fullPath, '--strict'])

        // Assert.
        expect(exitCode).toBe(1)
    })

    it('2.c) [strict] Should fail when parsing a strict file with incorrect section name.', async () => {
        // Arrange.
        const fullPath = strictInvalid('incorrect-section-name-strict-1.yini')

        // Act.
        const { exitCode } = await yiniCLI(['parse', fullPath, '--strict'])

        // Assert.
        expect(exitCode).toBe(1)
    })

    it('2.d) [strict] Should fail when parsing another strict file with incorrect section name.', async () => {
        // Arrange.
        const fullPath = strictInvalid('incorrect-section-name-strict-2.yini')

        // Act.
        const { exitCode } = await yiniCLI(['parse', fullPath, '--strict'])

        // Assert.
        expect(exitCode).toBe(1)
    })
})
