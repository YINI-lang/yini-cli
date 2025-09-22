import fs from 'node:fs'
import path from 'node:path'
import util from 'util'
import YINI, { ParseOptions, PreferredFailLevel } from 'yini-parser'
import { IGlobalOptions } from '../types.js'
import { debugPrint, printObject, toPrettyJSON } from '../utils/print.js'

type TOutputStype = 'JS-style' | 'Pretty-JSON' | 'Console.log' | 'JSON-compact'

// --- CLI command "parse" commandOptions --------------------------------------------------------
export interface IParseCommandOptions extends IGlobalOptions {
    pretty?: boolean
    json?: boolean
    output?: string
}
// -------------------------------------------------------------------------

export const parseFile = (
    file: string,
    commandOptions: IParseCommandOptions,
) => {
    const outputFile = commandOptions.output || ''
    const isStrictMode = !!commandOptions.strict
    let outputStyle: TOutputStype = 'JS-style'

    debugPrint('file = ' + file)
    debugPrint('output = ' + commandOptions.output)
    debugPrint('commandOptions:')
    printObject(commandOptions)

    if (commandOptions.pretty) {
        outputStyle = 'Pretty-JSON'
    } else if (commandOptions.json) {
        outputStyle = 'JSON-compact'
    } else {
        outputStyle = 'JS-style'
    }

    doParseFile(file, commandOptions, outputStyle, outputFile)
}

const doParseFile = (
    file: string,
    commandOptions: IParseCommandOptions,
    outputStyle: TOutputStype,
    outputFile = '',
) => {
    // let strictMode = !!commandOptions.strict
    let preferredFailLevel: PreferredFailLevel = 'auto'
    let includeMetaData = false

    debugPrint('File = ' + file)
    debugPrint('outputStyle = ' + outputStyle)

    const parseOptions: ParseOptions = {
        strictMode: commandOptions.strict ?? false,
        // failLevel: 'errors',
        failLevel: preferredFailLevel,
        // failLevel: 'ignore-errors',
        includeMetadata: includeMetaData,
    }

    // If --force then override fail-level.
    if (commandOptions.force) {
        parseOptions.failLevel = 'ignore-errors'
    }

    try {
        const parsed = YINI.parseFile(file, parseOptions)

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
