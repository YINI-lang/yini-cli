import { Command } from 'commander'

console.log('Start: index.ts')
const program = new Command()

program
    .name('yini')
    .description('CLI tool for YINI configuration files')
    .version('0.1.0')

program
    .command('parse')
    .description('Parse a YINI file and output JSON')
    .argument('<file>', 'Path to the YINI file')
    .action(async (file) => {
        const YINI = await import('yini-parser')
        const config = YINI.default.parseFile(file)
        console.log(JSON.stringify(config, null, 2))
    })

program.parse()
