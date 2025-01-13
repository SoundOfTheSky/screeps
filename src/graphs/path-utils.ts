import { DIRECTION_DELTA, Pos } from './pos'

export function drawPathFromDirections(startPos: RoomPosition, path: DirectionConstant[]) {
  const pos: [number, number] = [startPos.x, startPos.y]
  const room = Game.rooms[startPos.roomName]
  for (let index = 0; index < path.length; index++) {
    const d = DIRECTION_DELTA[path[index]]
    const x = pos[0] + d[0]
    const y = pos[1] + d[1]
    room.visual.line(pos[0], pos[1], x, y)
    pos[0] = x
    pos[1] = y
  }
}

export function buildRoadForPath(
  start: RoomPosition,
  path: DirectionConstant[],
) {
  const room = Game.rooms[start.roomName]
  const pos = [start.x, start.y]
  room.createConstructionSite(pos[0], pos[1], STRUCTURE_ROAD)
  for (let index = 0; index < path.length; index++) {
    const d = DIRECTION_DELTA[path[index]]
    const x = pos[0] + d[0]
    const y = pos[1] + d[1]
    room.createConstructionSite(pos[0], pos[1], STRUCTURE_ROAD)
    pos[0] = x
    pos[1] = y
  }
}

export function getPosFromDirections(pos: Pos, path: DirectionConstant[]) {
  const result: Pos[] = [pos]
  let npos = pos
  for (let index = 0; index < path.length; index++) {
    const d = DIRECTION_DELTA[path[index]]
    npos = {
      x: npos.x + d[0],
      y: npos.y + d[1],
    }
    result.push(npos)
  }
  return result
}
