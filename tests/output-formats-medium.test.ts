// tests/output-formats-medium.test.ts

// tests/output-formats.test.ts

import path from 'node:path'
import { describe, expect, it } from 'vitest'
import YAML from 'yaml'
import { yiniCLI } from './test-helpers'

const FIXTURE = path.resolve(__dirname, 'fixtures/medium-config.yini')

const expected = {
    App: {
        name: 'Demo',
        version: '1.0.0',
        features: ['search', 'dark-mode'],
        Database: {
            host: 'localhost',
            port: 5432,
            auth: {
                user: 'admin',
                pass: 'secret',
            },
        },
    },
}

describe('CLI output formats (medium fixture)', () => {
    it('1: Outputs formatted JSON (--json)', async () => {
        const { stdout, exitCode } = await yiniCLI(`parse ${FIXTURE} --json`)

        const parsed = JSON.parse(stdout)

        expect(exitCode).toBe(0)
        expect(parsed).toEqual(expected)
    })

    it('2: Outputs compact JSON (--compact)', async () => {
        const { stdout, exitCode } = await yiniCLI(`parse ${FIXTURE} --compact`)

        const parsed = JSON.parse(stdout)

        expect(exitCode).toBe(0)
        expect(parsed).toEqual(expected)
    })

    it('3: Outputs JavaScript (--js)', async () => {
        const { stdout, exitCode } = await yiniCLI(`parse ${FIXTURE} --js`)

        const parsed = eval(`(${stdout})`)

        expect(exitCode).toBe(0)
        expect(parsed).toEqual(expected)
    })

    it('4: Outputs YAML (--yaml)', async () => {
        const { stdout, exitCode } = await yiniCLI(`parse ${FIXTURE} --yaml`)

        const parsed = YAML.parse(stdout)

        expect(exitCode).toBe(0)
        expect(parsed).toEqual(expected)
    })

    it('5: Outputs XML (--xml)', async () => {
        const { stdout, exitCode } = await yiniCLI(`parse ${FIXTURE} --xml`)

        expect(exitCode).toBe(0)

        expect(stdout).toContain('<yini>')
        expect(stdout).toContain('<App>')
        expect(stdout).toContain('<name>Demo</name>')
        expect(stdout).toContain('<version>1.0.0</version>')
        expect(stdout).toContain('<Database>')
        expect(stdout).toContain('<host>localhost</host>')
        expect(stdout).toContain('<port>5432</port>')
        expect(stdout).toContain('<user>admin</user>')
    })
})
