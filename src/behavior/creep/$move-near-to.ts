import { CREEP_STEP_PATH_BONUS, NAMES, PATH_SCORE_THRESHOLD } from '../../consts'
import {
  packRoomName,
  packRoomPosition,
  unpackRoomPosition,
} from '../../graphs/pack'
import { drawPath } from '../../graphs/path-utils'
import { getPath } from '../../graphs/pathfinding'
import { DIRECTION_DELTA } from '../../graphs/pos'

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
    if (creep.memory.m) {
      delete creep.memory.m
      steppedOn(creep, posIndex)
    }
    return true
  }
  if (!creep.memory.m) creep.memory.m = [posIndex, 0, 0]
  const path = getPath(unpackRoomPosition(creep.memory.m[0]), target)
  // No path or wrong path???
  if (!path || path.length <= creep.memory.m[1]) {
    delete creep.memory.m
    return false
  }

  // Expecting to be somewhere
  if (creep.memory.m[3]) {
    // If we are actually where we should increase index, drop stuckTicks, add path score
    if (creep.memory.m[3] === posIndex) {
      creep.memory.m[1] += 1
      creep.memory.m[2] = 0
      // eslint-disable-next-line @typescript-eslint/no-array-delete
      delete creep.memory.m[3]
      steppedOn(creep, posIndex)
    }
    // If not, clear room matrix cache and path cache and retry pathfinding without them
    else if (creep.memory.m[2] >= 3) {
      // SCARY!
      console.log('Rebuild room matrix. Cause: Creep stuck')
      delete Memory.cache[
        `${NAMES.HAVE_MATRIX}${packRoomName(creep.pos.roomName)}`
      ]
      delete Memory.cache[
        `${NAMES.PATH}${creep.memory.m[0]}${packRoomPosition(target)}`
      ]
      delete creep.memory.m
      return $moveNearTo(creep, target)
    }
  }
  drawPath(creep.pos, path.slice(creep.memory.m[1]))
  const direction = path[creep.memory.m[1]]
  // If have successful intent to move increase stuckTick count and expect new position
  if (creep.move(direction) === OK) {
    creep.memory.m[2] += 1
    const delta = DIRECTION_DELTA[direction]
    creep.memory.m[3] = packRoomPosition(
      new RoomPosition(
        creep.pos.x + delta[0],
        creep.pos.y + delta[1],
        creep.pos.roomName,
      ),
    )
  }
}
