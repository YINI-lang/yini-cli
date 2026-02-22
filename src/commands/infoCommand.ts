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
    const size = 16

    console.log()
    console.log('YINI CLI — Environment Information')
    console.log('==================================')
    console.log()

    console.log(toColRow(size, 'CLI Version:', pkg.version))
    console.log(
        toColRow(
            size,
            'Parser Version:',
            pkg.dependencies['yini-parser'].replace('^', ''),
        ),
    )
    console.log(toColRow(size, 'Author:', pkg.author))
    console.log(toColRow(size, 'License:', pkg.license))
    console.log()

    console.log(
        toColRow(size, 'Repository:', 'https://github.com/YINI-lang/yini-cli'),
    )
    console.log(toColRow(size, 'Homepage:', removeSuffix(pkg.homepage, '/')))
}
