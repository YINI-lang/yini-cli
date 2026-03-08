import YAML from 'yaml'
import { Serializer } from './types.js'

export class YamlSerializer implements Serializer {
    readonly format = 'yaml'

    serialize(data: unknown): string {
        return YAML.stringify(data)
    }
}
