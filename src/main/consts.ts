/* eslint-disable unicorn/prefer-code-point */
// === Timeouts ===
export const ROOM_RESCAN_TIMEOUT = 600
export const ROOM_PATH_TIMEOUT = 3600
export const ROOM_MATRIX_TIMEOUT = 3600
export const MAX_AGE_REPORT = 6000
export const DEFAULT_CACHE_TIMEOUT = 500

export const CREEP_STEP_PATH_BONUS = 500
export const PATH_SCORE_THRESHOLD = 5000
export const PATH_SCORE_MAX = 9999

let lastCode = 65
export const CACHE = {
  HAVE_MATRIX: String.fromCharCode(lastCode++),
  PATH: String.fromCharCode(lastCode++),

  WORKER_TASKS: String.fromCharCode(lastCode++),

  HARVEST: String.fromCharCode(lastCode++),
  BUILD: String.fromCharCode(lastCode++),
  HAVE_ENERGY: String.fromCharCode(lastCode++),
  REPAIR: String.fromCharCode(lastCode++),
  STORE: String.fromCharCode(lastCode++),
  HAVE_MAX_EXTENSIONS: String.fromCharCode(lastCode++),
}
for (const key in CACHE) CACHE[key as keyof typeof CACHE] = key
export const AVAILABLE_EXTENSIONS_BY_CONTROLLER_LEVEL = [
  0, 5, 10, 20, 30, 40, 50, 60,
] as const
