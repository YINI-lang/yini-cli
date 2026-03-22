// tests/output-formats-simple.test.ts

import path from 'node:path'
import { describe, expect, it } from 'vitest'
import YAML from 'yaml'
import { yiniCLI } from './test-helpers'

const FIXTURE = path.join(__dirname, 'fixtures/simple-config.yini')

const expected = {
    App: {
        name: 'Demo',
        version: '1.0',
        features: ['search', 'dark-mode'],
    },
}

describe('CLI output formats', () => {
    it('1: Outputs formatted JSON (--json)', async () => {
        const { stdout } = await yiniCLI(`parse ${FIXTURE} --json`)
        const parsed = JSON.parse(stdout)

        expect(parsed).toEqual(expected)
    })

    it('2: Outputs compact JSON (--compact)', async () => {
        const { stdout } = await yiniCLI(`parse ${FIXTURE} --compact`)
        const parsed = JSON.parse(stdout)

        expect(parsed).toEqual(expected)
    })

    it('3: Outputs JavaScript (--js)', async () => {
        const { stdout } = await yiniCLI(`parse ${FIXTURE} --js`)

        const parsed = eval(`(${stdout})`)

        expect(parsed).toEqual(expected)
    })

    it('4: Outputs YAML (--yaml)', async () => {
        const { stdout } = await yiniCLI(`parse ${FIXTURE} --yaml`)

        const parsed = YAML.parse(stdout)

        expect(parsed).toEqual(expected)
    })

    it('5: Outputs XML (--xml)', async () => {
        const { stdout } = await yiniCLI(`parse ${FIXTURE} --xml`)

        expect(stdout).toContain('<yini>')
        expect(stdout).toContain('<App>')
        expect(stdout).toContain('<name>Demo</name>')
        expect(stdout).toContain('<version>1.0</version>')
    })
})
