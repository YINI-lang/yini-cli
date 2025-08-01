import fs from 'node:fs'
import { exit } from 'node:process'
import YINI from 'yini-parser'
import { printObject } from '../utils/print.js'

interface IValidateOptions {
    strict?: boolean
    details?: boolean
    silent?: boolean
}

export const validateFile = (file: string, options: IValidateOptions = {}) => {
    try {
        const content = fs.readFileSync(file, 'utf-8')
        const isMeta = true
        const parsed = YINI.parse(
            content,
            options.strict ?? false,
            'auto',
            isMeta,
        )

        if (!options.silent) {
            console.log(
                `✔ File is valid${options.strict ? ' (strict mode)' : ''}.`,
            )

            if (options.details) {
                //@todo format parsed.meta to details as
                /*
                 * Details:
                 * - YINI version: 1.0.0-beta.6
                 * - Mode: strict
                 * - Keys: 42
                 * - Sections: 6
                 * - Nesting depth: 3
                 * - Has @yini: true
                 */

                printObject(parsed.meta)
            }
        }
        exit(0)
    } catch (err: any) {
        console.error(`✖ Validation failed: ${err.message}`)
        exit(1)
    }
}
