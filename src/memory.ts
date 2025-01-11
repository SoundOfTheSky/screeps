import { DEFAULT_CACHE_TIMEOUT, MEMORY_VALIDATE_INTERVAL, PATH_SCORE_MAX } from './consts'
import { unpackPos } from './graphs/pack'
import { freeTask } from './tasks/tasks'

import type { JSONSerializable } from '@softsky/utils'

if (!Memory.id) Memory.id = 0
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (!Memory.cache) Memory.cache = {}
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (!Memory.rooms) Memory.rooms = {}

export function useCache<T extends JSONSerializable>(
  primary: string,
  task: () => T,
  options?: { k?: string, t?: number },
) {
  let result = Memory.cache[primary]
  if (!result || result.k !== options?.k) {
    result = {
      r: task(),
      t: options?.t ?? DEFAULT_CACHE_TIMEOUT,
      k: options?.k,
    }
    Memory.cache[primary] = result
  }
  return result.r as T
}
export function tickMemory() {
  // Cache
  for (const key in Memory.cache) {
    if (--Memory.cache[key]!.t <= 0) delete Memory.cache[key]
  }
  tickRooms()
  tickCreeps()
}
function tickCreeps() {
  // Delete memory of dead screeps, if they have tasks, free them
  if (Game.time % MEMORY_VALIDATE_INTERVAL)
    for (const creepName in Memory.creeps)
      if (!(creepName in Game.creeps)) {
        for (const task of Memory.creeps[creepName].t)
          freeTask(task)
        delete Memory.creeps[creepName]
      }
}
function tickRooms() {
  for (const roomName in Game.rooms) {
    if (!(roomName in Memory.rooms))
      Memory.rooms[roomName] = {
        paths: {},
      }
    const paths = Memory.rooms[roomName].paths
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (paths) {
      for (const index in paths) {
        if (paths[index]! > PATH_SCORE_MAX) paths[index] = PATH_SCORE_MAX
        else if (--paths[index]! <= 0) {
          delete paths[index]
          const pos = unpackPos(index)
          const look = Game.rooms[roomName].lookAt(pos.x, pos.y)
          for (let index = 0; index < look.length; index++) {
            const x = look[index]
            if (x.constructionSite?.structureType === 'road') x.constructionSite.remove()
            else if (x.structure?.structureType === 'road') x.structure.destroy()
          }
        }
      }
    }
    else Memory.rooms[roomName].paths = {}
  }
}
