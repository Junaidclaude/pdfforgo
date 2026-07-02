// File-size limits enforced client-side before conversion starts. Kept in one
// place so the checked value and the error copy can't drift apart per-tool.
export const STANDARD_MAX_FILE_BYTES = 50 * 1024 * 1024 // 50 MB
export const STANDARD_MAX_FILE_LABEL = '50 MB'

// Protect/Unlock only add a password layer (no rendering engine involved),
// so they can comfortably handle larger files than the 50 MB default.
export const PROTECT_MAX_FILE_BYTES = 100 * 1024 * 1024 // 100 MB
export const PROTECT_MAX_FILE_LABEL = '100 MB'
