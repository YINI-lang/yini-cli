// tests/test-helpers.ts
import { execa } from 'execa'

/**
 * Run the YINI CLI with a list of arguments.
 */
export const yiniCLI = (args: string[], options = {}) =>
    execa('tsx', ['src/index.ts', ...args], {
        reject: false,
        ...options,
    })
