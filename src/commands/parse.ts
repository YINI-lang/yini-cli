import fs from 'node:fs'
import path from 'node:path'
import YINI from 'yini-parser'
import { ICLIParseOptions, TBailSensitivity } from '../types'
import { toPrettyJSON } from '../utils/print'

export function parseFile(file: string, options: ICLIParseOptions) {
    let strictMode = !!options.strict
    let bailSensitivity: TBailSensitivity = 'auto'
    let includeMetaData = false

    console.log('File = ' + file)

    try {
        // const raw = fs.readFileSync(file, 'utf-8')
        // const parsed = YINI.parseFile(
        //const parsed = YINI.parseFile(file)
        const parsed = YINI.parseFile(
            file,
            strictMode,
            bailSensitivity,
            includeMetaData,
        )
        // const parsed = YINI.parse(raw)

        const output = options.pretty
            ? // ? JSON.stringify(parsed, null, 2)
              toPrettyJSON(parsed)
            : JSON.stringify(parsed)

        if (options.output) {
            // Write JSON output to file instead of stdout.
            fs.writeFileSync(path.resolve(options.output), output, 'utf-8')
            console.log(`Output written to ${options.output}`)
        } else {
            console.log(output)
        }
    } catch (err: any) {
        console.error(`Error: ${err.message}`)
        process.exit(1)
    }
}
