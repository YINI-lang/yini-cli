export const toColRow = (size: number, label: string, value: string) => {
    return `${label.padEnd(size)} ${value}`
}

export const removeSuffix = (str: string, suffix: string): string => {
    if (str.endsWith(suffix)) {
        return str.slice(0, -suffix.length)
    }
    return str
}
