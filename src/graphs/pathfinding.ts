import { NAMES, ROOM_MATRIX_TIMEOUT, ROOM_PATH_TIMEOUT } from '../consts'

import { packRoomName, packRoomPosition } from './pack'
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

/**
 * Returns directions to path.
 */
export function getPath(
  start: RoomPosition,
  end: RoomPosition,
  options: FindPathOpts = {},
): DirectionConstant[] | undefined {
  // Find path in cache
  const key = `${NAMES.PATH}${packRoomPosition(start)}${packRoomPosition(end)}`
  const cache = Memory.cache[key]
  if (cache) return [...(cache.r as string)].map(x => +x as DirectionConstant)

  // If no custom costCallback set, use cached matrix or generate one
  if (!options.costCallback) {
    const matrixKey = `${NAMES.HAVE_MATRIX}${packRoomName(start.roomName)}`
    let matrix = Memory.cache[matr ixKey]?.r as number[] | undefined
    if (!matrix) {
      matrix = buildCostMatrixForRoom(Game.rooms[start.roomName]).serialize()
      Memory.cache[matrixKey] = {
        r: matrix,
        t: ROOM_MATRIX_TIMEOUT,
      }
    }
    options.costCallback = () => PathFinder.CostMatrix.deserialize(matrix)
  }

  // Find path
  PathFinder.search(start, { pos: end, range: 1 }, {
    plainCost: 2,
    swampCost: 10,
    roomCallback(roomName) {
      const room = Game.rooms[roomName] as Room | undefined
      if (!room) return
      const costs = new PathFinder.CostMatrix()
      for (const struct of room.find(FIND_STRUCTURES)) {
        if (struct.structureType === STRUCTURE_ROAD) {
          // Favor roads over plain tiles
          costs.set(struct.pos.x, struct.pos.y, 1)
        }
        else if (struct.structureType !== STRUCTURE_CONTAINER
          && (struct.structureType !== STRUCTURE_RAMPART
            || !struct.my)) {
          // Can't walk through non-walkable buildings
          costs.set(struct.pos.x, struct.pos.y, 0xFF)
        }
      }

      // Avoid creeps in the room
      for (const creep of room.find(FIND_CREEPS)) {
        costs.set(creep.pos.x, creep.pos.y, 0xFF)
      }

      return costs
    },
  })
  const result = start.findPathTo(end, options).map(p => p.direction)
  Memory.cache[key] = {
    k: '',
    r: result.join(''),
    t: ROOM_PATH_TIMEOUT,
  }
  return result
}

export function buildCostMatrixForRoom(room: Room) {
  console.log(`[${room.name}] Building room matrix...`)
  const matrix = new PathFinder.CostMatrix()
  const terrain = room.getTerrain()
  for (let x = 0; x < 50; x++)
    for (let y = 0; y < 50; y++) {
      const terra = terrain.get(x, y)
      // If wall, dont change
      if (terra === 1) continue
      // If exit set as really unpreferrable
      if (x === 0 || y === 0) {
        matrix.set(x, y, 50)
        continue
      }
      const look = room.lookAt(x, y)
      // If obstacle set as unwalkable, skip creeps
      if (
        look.some(
          p =>
            p.type !== 'creep'
            && OBSTACLE_OBJECT_TYPES.includes(
              (p.structure?.structureType
                ?? p.constructionSite?.structureType
                ?? p.type) as (typeof OBSTACLE_OBJECT_TYPES)[0],
            ),
        )
      )
        matrix.set(x, y, 255)
      // If not moving creep set as unpreferrable
      else if (
        look.some(x => x.creep && !x.creep.spawning && (!x.creep.my || !x.creep.memory.m))
      )
        matrix.set(x, y, 250)
      // If road or construction of road
      else if (
        look.some(
          x =>
            x.structure?.structureType === 'road'
            || x.constructionSite?.structureType === 'road',
        )
      )
        matrix.set(x, y, 1)
      // If swamp set to 10, if plain 2
      else matrix.set(x, y, terra === 2 ? 10 : 2)
    }
  return matrix
}
