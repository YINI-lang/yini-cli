import { describe, expect, it } from 'vitest'
import YAML from 'yaml'
import { getSerializer } from '../src/serializers/index'
import { getPrettyJS, JSSerializer } from '../src/serializers/jSSerializer'
import { XmlSerializer } from '../src/serializers/xmlSerializer'

describe('Output serializers.', () => {
    const data = {
        safeKey: "quote ' and slash \\",
        'key-with-dashes': 'line one\nline two\tend',
        unicodeSeparator: '\u2028\u2029',
        enabled: true,
        count: 3,
        emptyList: [],
        emptyObject: {},
        nested: [{ value: '<tag> & "quoted"' }],
    }

    it('produces JavaScript that evaluates back to the original data.', () => {
        const output = getPrettyJS(data)
        const parsed = Function(`"use strict"; return (${output})`)()

        expect(parsed).toEqual(data)
        expect(output).toContain("'key-with-dashes'")
        expect(output).toContain('\\u2028\\u2029')
    })

    it('supports configurable JavaScript module output.', () => {
        const output = getPrettyJS({ value: 1 }, { exportDefault: true })

        expect(output).toBe('export default {\n    value: 1\n};\n')
    })

    it('identifies the JavaScript serializer correctly.', () => {
        expect(new JSSerializer().format).toBe('js')
        expect(getSerializer('js')).toBeInstanceOf(JSSerializer)
    })

    it('round-trips YAML-special strings and nested values.', () => {
        const output = getSerializer('yaml').serialize(data)

        expect(YAML.parse(output)).toEqual(data)
    })

    it('escapes XML-sensitive text and serializes arrays.', () => {
        const output = new XmlSerializer().serialize(data)

        expect(output).toContain('&lt;tag&gt; &amp; "quoted"')
        expect(output.match(/<nested>/g)).toHaveLength(1)
        expect(output).toContain('<value>')
    })

    it('uses four-space indentation only for formatted JSON.', () => {
        const pretty = getSerializer('json').serialize(data)
        const compact = getSerializer('json-compact').serialize(data)

        expect(pretty).toContain('\n    "safeKey"')
        expect(compact).not.toContain('\n')
        expect(JSON.parse(pretty)).toEqual(data)
        expect(JSON.parse(compact)).toEqual(data)
    })
})
