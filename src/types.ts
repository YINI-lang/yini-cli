// //export type TBailSensitivity = 'auto' | 0 | 1 | 2
// export type TPreferredFailLevel = 'auto' | 0 | 1 | 2 // Preferred bail sensitivity level.
// export type TBailSensitivityLevel = 0 | 1 | 2 // Bail sensitivity level.

/*
    REMEMBER: CLI ergonomics are about minimizing surprise.
        E.g. Avoid -V completily, due to it can be both version and verbose.
 */

// --- CLI Global Command Options --------------------------------------------------------
export interface IGlobalOptions {
    lenient?: boolean // (DEFAULT) Enable lenient parsing mode.
    strict?: boolean // Enable strict parsing mode.
    quiet?: boolean // Reduce output (show only errors).
    silent?: boolean // Suppress all output (even errors, exit code only).
    verbose?: boolean // Extra information.
}
// -------------------------------------------------------------------------
