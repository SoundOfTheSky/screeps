/* eslint-disable unicorn/prefer-code-point */
// === Timeouts ===
export const MEMORY_VALIDATE_INTERVAL = 3600
export const ROOM_RESCAN_INTERVAL = 3600
export const ROOM_PATH_TIMEOUT = 3600
export const ROOM_MATRIX_TIMEOUT = 3600
export const DEFAULT_CACHE_TIMEOUT = 600
export const BEHAVIOR_CACHE_TIMEOUT = 3600
export const DEFAULT_TASK_TIMEOUT = 7200

// === Priority ===
export const HARVEST_ENERGY_PRIORITY = 10

export const CREEP_STEP_PATH_BONUS = 600
export const PATH_SCORE_THRESHOLD = 6000
export const PATH_SCORE_MAX = 9999

let lastCode = 65
export const NAMES = {
  // TASKS
  HARVEST_SOURCE: String.fromCharCode(lastCode++),

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
for (const key in NAMES) NAMES[key as keyof typeof NAMES] = key
export const AVAILABLE_EXTENSIONS_BY_CONTROLLER_LEVEL = [
  0, 5, 10, 20, 30, 40, 50, 60,
] as const
