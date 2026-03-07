import { Serializer } from './types.js'

export class JsonSerializer implements Serializer {
    public readonly format: 'json' | 'json-compact'

    constructor(format: 'json' | 'json-compact' = 'json') {
        this.format = format
    }

    serialize(data: unknown): string {
        return this.format === 'json'
            ? getPrettyJSON(data)
            : JSON.stringify(data) // Compact.
    }
}

export const getPrettyJSON = (obj: unknown): string => {
    const str = JSON.stringify(obj, null, 4)
    return str
}
