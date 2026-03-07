// src/serializers/index.ts
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
