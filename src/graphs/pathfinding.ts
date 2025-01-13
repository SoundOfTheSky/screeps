import { NAMES, PATHFINDER_TIMEOUT } from '../consts'
import { useCache } from '../memory'

import { packMatrix, packPathfinderPath, packRoomName, packRoomPosition, unpackMatrix, unpackPathfinderPath } from './pack'
import { PosIndex } from './pos'

type AStarNode = {
  /** Pos */
  d: PosIndex
  /** Weight */
  g: number
  /** Heuristic */
  h: number
  /** Parent */
  p?: AStarNode
}

export function aStar(options: {
  start: PosIndex
  getWeight: (p: PosIndex) => number
  heuristic: (p: PosIndex) => number
  getNeighbors: (p: PosIndex) => PosIndex[]
  isTarget: (p: PosIndex) => boolean
}): PosIndex[] | undefined {
  const checked = new Set<PosIndex>()
  checked.add(options.start)
  const queue: AStarNode[] = [
    {
      d: options.start,
      g: 0,
      h: options.heuristic(options.start),
    },
  ]
  while (queue.length > 0) {
    const node = queue.pop()!
    // console.log(unpackPos(node.d), options.isTarget(node.d));
    if (options.isTarget(node.d)) {
      const result: PosIndex[] = []
      let n: AStarNode | undefined = node
      while (n) {
        result.push(n.d)
        n = n.p
      }
      return result.reverse()
    }
    const neighbors = options.getNeighbors(node.d)
    for (let index = 0; index < neighbors.length; index++) {
      const neighbor = neighbors[index]
      if (checked.has(neighbor)) continue
      checked.add(neighbor)
      const neighborNode: AStarNode = {
        d: neighbor,
        p: node,
        g: node.g + options.getWeight(neighbor),
        h: options.heuristic(neighbor),
      }
      neighborNode.h += node.g
      // Find there to put so array is kept sorted
      for (let index = 0; index <= queue.length; index++) {
        const node = queue[index] as AStarNode | undefined
        if (!node) {
          queue.push(neighborNode)
          break
        }
        if (neighborNode.h > node.h) {
          queue.splice(index, 0, neighborNode)
          break
        }
      }
    }
  }
}

export function bfs(options: {
  start: PosIndex
  getNeighbors: (parent: PosIndex) => PosIndex[]
  isTarget?: (child: PosIndex, parent: PosIndex) => boolean
}): {
    parents: Map<PosIndex, PosIndex>
    target?: PosIndex
  } {
  const queue: PosIndex[] = [options.start]
  const parents = new Map<PosIndex, PosIndex>()
  while (queue.length > 0) {
    const parent = queue.shift()!
    const neighbors = options.getNeighbors(parent)
    for (let index = 0; index < neighbors.length; index++) {
      const neighbor = neighbors[index]
      if (neighbor === options.start || parents.has(neighbor)) continue
      parents.set(neighbor, parent)
      if (options.isTarget?.(neighbor, parent))
        return {
          target: neighbor,
          parents,
        }
      queue.push(neighbor)
    }
  }
  return {
    parents,
  }
}

export function getPath(
  start: RoomPosition,
  end: RoomPosition,
  range = 1,
  options: PathFinderOpts = {},
) {
  // Find path in cache
  const key = `${NAMES.PATH}${packRoomPosition(start)}${packRoomPosition(end)}`
  const cache = Memory.cache[key]
  if (cache) return unpackPathfinderPath(cache.r as string)
  // Find path
  const result = PathFinder.search(start, { pos: end, range }, {
    plainCost: 2,
    swampCost: 10,
    roomCallback(roomName) {
      const encodedMatrix = useCache(`${NAMES.HAVE_MATRIX}${packRoomName(roomName)}`, () => buildCostMatrixForRoom(roomName))
      if (encodedMatrix === undefined) return false
      return unpackMatrix(encodedMatrix)
    },
    ...options,
  })
  Memory.cache[key] = {
    r: packPathfinderPath(result),
    t: PATHFINDER_TIMEOUT,
  }
  return result
}

export function buildCostMatrixForRoom(roomName: string) {
  console.log(`[${roomName}] Building room matrix...`)
  const room = Game.rooms[roomName] as Room | undefined
  if (!room) return
  const matrix = new PathFinder.CostMatrix()
  for (const struct of room.find(FIND_STRUCTURES)) {
    if (struct.structureType === STRUCTURE_ROAD) matrix.set(struct.pos.x, struct.pos.y, 1)
    else if (struct.structureType !== STRUCTURE_CONTAINER
      && (struct.structureType !== STRUCTURE_RAMPART
        || !struct.my))
      matrix.set(struct.pos.x, struct.pos.y, 0xFF)
  }
  for (const creep of room.find(FIND_CREEPS))
    if (!creep.memory.m)
      matrix.set(creep.pos.x, creep.pos.y, 0xFF)
  return packMatrix(matrix)
}

export function getDirectionsFromPath(path: RoomPosition[]) {
  let lastPos = path[0]
  const directions = new Array(path.length - 1)
  for (let index = 0; index < path.length; index++) {
    const pos = path[index]
    directions[index] = lastPos.getDirectionTo(pos)
    lastPos = pos
  }
  return directions as DirectionConstant[]
}
