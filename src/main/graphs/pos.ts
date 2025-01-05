import { packPos, unpackPos } from './pack'

export type Pos = { x: number, y: number }
export type PosIndex = string
export const DIRECTION_DELTA = {
  [TOP]: [0, -1],
  [RIGHT]: [1, 0],
  [BOTTOM]: [0, 1],
  [LEFT]: [-1, 0],
  [TOP_RIGHT]: [1, -1],
  [BOTTOM_RIGHT]: [1, 1],
  [BOTTOM_LEFT]: [-1, 1],
  [TOP_LEFT]: [-1, -1],
} as const

export const size = 50
export const mapLength = size ** 2
export const getDistance = (pos1: Pos, pos2: Pos) =>
  Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2)
export const isNear = (pos1: Pos, pos2: Pos) =>
  Math.abs(pos1.x - pos2.x) < 2 && Math.abs(pos1.y - pos2.y) < 2
export function getDirections(pos1: Pos, pos2: Pos) {
  const directions: DirectionConstant[] = []
  if (pos2.y > pos1.y) directions.push(TOP)
  else if (pos2.y < pos1.y) directions.push(BOTTOM)
  if (pos2.x > pos1.x) directions.push(RIGHT)
  else if (pos2.x < pos1.x) directions.push(LEFT)
  return directions
}

export function getNeighbors(pos: Pos, neighbors: Pos[] = []) {
  for (let dx = -1; dx < 2; dx++)
    for (let dy = -1; dy < 2; dy++) {
      if (dx === 0 && dy === 0) continue
      const npos: Pos = { x: pos.x + dx, y: pos.y + dy }
      if (npos.x < 0 || npos.y < 0 || npos.x >= size || npos.y >= size) continue
      neighbors.push(npos)
    }
  return neighbors
}

export function getNeighborsPosIndex(index: PosIndex): PosIndex[] {
  return getNeighbors(unpackPos(index)).map(x => packPos(x))
}

export const isPosWalkable = (room: Room, pos: Pos) =>
  room
    .lookAt(pos.x, pos.y)
    .every(
      p =>
        !OBSTACLE_OBJECT_TYPES.includes(
          (p.structure?.structureType
            ?? p.constructionSite?.structureType
            ?? p.type) as (typeof OBSTACLE_OBJECT_TYPES)[0],
        ),
    )

export const isPosBuildable = (room: Room, pos: Pos) =>
  room
    .lookAt(pos.x, pos.y)
    .every(
      a =>
        a.type !== 'constructionSite'
        && a.type !== 'structure'
        && a.terrain !== 'wall',
    )

export const isPosRoad = (room: Room, pos: Pos) =>
  room
    .lookAt(pos.x, pos.y)
    .some(
      x =>
        x.structure?.structureType === 'road'
        || x.constructionSite?.structureType === 'road',
    )

export function convertPosPathToDirectionPath(path: Pos[]) {
  const directions: DirectionConstant[] = []
  for (let index = 0; index < path.length - 1; index++) {
    const pos1 = path[index]
    const pos2 = path[index + 1]
    if (pos2.y === pos1.y) {
      if (pos2.x > pos1.x) directions.push(RIGHT)
      else directions.push(LEFT)
    }
    else if (pos2.y > pos1.y) {
      if (pos2.x === pos1.x) directions.push(TOP)
      else if (pos2.x > pos1.x) directions.push(TOP_RIGHT)
      else directions.push(TOP_LEFT)
    }
    else {
      if (pos2.x === pos1.x) directions.push(BOTTOM)
      else if (pos2.x > pos1.x) directions.push(BOTTOM_RIGHT)
      else directions.push(BOTTOM_LEFT)
    }
  }
  return directions
}

export function findClosestObject<T extends { pos: RoomPosition }>(
  start: RoomPosition,
  objects: T[],
) {
  let min = Infinity
  let minSource: T | undefined
  for (let index = 0; index < objects.length; index++) {
    const x = objects[index]
    const distance = getDistance(start, x.pos)
    if (distance < min) {
      min = distance
      minSource = x
    }
  }
  return minSource
}
