#!/usr/bin/env node
import { spawnSync } from 'node:child_process'

const usage =
    'Usage: node tools/yini-test-suite-adapter.mjs --input <file> [--mode <lenient|strict>]'

const parseArgs = (args) => {
    const parsed = {
        input: '',
        mode: 'lenient',
    }

    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index]

        if (arg === '--input') {
            parsed.input = args[index + 1] ?? ''
            index += 1
            continue
        }

        if (arg === '--mode') {
            parsed.mode = args[index + 1] ?? ''
            index += 1
            continue
        }

        throw new Error(`Unknown argument: ${arg}`)
    }

    if (!parsed.input) {
        throw new Error('Missing required --input argument.')
    }

    if (parsed.mode !== 'lenient' && parsed.mode !== 'strict') {
        throw new Error('Invalid --mode argument.')
    }

    return parsed
}

const runYiniCli = (args) => {
    return spawnSync(process.execPath, ['./dist/index.js', ...args], {
        encoding: 'utf8',
        stdio: 'pipe',
    })
}

const getExitCode = (result) => result.status ?? 1

const writeStderr = (text) => {
    const trimmed = text.trim()

    if (trimmed) {
        console.error(trimmed)
    }
}

try {
    const { input, mode } = parseArgs(process.argv.slice(2))
    const modeFlag = `--${mode}`

    const validate = runYiniCli([modeFlag, 'validate', input, '--silent'])

    if (validate.status !== 0) {
        writeStderr(
            validate.stderr ||
                `Validation failed for "${input}" in ${mode} mode.`,
        )
        process.exit(getExitCode(validate))
    }

    const parse = runYiniCli([modeFlag, 'parse', input, '--compact'])

    if (parse.status !== 0) {
        writeStderr(
            parse.stderr ||
                parse.stdout ||
                `Parse failed for "${input}" in ${mode} mode.`,
        )
        process.exit(getExitCode(parse))
    }

    process.stdout.write(parse.stdout)
    writeStderr(parse.stderr)
    process.exit(0)
} catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    console.error(`${message}\n${usage}`)
    process.exit(2)
}
