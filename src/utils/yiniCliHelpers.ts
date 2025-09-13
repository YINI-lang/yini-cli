import pkg from '../../package.json' with { type: 'json' } // NOTE: Must use { type: 'json' } when in ESM mode.

export const getPackageName = (): string => {
    return '' + pkg.name
}

export const getPackageVersion = (): string => {
    return '' + pkg.version
}
