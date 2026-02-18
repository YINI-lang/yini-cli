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

describe('Test parse command usage:', () => {
    const baseDir = path.join(__dirname, DIR_OF_FIXTURES)

    it('1.a) Have correct output when using the command "parse" **with no options** to be pretty JSON.', async () => {
        // Arrange.
        const fileName = 'valid-config-1.yini'
        const fullPath = path.join(baseDir, fileName)

        // Act.
        // Here, execa(..) is used to run CLI script (like tsx src/index.ts myfile.yini),
        // and to capture stdout, stderr, exitCode, etc.
        const { stdout } = await yiniCLI(`parse ${fullPath}`)
        debugPrint('stdout:')
        printObject(stdout)

        // Assert.
        // const correctObj = {

        expect(stdout).toContain(`{
    "App": {
        "title": "My App",
        "enabled": true
    }
}`)
    })

    it('1.b) Have correct output when using the command "parse" **with no options**.', async () => {
        // Arrange.
        const fileName = 'valid-config-3.yini'
        const fullPath = path.join(baseDir, fileName)

        // Act.
        // Here, execa(..) is used to run CLI script (like tsx src/index.ts myfile.yini),
        // and to capture stdout, stderr, exitCode, etc.
        const { stdout } = await yiniCLI(`parse ${fullPath}`)
        debugPrint('stdout:')
        printObject(stdout)

        // Assert.
        const correct: string = `{
    "App": {
        "name": "ExampleApp Web",
        "version": "1.2.3",
        "debug": false,
        "Logging": {
            "level": "info",
            "file": "logs/app.log",
            "maxSize": 1048576
        },
        "Database": {
            "type": "postgres",
            "host": "db.example.com",
            "port": 5432,
            "username": "some_user",
            "password": "s3cret",
            "poolSize": 10,
            "Options": {
                "ssl": true,
                "connectionTimeout": 30
            }
        },
        "Features": {
            "enableSignup": true,
            "betaBanner": false
        }
    },
    "Env": {
        "NODE_ENV": "production",
        "TIMEZONE": "Europe/Gothenburg"
    }
}`
        expect(stdout).toContain(correct)
    })

    it('1.c) Corrupt result should NOT match output when using the command "parse" **with no options**.', async () => {
        // Arrange.
        const fileName = 'valid-config-3.yini'
        const fullPath = path.join(baseDir, fileName)

        // Act.
        // Here, execa(..) is used to run CLI script (like tsx src/index.ts myfile.yini),
        // and to capture stdout, stderr, exitCode, etc.
        const { stdout } = await yiniCLI(`parse ${fullPath}`)
        debugPrint('stdout:')
        printObject(stdout)

        // Assert.
        // NOTE: Below has been tampered with purpose!
        const corruptResult: string = `{
  App: {
    name: 'ExampleApp Web',
    version: '1.2.3',
    debug: true,
    Logging: { level: 'info', file: 'logs/app.log', maxSize: 1048576 },
    Database: {
      type: 'postgres',
      host: 'db.example.com',
      port: 5432,
      username: 'some_user',
      password: 's3cret',
      poolSize: 10,
      Options: { ssl: true, connectionTimeout: 30 }
    },
    Features: { enableSignup: true, betaBanner: false }
  },
  Env: { NODE_ENV: 'production', TIMEZONE: 'Europe/Gothenburg' }
}`
        expect(stdout).not.toContain(corruptResult)
    })

    //@todo Enable when can eval strings with escapes correctly, especially \\ -> \
    it.skip('SKIPPED: 2.a) Have correct output when using the command "parse" **with option --strict**.', async () => {
        // Arrange.
        const fileName = 'strict/strict-common-config-1.yini'
        const fullPath = path.join(baseDir, fileName)

        // Act.
        // Here, execa(..) is used to run CLI script (like tsx src/index.ts myfile.yini),
        // and to capture stdout, stderr, exitCode, etc.
        const { stdout } = await yiniCLI(`parse ${fullPath} --strict`)
        debugPrint('stdout:')
        printObject(stdout)

        // Assert.
        const correct: string = `{
  MyPrefs: {
    HomeDir: 'C:\\Users\\John Smith\\',
    Buffers: 10,
    IsNight: false,
    KeyWords: [ 'Orange', 'Banana', 'Pear', 'Peach' ]
  }
}`
        expect(stdout).toContain(correct)
    })

    it('2.b) Have correct output when using the command "parse" **with option --strict**.', async () => {
        // Arrange.
        const fileName = 'strict/strict-common-config-2.yini'
        const fullPath = path.join(baseDir, fileName)

        // Act.
        // Here, execa(..) is used to run CLI script (like tsx src/index.ts myfile.yini),
        // and to capture stdout, stderr, exitCode, etc.
        const { stdout } = await yiniCLI(`parse ${fullPath} --strict`)
        debugPrint('stdout:')
        printObject(stdout)

        // Assert.
        const correct: string = `{
    "window": {
        "title": "Sample Window",
        "id": "window_main"
    },
    "image": {
        "src": "gfx/bg.png",
        "id": "bg1",
        "isCentered": true
    },
    "text": {
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
}`
        expect(stdout).toContain(correct)
    })

    it('2.c) Corrupt result should NOT match output when using the command "parse" **with option --strict**.', async () => {
        // Arrange.
        const fileName = 'strict/strict-common-config-2.yini'
        const fullPath = path.join(baseDir, fileName)

        // Act.
        // Here, execa(..) is used to run CLI script (like tsx src/index.ts myfile.yini),
        // and to capture stdout, stderr, exitCode, etc.
        const { stdout } = await yiniCLI(`parse ${fullPath} --strict`)
        debugPrint('stdout:')
        printObject(stdout)

        // Assert.
        // NOTE: Below has been tampered with purpose!
        const corruptObj: string = `XXXX{
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

    // --json         Pretty-print output as JSON.
    it('3.a) Have correct output when using the command "parse" **with option --json**.', async () => {
        // Arrange.
        const fileName = 'valid-config-1.yini'
        const fullPath = path.join(baseDir, fileName)

        // Act.
        // Here, execa(..) is used to run CLI script (like tsx src/index.ts myfile.yini),
        // and to capture stdout, stderr, exitCode, etc.
        const { stdout } = await yiniCLI(`parse ${fullPath} --json`)
        debugPrint('stdout:')
        printObject(stdout)

        // Assert.
        const correctObj = {
            App: {
                title: 'My App',
                enabled: true,
            },
        }
        expect(toPrettyJSON(JSON.parse(stdout))).toContain(
            toPrettyJSON(correctObj),
        )
    })

    // --json         Pretty-print output as JSON.
    it('3.b) Have correct output when using the command "parse" **with option --json**.', async () => {
        // Arrange.
        const fileName = 'valid-config-3.yini'
        const fullPath = path.join(baseDir, fileName)

        // Act.
        // Here, execa(..) is used to run CLI script (like tsx src/index.ts myfile.yini),
        // and to capture stdout, stderr, exitCode, etc.
        const { stdout } = await yiniCLI(`parse ${fullPath} --json`)
        debugPrint('stdout:')
        printObject(stdout)

        // Assert.
        const correctObj = {
            App: {
                name: 'ExampleApp Web',
                version: '1.2.3',
                debug: false,
                Logging: {
                    level: 'info',
                    file: 'logs/app.log',
                    maxSize: 1048576,
                },
                Database: {
                    type: 'postgres',
                    host: 'db.example.com',
                    port: 5432,
                    username: 'some_user',
                    password: 's3cret',
                    poolSize: 10,
                    Options: { ssl: true, connectionTimeout: 30 },
                },
                Features: { enableSignup: true, betaBanner: false },
            },
            Env: { NODE_ENV: 'production', TIMEZONE: 'Europe/Gothenburg' },
        }
        expect(toPrettyJSON(JSON.parse(stdout))).toContain(
            toPrettyJSON(correctObj),
        )
    })

    // --json         Pretty-print output as JSON.
    it('3.c) Corrupt result should NOT match output when using the command "parse" **with option --json**.', async () => {
        // Arrange.
        const fileName = 'valid-config-3.yini'
        const fullPath = path.join(baseDir, fileName)

        // Act.
        // Here, execa(..) is used to run CLI script (like tsx src/index.ts myfile.yini),
        // and to capture stdout, stderr, exitCode, etc.
        const { stdout } = await yiniCLI(`parse ${fullPath} --json`)
        debugPrint('stdout:')
        printObject(stdout)

        // Assert.
        const corruptObj = {
            App: {
                name: 'ExampleApp Web',
                version: '1.2.3',
                debug: false,
                Logging: {
                    level: 'info',
                    file: 'logs/app.log',
                    maxSize: 1048576,
                },
                // NOTE: Below has been tampered with purpose!
                Database: {
                    type: 'postgres',
                    host: 'db.example.com',
                    port: 5432,
                    username: 'some_user',
                    password: '****',
                    Options: { ssl: true, connectionTimeout: 30 },
                },
                Features: { enableSignup: true, betaBanner: false },
            },
            Env: { NODE_ENV: 'production', TIMEZONE: 'Europe/Gothenburg' },
        }
        expect(toPrettyJSON(JSON.parse(stdout))).not.toContain(
            toPrettyJSON(corruptObj),
        )
    })

    // --json-compact           Compact JSON output using JSON.stringify.
    it('4.a) Have correct output when using the command "parse" **with option --json-compact**.', async () => {
        // Arrange.
        const fileName = 'valid-config-1.yini'
        const fullPath = path.join(baseDir, fileName)

        // Act.
        // Here, execa(..) is used to run CLI script (like tsx src/index.ts myfile.yini),
        // and to capture stdout, stderr, exitCode, etc.
        const { stdout } = await yiniCLI(`parse ${fullPath} --json-compact`)
        debugPrint('stdout:')
        printObject(stdout)

        // Assert.
        const correctObj = {
            App: {
                title: 'My App',
                enabled: true,
            },
        }
        expect(stdout).toContain(JSON.stringify(correctObj))
    })

    // --json-compact           Compact JSON output using JSON.stringify.
    it('4.b) Have correct output when using the command "parse" **with option --json-compact**.', async () => {
        // Arrange.
        const fileName = 'valid-config-3.yini'
        const fullPath = path.join(baseDir, fileName)

        // Act.
        // Here, execa(..) is used to run CLI script (like tsx src/index.ts myfile.yini),
        // and to capture stdout, stderr, exitCode, etc.
        const { stdout } = await yiniCLI(`parse ${fullPath} --json-compact`)
        debugPrint('stdout:')
        printObject(stdout)

        // Assert.
        const correctObj = {
            App: {
                name: 'ExampleApp Web',
                version: '1.2.3',
                debug: false,
                Logging: {
                    level: 'info',
                    file: 'logs/app.log',
                    maxSize: 1048576,
                },
                Database: {
                    type: 'postgres',
                    host: 'db.example.com',
                    port: 5432,
                    username: 'some_user',
                    password: 's3cret',
                    poolSize: 10,
                    Options: { ssl: true, connectionTimeout: 30 },
                },
                Features: { enableSignup: true, betaBanner: false },
            },
            Env: { NODE_ENV: 'production', TIMEZONE: 'Europe/Gothenburg' },
        }
        expect(stdout).toContain(JSON.stringify(correctObj))
    })

    // --json-compact           Compact JSON output using JSON.stringify.
    it('4.c) Corrupt result should NOT match output when using the command "parse" **with option --json-compact**.', async () => {
        // Arrange.
        const fileName = 'valid-config-3.yini'
        const fullPath = path.join(baseDir, fileName)

        // Act.
        // Here, execa(..) is used to run CLI script (like tsx src/index.ts myfile.yini),
        // and to capture stdout, stderr, exitCode, etc.
        const { stdout } = await yiniCLI(`parse ${fullPath} --json-compact`)
        debugPrint('stdout:')
        printObject(stdout)

        // Assert.
        const corruptObj = {
            App: {
                name: 'ExampleApp Web',
                version: '1.2.3',
                debug: false,
                Logging: {
                    level: 'info',
                    file: 'logs/app.log',
                    maxSize: 1048576,
                },
                // NOTE: Below has been tampered with purpose!
                Database: {
                    type: 'postgres',
                    host: 'db.example.com',
                    port: 5432,
                    username: 'some_user',
                    password: '****',
                    Options: { ssl: true, connectionTimeout: 30 },
                },
                Features: { enableSignup: true, betaBanner: false },
            },
            Env: { NODE_ENV: 'production', TIMEZONE: 'Europe/Gothenburg' },
        }
        expect(stdout).not.toContain(JSON.stringify(corruptObj))
    })

    // --js           Output as JavaScript.
    it('5.a) Have correct output when using the command "parse" **with option --js**.', async () => {
        // Arrange.
        const fileName = 'valid-config-1.yini'
        const fullPath = path.join(baseDir, fileName)

        // Act.
        // Here, execa(..) is used to run CLI script (like tsx src/index.ts myfile.yini),
        // and to capture stdout, stderr, exitCode, etc.
        const { stdout } = await yiniCLI(`parse ${fullPath} --js`)
        debugPrint('stdout:')
        printObject(stdout)

        // Assert.
        const correctObj = {
            App: {
                title: 'My App',
                enabled: true,
            },
        }
        const parsed = eval(`(${stdout})`)
        expect(parsed).toEqual(correctObj)
    })

    //@todo Add test for option --output <file>
})
