import pkg from '../../package.json'

export const printInfo = () => {
    console.log(`** ${pkg.name} **`)
    console.log(`Version:     ${pkg.version}`)
    console.log(
        `yini-parser: ${pkg.dependencies['yini-parser'].replace('^', '')}`,
    )
    console.log(`Author:      ${pkg.author}`)
    console.log(`License:     ${pkg.license}`)
    console.log(`Homepage:    ${pkg.homepage}`)
}
