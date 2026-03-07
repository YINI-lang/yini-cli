// src/serializers/xmlSerializer.ts

import { create } from 'xmlbuilder2'
import { Serializer } from './types.js'

export class XmlSerializer implements Serializer {
    readonly format = 'xml'

    serialize(data: unknown): string {
        const plainJSON = JSON.parse(JSON.stringify(data))
        const doc = create({ version: '1.0' }).ele({ yini: plainJSON })

        return doc.end({ prettyPrint: true })
    }
}
