// import pkg from '../../package.json'
import { createRequire } from 'module.'

const require = createRequire(import.meta.url)
const pkg = require('../../package.json')

// import pkg from '../../package.json' assert { type: 'json' }

export const printInfo = () => {
    console.log(`** ${pkg.name} **`)
    console.log(`Version:     ${pkg.version}`)
    console.log(
        `yini-parser: ${pkg.dependencies['yini-parser'].replace('^', '')}`,
    )
    console.log(`Author:      ${pkg.author}`)
    console.log(`License:     ${pkg.license}`)
    console.log(`Homepage:    ${pkg.homepage}`)
    console.log('Repo: https://github.com/YINI-lang/yini-parser-typescript')
}
