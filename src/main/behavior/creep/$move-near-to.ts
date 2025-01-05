import { CACHE, CREEP_STEP_PATH_BONUS, PATH_SCORE_THRESHOLD } from 'main/consts'
import {
  packRoomName,
  packRoomPosition,
  unpackRoomPosition,
} from 'main/graphs/pack'
import { drawPath } from 'main/graphs/path-utils'
import { getPath } from 'main/graphs/pathfinding'
import { DIRECTION_DELTA } from 'main/graphs/pos'

function steppedOn(creep: Creep, posIndex: string) {
  const paths = Memory.rooms[creep.pos.roomName]!.paths
  paths[posIndex] = CREEP_STEP_PATH_BONUS + (paths[posIndex] ?? 0)
  if (paths[posIndex] >= PATH_SCORE_THRESHOLD)
    creep.pos.createConstructionSite(STRUCTURE_ROAD)
}

/**
 * Find and move near to.
 */
export default function $moveNearTo(creep: Creep, target: RoomPosition) {
  // We are done
  const posIndex = packRoomPosition(creep.pos)
  if (creep.pos.isNearTo(target)) {
    if (creep.memory.move) {
      delete creep.memory.move
      steppedOn(creep, posIndex)
    }
    return true
  }
  if (!creep.memory.move) creep.memory.move = [posIndex, 0, 0]
  const path = getPath(unpackRoomPosition(creep.memory.move[0]), target)
  // No path or wrong path???
  if (!path || path.length <= creep.memory.move[1]) {
    delete creep.memory.move
    return false
  }

  // Expecting to be somewhere
  if (creep.memory.move[3]) {
    // If we are actually where we should increase index, drop stuckTicks, add path score
    if (creep.memory.move[3] === posIndex) {
      creep.memory.move[1] += 1
      creep.memory.move[2] = 0
      // eslint-disable-next-line @typescript-eslint/no-array-delete
      delete creep.memory.move[3]
      steppedOn(creep, posIndex)
    }
    // If not, clear room matrix cache and path cache and retry pathfinding without them
    else if (creep.memory.move[2] >= 3) {
      // SCARY!
      console.log('Rebuild room matrix. Cause: Creep stuck')
      delete Memory.cache[
        `${CACHE.HAVE_MATRIX}${packRoomName(creep.pos.roomName)}`
      ]
      delete Memory.cache[
        `${CACHE.PATH}${creep.memory.move[0]}${packRoomPosition(target)}`
      ]
      delete creep.memory.move
      return $moveNearTo(creep, target)
    }
  }
  drawPath(creep.pos, path.slice(creep.memory.move[1]))
  const direction = path[creep.memory.move[1]]
  // If have successful intent to move increase stuckTick count and expect new position
  if (creep.move(direction) === OK) {
    creep.memory.move[2] += 1
    const delta = DIRECTION_DELTA[direction]
    creep.memory.move[3] = packRoomPosition(
      new RoomPosition(
        creep.pos.x + delta[0],
        creep.pos.y + delta[1],
        creep.pos.roomName,
      ),
    )
  }
}
