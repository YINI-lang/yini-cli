import fs from 'node:fs'
import path from 'node:path'
import util from 'util'
import YINI from 'yini-parser'
import { ICLIParseOptions, TBailSensitivity } from '../types.js'
import { printObject, toPrettyJSON } from '../utils/print.js'

type TOutputStype = 'JS-style' | 'Pretty-JSON' | 'Console.log' | 'JSON-compact'

export const parseFile = (file: string, options: ICLIParseOptions) => {
    const outputFile = options.output || ''
    const isStrictMode = !!options.strict
    let outputStyle: TOutputStype = 'JS-style'

    console.log('file = ' + file)
    console.log('output = ' + options.output)
    console.log('options:')
    printObject(options)

    if (options.pretty) {
        outputStyle = 'Pretty-JSON'
    } else if (options.log) {
        outputStyle = 'Console.log'
    } else if (options.json) {
        outputStyle = 'JSON-compact'
    } else {
        outputStyle = 'JS-style'
    }

    doParseFile(file, outputStyle, isStrictMode, outputFile)
}

const doParseFile = (
    file: string,
    outputStyle: TOutputStype,
    isStrictMode = false,
    outputFile = '',
) => {
    // let strictMode = !!options.strict
    let bailSensitivity: TBailSensitivity = 'auto'
    let includeMetaData = false

    console.log('File = ' + file)
    console.log('outputStyle = ' + outputStyle)

    // try {
    // const raw = fs.readFileSync(file, 'utf-8')
    // const parsed = YINI.parseFile(
    //const parsed = YINI.parseFile(file)
    const parsed = YINI.parseFile(
        file,
        isStrictMode,
        bailSensitivity,
        includeMetaData,
    )
    // const parsed = YINI.parse(raw)

    // const output = options.pretty
    //     ? // ? JSON.stringify(parsed, null, 2)
    //       toPrettyJSON(parsed)
    //     : JSON.stringify(parsed)
    let output = ''
    switch (outputStyle) {
        case 'Pretty-JSON':
            output = toPrettyJSON(parsed)
            break
        case 'Console.log':
            output = '<todo>'
            break
        case 'JSON-compact':
            output = JSON.stringify(parsed)
            break
        default:
            output = util.inspect(parsed, { depth: null, colors: false })
    }

    if (outputFile) {
        // Write JSON output to file instead of stdout.
        fs.writeFileSync(path.resolve(outputFile), output, 'utf-8')
        console.log(`Output written to ${outputFile}`)
    } else {
        console.log(output)
    }
    // } catch (err: any) {
    //     console.error(`Error: ${err.message}`)
    //     process.exit(1)
    // }
}
