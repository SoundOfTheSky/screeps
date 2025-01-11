/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { JSONSerializable } from '@softsky/utils'

declare global {
  type CachedValue = {
    /** How many ticks left till invalidated */
    t: number
    /** Key. If changed invalidates cache */
    k?: string
    /** Result, main cached value */
    r?: JSONSerializable
  }
  type Task<T extends JSONSerializable = JSONSerializable, C extends Task[] = Task[]> = {
    /** Id */
    i: string
    /** Priority */
    p: number
    /** Name */
    n: string
    /** Timeout */
    t: number
    /** Parent */
    r?: number
    /** Children */
    c?: C
    /** Data associated with task */
    d: T
  }
  interface Memory {
    // === deafult ===
    id: number
    tasks: Task[]
    cache: Record<string, CachedValue | undefined>
    profiler: Record<string, [number, number]>
  }
  interface CreepMemory {
    /** Tasks */
    t: Task[]
    /** move [startPos,pathIndex,stuckTicks,nextPos?] */
    m?: [string, number, number, string?]
    /** Give way [direction, stun] */
    w?: [number, number]

  }
  interface RoomMemory {
    paths: Record<string, number | undefined>
  }
  interface SpawnMemory {
    spawning?: boolean
  }
}
export { }
