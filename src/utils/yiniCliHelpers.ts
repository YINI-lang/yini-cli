import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const pkg = JSON.parse(
    readFileSync(resolve(__dirname, '../../package.json'), 'utf-8'),
)
// import pkg from '../../package.json' with { type: 'json' } // NOTE: Must use { type: 'json' } when in ESM mode.

export const getPackageName = (): string => {
    return '' + pkg.name
}

export const getPackageVersion = (): string => {
    return '' + pkg.version
}
