// //export type TBailSensitivity = 'auto' | 0 | 1 | 2
// export type TPreferredFailLevel = 'auto' | 0 | 1 | 2 // Preferred bail sensitivity level.
// export type TBailSensitivityLevel = 0 | 1 | 2 // Bail sensitivity level.

// --- CLI Global Command Options --------------------------------------------------------
export interface IGlobalOptions {
    strict?: boolean // Enable strict parsing mode.
    force?: boolean // Force parsing even during errors.
    quiet?: boolean // Reduce output (show only errors).
    silent?: boolean // Suppress all output (even errors, exit code only).
}
// -------------------------------------------------------------------------
