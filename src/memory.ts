import { JSONSerializable } from '@softsky/utils'

import { DEFAULT_CACHE_TIMEOUT, MEMORY_VALIDATE_INTERVAL, PATH_SCORE_MAX } from './consts'
import { unpackPos } from './graphs/pack'

const memory = Memory
/* eslint-disable unicorn/prefer-global-this */
export function useCache<T extends JSONSerializable>(
  primary: string,
  task: () => T,
  ticks?: number,
  key?: string,
) {
  let result = Memory.cache[primary]
  if (!result || result.k !== key) {
    result = {
      r: task(),
      t: ticks ?? DEFAULT_CACHE_TIMEOUT,
      k: key,
    }
    Memory.cache[primary] = result
  }
  return result.r as T
}

export function tickMemory() {
  // @ts-expect-error Don't work on global
  delete global.Memory
  // @ts-expect-error Don't work on global
  global.Memory = memory

  // Cache
  for (const key in Memory.cache)
    if (--Memory.cache[key]!.t <= 0) delete Memory.cache[key]
  tickRooms()
  tickCreeps()
}

function tickCreeps() {
  // Delete memory of dead screeps, if they have tasks, free them
  if (Game.time % MEMORY_VALIDATE_INTERVAL)
    for (const creepName in Memory.creeps)
      if (!(creepName in Game.creeps)) {
        // for (const task of Memory.creeps[creepName].t)
        //   freeTask(task)
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

// === Protobuf works ===

// export function saveMemory() {
//   const data = MemoryRoot.encode(memory).finish()
//   // If last byte is halved first letter is 1
//   let encoded = data.length % 2 === 0 ? '0' : '1'
//   for (let index = 0; index < data.length; index += 2)
//     encoded += String.fromCharCode(data[index] << 8 | data[index + 1])
//   RawMemory.set(encoded)
// }
// export function loadMemory() {
//   const encoded = RawMemory.get()
//   if (!encoded || encoded[0] === '{') return createMemory()
//   // If last byte is halved first letter is 1
//   const isLastIsHalf = encoded[0] === '1'
//   const binaryArray = new Uint8Array((encoded.length - 1) * 2 - (isLastIsHalf ? 1 : 0))
//   for (let index = 1, doubleIndex = 0; index < encoded.length; index++, doubleIndex += 2) {
//     const number_ = encoded.charCodeAt(index)
//     binaryArray[doubleIndex] = number_ >> 8
//     const nextIndex = doubleIndex + 1
//     // If next index is out of bounds don't save
//     if (nextIndex !== binaryArray.length)
//       binaryArray[nextIndex] = number_ & 0xFF
//   }
//   return MemoryRoot.decode(binaryArray)
// }
