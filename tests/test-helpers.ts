import { execa } from 'execa'

/**
 * @param argsLine A line of arguments (command and options) to pass to yini
 * (yini-cli) on execution in CLI.
 * @returns
 */
export const yiniCLI = (argsLine: string, options = {}) =>
    execa('tsx', ['src/index.ts', ...argsLine.split(/\s+/)], {
        reject: false,
        ...options,
    })
