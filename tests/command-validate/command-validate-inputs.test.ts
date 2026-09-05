import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { yiniCLI } from '../test-helpers'

const FIXTURES_DIR = path.resolve(__dirname, '../fixtures/validate')
const IGNORE_DIR = path.join(FIXTURES_DIR, 'ignore')
const VALID_DIR = path.join(FIXTURES_DIR, 'lenient/valid')
const VALID_FILE = path.join(VALID_DIR, 'validate-valid-basic-1.yini')
const TEMP_DIR = path.resolve(__dirname, '../temp')

describe('Validate command input collection.', () => {
    it('supports the documented --no-subdirs alias.', async () => {
        const { stdout, exitCode } = await yiniCLI([
            'validate',
            IGNORE_DIR,
            '--no-subdirs',
            '--format',
            'json',
        ])
        const report = JSON.parse(stdout)

        expect(exitCode).toBe(1)
        expect(report.summary.filesChecked).toBe(2)
        expect(report.files.map((file: { file: string }) => file.file)).toEqual(
            ['root-valid.yini', 'root.invalid.yini'],
        )
    })

    it('Deduplicates repeated file targets.', async () => {
        const { stdout, stderr, exitCode } = await yiniCLI([
            'validate',
            VALID_FILE,
            VALID_FILE,
            '--format',
            'json',
        ])
        const report = JSON.parse(stdout)

        expect(exitCode).toBe(0)
        expect(stderr).toBe('')
        expect(report.runMode).toBe('file')
        expect(report.file).toBe(VALID_FILE)
    })

    it('Returns directory files in deterministic sorted order.', async () => {
        const { stdout, exitCode } = await yiniCLI([
            'validate',
            VALID_DIR,
            '--format',
            'json',
        ])
        const report = JSON.parse(stdout)
        const files = report.files.map((file: { file: string }) => file.file)

        expect(exitCode).toBe(0)
        expect(files).toEqual([...files].sort((a, b) => a.localeCompare(b)))
    })

    it('Deduplicates a file included both directly and through a directory.', async () => {
        const { stdout, exitCode } = await yiniCLI([
            'validate',
            VALID_DIR,
            VALID_FILE,
            '--format',
            'json',
        ])
        const report = JSON.parse(stdout)
        const directFileOccurrences = report.files.filter(
            (file: { file: string }) =>
                path.resolve(process.cwd(), file.file) === VALID_FILE,
        )

        expect(exitCode).toBe(0)
        expect(report.runMode).toBe('directory')
        expect(report.summary.filesChecked).toBe(4)
        expect(directFileOccurrences).toHaveLength(1)
    })

    it('Accepts uppercase .YINI files and ignores unrelated files.', async () => {
        const inputDir = path.join(TEMP_DIR, 'uppercase-extension')
        const yiniFile = path.join(inputDir, 'CONFIG.YINI')
        const textFile = path.join(inputDir, 'notes.txt')

        fs.mkdirSync(inputDir, { recursive: true })
        fs.writeFileSync(yiniFile, '^ App\nname = "Demo"\n')
        fs.writeFileSync(textFile, 'not a YINI file')

        try {
            const { stdout, exitCode } = await yiniCLI([
                'validate',
                inputDir,
                '--format',
                'json',
            ])
            const report = JSON.parse(stdout)

            expect(exitCode).toBe(0)
            expect(report.summary.filesChecked).toBe(1)
            expect(report.files[0].file).toBe('CONFIG.YINI')
        } finally {
            if (fs.existsSync(yiniFile)) fs.unlinkSync(yiniFile)
            if (fs.existsSync(textFile)) fs.unlinkSync(textFile)
            if (fs.existsSync(inputDir)) fs.rmdirSync(inputDir)
        }
    })

    it('Does not follow a directory symlink cycle indefinitely.', async () => {
        const inputDir = fs.mkdtempSync(path.join(TEMP_DIR, 'symlink-cycle-'))
        const nestedDir = path.join(inputDir, 'nested')
        const yiniFile = path.join(nestedDir, 'config.yini')
        const cycleLink = path.join(nestedDir, 'back-to-root')

        fs.mkdirSync(nestedDir)
        fs.writeFileSync(yiniFile, '^ App\nname = "Demo"\n')
        fs.symlinkSync(
            inputDir,
            cycleLink,
            process.platform === 'win32' ? 'junction' : 'dir',
        )

        try {
            const { stdout, exitCode } = await yiniCLI([
                'validate',
                inputDir,
                '--format',
                'json',
            ])
            const report = JSON.parse(stdout)

            expect(exitCode).toBe(0)
            expect(report.summary.filesChecked).toBe(1)
            expect(report.files[0].file).toBe(
                path.join('nested', 'config.yini'),
            )
        } finally {
            fs.rmSync(inputDir, { recursive: true, force: true })
        }
    })
})
