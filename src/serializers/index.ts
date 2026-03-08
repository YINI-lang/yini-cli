// src/serializers/index.ts

/*

NOTE:

Supported formats are a small, intentionally selected set of commonly
used output formats:

- JSON:     Output as formatted JSON (default) for easy reading and broad
            compatibility with tools and APIs.
- compact:  Output compact JSON (no whitespace) for efficient piping,
            scripting, and smaller output size.
- JS:       Output as JavaScript for direct use in Node.js or embedding the
            result as a JavaScript object.
- YAML:     Output as YAML for environments and tools that commonly use
            YAML-based configuration.
- XML:      Output as XML for interoperability with systems and tooling that
            rely on XML formats.

These formats cover the most common scenarios for inspecting parsed YINI data
and exchanging it with other tools and systems.

The CLI focuses on providing a small number of widely useful formats while
keeping the command simple and predictable.

Additional conversions can be implemented in separate tools built on top of
the YINI CLI — for example a dedicated utility such as yini-convert.

This keeps the core CLI focused while allowing additional functionality to be
added in complementary tools if needed.

*/

import { JsonSerializer } from './jsonSerializer.js'
import { JSSerializer } from './jSSerializer.js'
import { Serializer } from './types.js'
import { XmlSerializer } from './xmlSerializer.js'
import { YamlSerializer } from './yamlSerializer.js'

export type TOutputFormat = 'json' | 'json-compact' | 'js' | 'yaml' | 'xml'

export function getSerializer(format: TOutputFormat): Serializer {
    switch (format) {
        case 'json':
        case 'json-compact':
            return new JsonSerializer(format)

        case 'js':
            return new JSSerializer()

        case 'yaml':
            return new YamlSerializer()

        case 'xml':
            return new XmlSerializer()

        default: {
            const exhaustiveCheck: never = format
            throw new Error(`Unsupported output format: ${exhaustiveCheck}`)
        }
    }
}
