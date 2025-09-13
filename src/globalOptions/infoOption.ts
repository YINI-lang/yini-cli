import { createRequire } from 'module'

// import pkg from '../../package.json' with { type: 'json' } // NOTE: Must use { type: 'json' } when in ESM mode.

const require = createRequire(import.meta.url)
const pkg = require('../../package.json')

export const printInfo = () => {
    console.log(`*** YINI CLI ***`)
    console.log(`yini-cli:    ${pkg.version}`)
    console.log(
        `yini-parser: ${pkg.dependencies['yini-parser'].replace('^', '')}`,
    )
    console.log(`Author:      ${pkg.author}`)
    console.log(`License:     ${pkg.license}`)
    console.log(`Homepage:    ${pkg.homepage}`)
    console.log('Repo:        https://github.com/YINI-lang/yini-cli')
}
