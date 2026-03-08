export interface Serializer {
    readonly format: string
    serialize(data: unknown): string
}
