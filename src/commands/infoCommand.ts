import { createRequire } from 'module'
import { removeSuffix, toColRow } from '../utils/string.js'

// import pkg from '../../package.json' with { type: 'json' } // NOTE: Must use { type: 'json' } when in ESM mode.

const require = createRequire(import.meta.url)
const pkg = require('../../package.json')

/*
    YINI CLI — Environment Information
    ──────────────────────────────────

    CLI Version:     1.1.1-beta
    Parser Version:  1.3.2-beta

if verbose(
    Node.js:           v20.18.0
    Platform:          win32 x64
    Working Directory: D:\Sources\YINI-lang-WORK\yini-cli
)

    Author:          Marko K. Seppänen
    License:         Apache-2.0

    Repository:      https://github.com/YINI-lang/yini-cli
    Homepage:        https://yini-lang.org

    ---

*/
/**
 * NOTE: Keep contributors in acknowledged in README or --credits.
 */
export const printInfo = () => {
    console.log(`*** YINI CLI ***`)
    console.log(`yini-cli:    ${pkg.version}`)
    console.log(
        `yini-parser: ${pkg.dependencies['yini-parser'].replace('^', '')}`,
    )
    console.log(`Author:      ${pkg.author}`)
    console.log(`License:     ${pkg.license}`)
    console.log('Repo:        https://github.com/YINI-lang/yini-cli')
    console.log(
        toColRow(16, 'Repository', 'https://github.com/YINI-lang/yini-cli'),
    )
    console.log(`Homepage:    ${removeSuffix(pkg.homepage, '/')}`)
}
