declare type CreepRoles = 'miner' | 'hauler' | 'worker' | 'upgrader'
declare type JSONSerializable =
  | string
  | number
  | boolean
  | null
  | undefined
  | { [key: string]: JSONSerializable }
  | JSONSerializable[]
declare type CachedValue = {
  /** Key. If changed invalidates cache */
  k?: string
  /** Result, main cached value */
  r?: unknown
  /** How many ticks left till invalidated */
  t?: number
  /** Age. How much ticks persisted. For debug */
  a?: number
}
declare const Memory: {
  // === deafult ===
  creeps: Record<string, CreepMemory?>
  powerCreeps: Record<string, PowerCreepMemory?>
  flags: Record<string, FlagMemory?>
  rooms: Record<string, RoomMemory?>
  spawns: Record<string, SpawnMemory?>
  cache: Record<string, CachedValue?>
}
declare type CreepMemory = {
  role: CreepRoles
  /** [startPos,pathIndex,stuckTicks,nextPos?] */
  move?: [string, number, number, string?]
}
declare type FlagMemory = Record<string, unknown?>
declare type PowerCreepMemory = Record<string, unknown?>
declare type RoomMemory = {
  paths: Record<string, number?>
  [name: string]: unknown
}
declare type SpawnMemory = {
  spawning?: boolean
}
