import { DEFAULT_CACHE_TIMEOUT, MAX_AGE_REPORT, PATH_SCORE_MAX } from './consts'
import { unpackPos } from './graphs/pack'

export function useCache<T extends JSONSerializable>(
  primary: string,
  task: () => T,
  options?: { key?: string, ticks?: number },
) {
  let result = Memory.cache[primary]
  if (!result || result.k !== options?.key) {
    result = {
      r: task(),
    }
    if (options?.key) result.k = options.key
    if (options?.ticks) result.t = options.ticks
    Memory.cache[primary] = result
  }
  return result.r as T
}
export function tickCache() {
  for (const key in Memory.cache) {
    const value = Memory.cache[key]!
    if (value.t === undefined) value.t = DEFAULT_CACHE_TIMEOUT
    if (--value.t <= 0) delete Memory.cache[key]
    if (value.a === undefined) value.a = 0
    if (++value.a === MAX_AGE_REPORT)
      console.log('VERY OLD CACHE', value)
  }
  for (const roomName in Game.rooms) {
    if (!(roomName in Memory.rooms))
      Memory.rooms[roomName] = {
        paths: {},
      }
    const paths = Memory.rooms[roomName]!.paths
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
    else Memory.rooms[roomName]!.paths = {}
  }
  if (Game.time % 1000)
    for (const creepName in Memory.creeps)
      if (!(creepName in Game.creeps)) delete Memory.creeps[creepName]
}
