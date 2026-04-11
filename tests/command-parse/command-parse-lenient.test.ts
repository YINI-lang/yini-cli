// tests/command-parse/command-parse-lenient.test.ts
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { debugPrint, printObject, toPrettyJSON } from '../../src/utils/print'
import { yiniCLI } from '../test-helpers'

const FIXTURES_DIR = path.join(__dirname, '../fixtures/parse')
const TEMP_DIR = path.join(__dirname, '../temp')

const ensureTempDir = () => {
    if (!fs.existsSync(TEMP_DIR)) {
        fs.mkdirSync(TEMP_DIR, { recursive: true })
    }
}

const lenientValid = (...parts: string[]) =>
    path.join(FIXTURES_DIR, 'lenient', 'valid', ...parts)

const lenientInvalid = (...parts: string[]) =>
    path.join(FIXTURES_DIR, 'lenient', 'invalid', ...parts)

const tempPath = (fileName: string) => path.join(TEMP_DIR, fileName)

describe('parse command - lenient mode', () => {
    describe('Default parse output', () => {
        it('1.a) Have correct output when using the command "parse" with no options to be pretty JSON.', async () => {
            // Arrange.
            const fullPath = lenientValid('valid-config-1.yini')

            // Act.
            const { stdout } = await yiniCLI(['parse', fullPath])
            debugPrint('stdout:')
            printObject(stdout)

            // Assert.
            expect(stdout).toContain(`{
    "App": {
        "title": "My App",
        "enabled": true
    }
}`)
        })

        it('1.b) Have correct output when using the command "parse" with no options.', async () => {
            // Arrange.
            const fullPath = lenientValid('valid-config-3.yini')

            // Act.
            const { stdout } = await yiniCLI(['parse', fullPath])
            debugPrint('stdout:')
            printObject(stdout)

            // Assert.
            const correct = `{
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

        it('1.c) Corrupt result should NOT match output when using the command "parse" with no options.', async () => {
            // Arrange.
            const fullPath = lenientValid('valid-config-3.yini')

            // Act.
            const { stdout } = await yiniCLI(['parse', fullPath])
            debugPrint('stdout:')
            printObject(stdout)

            // Assert.
            const corruptResult = `{
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
    })

    describe('Explicit output formats', () => {
        it('2.a) Prints pretty JSON with --json.', async () => {
            // Arrange.
            const fullPath = lenientValid('valid-config-1.yini')

            // Act.
            const { stdout } = await yiniCLI(['parse', fullPath, '--json'])
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

        it('2.b) Have correct output when using the command "parse" with option --json.', async () => {
            // Arrange.
            const fullPath = lenientValid('valid-config-3.yini')

            // Act.
            const { stdout } = await yiniCLI(['parse', fullPath, '--json'])
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

        it('2.c) Corrupt result should NOT match output when using the command "parse" with option --json.', async () => {
            // Arrange.
            const fullPath = lenientValid('valid-config-3.yini')

            // Act.
            const { stdout } = await yiniCLI(['parse', fullPath, '--json'])
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

        it('3.a) Have correct output when using the command "parse" with option --compact.', async () => {
            // Arrange.
            const fullPath = lenientValid('valid-config-1.yini')

            // Act.
            const { stdout } = await yiniCLI(['parse', fullPath, '--compact'])
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

        it('3.b) Have correct output when using the command "parse" with option --compact.', async () => {
            // Arrange.
            const fullPath = lenientValid('valid-config-3.yini')

            // Act.
            const { stdout } = await yiniCLI(['parse', fullPath, '--compact'])
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

        it('3.c) Does not match a corrupt, compact JSON result.', async () => {
            // Arrange.
            const fullPath = lenientValid('valid-config-3.yini')

            // Act.
            const { stdout } = await yiniCLI(['parse', fullPath, '--compact'])
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

        it('4.a) Have correct output when using the command "parse" with option --js.', async () => {
            // Arrange.
            const fullPath = lenientValid('valid-config-1.yini')

            // Act.
            const { stdout } = await yiniCLI(['parse', fullPath, '--js'])
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
    })

    describe('Lenient recovery behavior', () => {
        it('5.a) Should pass parsing a corrupt YINI in lenient (default) mode.', async () => {
            // Arrange.
            const fullPath = lenientInvalid('corrupt-config-1.yini')

            // Act.
            const { stdout } = await yiniCLI(['parse', fullPath, '--compact'])
            debugPrint('stdout:')
            printObject(stdout)

            // Assert.
            const jsObj = { Section: { value: 42 } }
            expect(stdout).toContain(JSON.stringify(jsObj))
        })

        it('5.b) Shows error on parsing an invalid YINI containing some garbage.', async () => {
            // Arrange.
            const fullPath = lenientInvalid('invalid-config-1.yini')

            // Act.
            const { stderr, exitCode } = await yiniCLI(['parse', fullPath])
            debugPrint('stderr:')
            printObject(stderr)
            debugPrint('exitCode:')
            printObject(exitCode)

            // Assert.
            expect(exitCode).not.toBe(0)
            expect(stderr.toLowerCase()).toContain('syntax error')
        })
    })

    describe('Output file handling', () => {
        it('6.a) Skips when output file exists without --overwrite.', async () => {
            // Arrange.
            ensureTempDir()
            const fullPath = lenientValid('valid-config-1.yini')
            const outPath = tempPath('tmp.json')
            fs.writeFileSync(outPath, 'dummy')

            try {
                // Act.
                const { exitCode } = await yiniCLI([
                    'parse',
                    fullPath,
                    '--output',
                    outPath,
                ])

                // Assert.
                expect(exitCode).toBe(0)
            } finally {
                if (fs.existsSync(outPath)) fs.unlinkSync(outPath)
            }
        })

        it('6.b) Writes output file when it does not exist.', async () => {
            // Arrange.
            ensureTempDir()
            const fullPath = lenientValid('valid-config-1.yini')
            const outPath = tempPath('tmp-new.json')

            if (fs.existsSync(outPath)) {
                fs.unlinkSync(outPath)
            }

            try {
                // Act.
                const { exitCode } = await yiniCLI([
                    'parse',
                    fullPath,
                    '--output',
                    outPath,
                ])

                // Assert.
                expect(exitCode).toBe(0)
                expect(fs.existsSync(outPath)).toBe(true)
            } finally {
                if (fs.existsSync(outPath)) fs.unlinkSync(outPath)
            }
        })

        it('6.c) Writes when destination is older than source.', async () => {
            // Arrange.
            ensureTempDir()
            const fullPath = lenientValid('valid-config-1.yini')
            const outPath = tempPath('tmp-older.json')
            fs.writeFileSync(outPath, 'dummy')

            const srcStat = fs.statSync(fullPath)
            const olderThanSrc = (srcStat.mtimeMs - 60_000) / 1000
            fs.utimesSync(outPath, olderThanSrc, olderThanSrc)

            try {
                // Act.
                const { exitCode } = await yiniCLI([
                    'parse',
                    fullPath,
                    '--output',
                    outPath,
                ])

                // Assert.
                expect(exitCode).toBe(0)
            } finally {
                if (fs.existsSync(outPath)) fs.unlinkSync(outPath)
            }
        })

        it('6.d) Skips when destination is newer than source.', async () => {
            // Arrange.
            ensureTempDir()
            const fullPath = lenientValid('valid-config-1.yini')
            const outPath = tempPath('tmp-newer.json')
            fs.writeFileSync(outPath, 'dummy')

            const srcStat = fs.statSync(fullPath)
            const newerThanSrc = (srcStat.mtimeMs + 60_000) / 1000
            fs.utimesSync(outPath, newerThanSrc, newerThanSrc)

            try {
                // Act.
                const { exitCode } = await yiniCLI([
                    'parse',
                    fullPath,
                    '--output',
                    outPath,
                ])

                // Assert.
                expect(exitCode).toBe(0)
            } finally {
                if (fs.existsSync(outPath)) fs.unlinkSync(outPath)
            }
        })

        it('6.e) Writes when --overwrite is used.', async () => {
            // Arrange.
            ensureTempDir()
            const fullPath = lenientValid('valid-config-1.yini')
            const outPath = tempPath('tmp-overwrite.json')
            fs.writeFileSync(outPath, 'dummy')

            try {
                // Act.
                const { exitCode } = await yiniCLI([
                    'parse',
                    fullPath,
                    '--output',
                    outPath,
                    '--overwrite',
                ])

                // Assert.
                expect(exitCode).toBe(0)
            } finally {
                if (fs.existsSync(outPath)) fs.unlinkSync(outPath)
            }
        })

        it('6.f) Fails when --no-overwrite is used.', async () => {
            // Arrange.
            ensureTempDir()
            const fullPath = lenientValid('valid-config-1.yini')
            const outPath = tempPath('tmp-no-overwrite.json')
            fs.writeFileSync(outPath, 'dummy')

            try {
                // Act.
                const { exitCode } = await yiniCLI([
                    'parse',
                    fullPath,
                    '--output',
                    outPath,
                    '--no-overwrite',
                ])

                // Assert.
                expect(exitCode).not.toBe(0)
            } finally {
                if (fs.existsSync(outPath)) fs.unlinkSync(outPath)
            }
        })

        it('7.a) Fails when output file is the same as the input file.', async () => {
            // Arrange.
            const fullPath = lenientValid('valid-config-1.yini')

            // Act.
            const { exitCode } = await yiniCLI([
                'parse',
                fullPath,
                '--output',
                fullPath,
            ])

            // Assert.
            expect(exitCode).toBe(1)
        })

        it('7.b) Fails with clear error message when output file is the same as the input file.', async () => {
            // Arrange.
            const fullPath = lenientValid('valid-config-2.yini')

            // Act.
            const { exitCode, stderr } = await yiniCLI([
                'parse',
                fullPath,
                '--output',
                fullPath,
            ])

            // Assert.
            expect(exitCode).toBe(1)
            expect(stderr).toMatch(
                /output file must be different from the input file/i,
            )
        })
    })
})
