import fs from 'node:fs'
import path from 'node:path'
import util from 'util'
import YINI, { PreferredFailLevel } from 'yini-parser'
import { ICLIGlobalCommandOptions } from '../types.js'
import { debugPrint, printObject, toPrettyJSON } from '../utils/print.js'

type TOutputStype = 'JS-style' | 'Pretty-JSON' | 'Console.log' | 'JSON-compact'

// --- CLI command "parse" options --------------------------------------------------------
export interface ICLIParseOptions extends ICLIGlobalCommandOptions {
    pretty?: boolean
    json?: boolean
    output?: string
}
// -------------------------------------------------------------------------

export const parseFile = (file: string, options: ICLIParseOptions) => {
    const outputFile = options.output || ''
    const isStrictMode = !!options.strict
    let outputStyle: TOutputStype = 'JS-style'

    debugPrint('file = ' + file)
    debugPrint('output = ' + options.output)
    debugPrint('options:')
    printObject(options)

    if (options.pretty) {
        outputStyle = 'Pretty-JSON'
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
    let preferredFailLevel: PreferredFailLevel = 'auto'
    let includeMetaData = false

    debugPrint('File = ' + file)
    debugPrint('outputStyle = ' + outputStyle)

    try {
        // const raw = fs.readFileSync(file, 'utf-8')
        // const parsed = YINI.parseFile(
        //const parsed = YINI.parseFile(file)
        const parsed = YINI.parseFile(
            file,
            isStrictMode,
            preferredFailLevel,
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
            console.log(`Output written to file: "${outputFile}"`)
        } else {
            console.log(output)
        }
    } catch (err: any) {
        console.error(`Error: ${err.message}`)
        process.exit(1)
    }
}
