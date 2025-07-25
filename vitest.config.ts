import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        globals: true, // To use "describe", "it", etc. globally.
        environment: 'node',
    },
})
