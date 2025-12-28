import type { Command, Help } from 'commander'

export function enableHelpAll(program: Command) {
    const originalFormatHelp = program.createHelp().formatHelp

    program.configureHelp({
        formatHelp: (cmd: Command, helper: Help) => {
            // Call the original formatter (not the overridden one)
            let output = originalFormatHelp.call(helper, cmd, helper)

            // Only expand the top-level help
            if (cmd !== program) return output

            for (const sub of program.commands) {
                output += '\n\n'
                output +=
                    '--------------------------------------------------------\n'
                output += `* Command: ${sub.name()}\n`
                output +=
                    '--------------------------------------------------------\n'
                output += originalFormatHelp.call(helper, sub, helper)
                // output += '--------------------------------------------------------\n'
            }

            return output
        },
    })
}
