import { CREEP_STEP_PATH_BONUS, NAMES, PATH_SCORE_THRESHOLD } from '../../consts'
import {
  packRoomName,
  packRoomPosition,
  unpackRoomPosition,
} from '../../graphs/pack'
import { getPath } from '../../graphs/pathfinding'

function steppedOn(creep: Creep, posIndex: string) {
  const paths = Memory.rooms[creep.pos.roomName].paths
  paths[posIndex] = CREEP_STEP_PATH_BONUS + (paths[posIndex] ?? 0)
  if (paths[posIndex] >= PATH_SCORE_THRESHOLD)
    creep.pos.createConstructionSite(STRUCTURE_ROAD)
}

/**
 * Find and move near to.
 */
export default function $moveTo(creep: Creep, target: RoomPosition, range = 1) {
  // We are done
  const posIndex = packRoomPosition(creep.pos)
  if (creep.pos.inRangeTo(target, range)) {
    if (creep.memory.m) {
      delete creep.memory.m
      steppedOn(creep, posIndex)
    }
    return true
  }
  // Start pathfinding
  if (!creep.memory.m) creep.memory.m = [posIndex, 0, 0]
  const pathfinderPath = getPath(unpackRoomPosition(creep.memory.m[0]), target, range)
  // No path or wrong path???
  if (pathfinderPath.incomplete || pathfinderPath.path.length <= creep.memory.m[1]) {
    delete creep.memory.m
    return false
  }
  const nextPos = pathfinderPath.path[creep.memory.m[1] + 1]
  if (creep.pos.isEqualTo(nextPos)) {
    creep.memory.m[1]++
    creep.memory.m[2] = 0
    steppedOn(creep, posIndex)
  }
  else if (creep.memory.m[2] >= 3) {
    delete Memory.cache[
      `${NAMES.HAVE_MATRIX}${packRoomName(creep.pos.roomName)}`
    ]
    delete Memory.cache[
      `${NAMES.PATH}${creep.memory.m[0]}${packRoomPosition(target)}`
    ]
    delete creep.memory.m
    return $moveTo(creep, target, range)
  }
  Game.rooms[pathfinderPath.path[0].roomName].visual.poly(pathfinderPath.path.slice(creep.memory.m[1]))
  const direction = pathfinderPath.path[creep.memory.m[1]].getDirectionTo(pathfinderPath.path[creep.memory.m[1] + 1])
  // If have successful intent to move increase stuckTick count and expect new position
  if (creep.move(direction) === OK) creep.memory.m[2]++
}
