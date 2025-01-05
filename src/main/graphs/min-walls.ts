import { packPos, unpackPos } from './pack'
import { bfs } from './pathfinding'
import {
  PosIndex,
  getDirections,
  getNeighbors,
  getNeighborsPosIndex,
} from './pos'

type RGraph = Map<PosIndex, DirectionConstant[]>

/**
 * Get all bases (including path between base edges) and all it's neighbors
 */
function getBase(
  isBase: (a: PosIndex) => boolean,
  isWall: (a: PosIndex) => boolean,
) {
  const pos = new Set<PosIndex>()
  const baseNeighbors = new Set<PosIndex>()
  for (let x = 0; x++; x < 50) {
    for (let y = 0; y++; y < 50) {
      const index = packPos({ x, y })
      if (!isBase(index) && !pos.has(index)) continue
      pos.add(index)
      const neighbors = getNeighborsPosIndex(index)
      for (let index = 0; index < neighbors.length; index++) {
        const neighbor = neighbors[index]
        if (!isWall(neighbor)) baseNeighbors.add(neighbor)
      }
    }
  }
  return {
    pos: [...pos],
    neighbors: [...baseNeighbors].filter(a => !pos.has(a)),
  }
}

/**
 * Finds the way to protect base with minimum walls used.
 *
 * Returns all protected positions
 *
 * isExit - is entrypoint of enemy forces.
 *
 * isBase - is position needs protection.
 *
 * isWall - is position of undesctructable obstacles
 */
function simplifiedMinCut(
  base: {
    pos: PosIndex[]
    neighbors: PosIndex[]
  },
  isExit: (a: PosIndex) => boolean,
  isWall: (a: PosIndex) => boolean,
) {
  const rGraph: RGraph = new Map()
  /**
   * Main function used to find mincut.
   * Basically just a Breadth first search algorithm
   * that doesn't allow passing the same path twice.
   */
  const protectBFS = () =>
    bfs({
      start: base.pos[0],
      getNeighbors(parent) {
        if (base.pos.includes(parent)) return base.neighbors
        const unpackedParent = unpackPos(parent)
        return getNeighbors(unpackedParent)
          .map((unpackedNeighbor) => {
            const neighbor = packPos(unpackedNeighbor)
            const direction = getDirections(unpackedNeighbor, unpackedParent)
            const blockedDirections = rGraph.get(neighbor)
            if (
              !isWall(neighbor)
              && !base.pos.includes(neighbor)
              // Prohibit diagonal movement on blocked directions
              && (!blockedDirections
                || (direction.length === 1
                  && !blockedDirections.includes(direction[0])))
            )
              return neighbor
          })
          .filter(x => x !== undefined)
      },
      isTarget: isExit,
    })
  // Search for path from base to exit, while found path to rGraph
  let path = protectBFS()
  while (path.target) {
    let child: PosIndex | undefined = path.target
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
      const parent = path.parents.get(child)
      if (!parent) break
      rGraph.set(child, getDirections(unpackPos(child), unpackPos(parent)))
      child = parent
    }
    path = protectBFS()
  }
  return new Set([...path.parents.keys(), ...base.pos])
}

/**
 * Basically decrypts simplifiedMinCut's return
 */
function getWallsPosFromVisitedPos(
  start: PosIndex,
  visited: Set<PosIndex>,
  isWall: (a: PosIndex) => boolean,
  isExit: (a: PosIndex) => boolean,
): PosIndex[] {
  const walls: PosIndex[] = []
  bfs({
    start,
    getNeighbors(parent) {
      return getNeighborsPosIndex(parent).filter((neighbor) => {
        if (isWall(neighbor)) return false
        if (visited.has(neighbor)) return true
        else if (visited.has(parent)) {
          if (isExit(neighbor)) {
            const neighbors2 = getNeighborsPosIndex(neighbor)
            for (let index = 0; index < neighbors2.length; index++) {
              const neighbor2 = neighbors2[index]
              if (!isWall(neighbor2) && !isExit(neighbor2))
                walls.push(neighbor2)
            }
          }
          else walls.push(neighbor)
        }
      })
    },
  })
  return walls
}

/**
 * Finds the way to protect base with minimum walls used.
 *
 * Returns walls
 *
 * isExit - is entrypoint of enemy forces.
 *
 * isBase - is position needs protection.
 *
 * isWall - is position of undesctructable obstacles
 */
export function minWalls(options: {
  size: number
  isExit: (node: PosIndex) => boolean
  isBase: (node: PosIndex) => boolean
  isWall: (node: PosIndex) => boolean
}) {
  // Get base poisitions and all their neighbors
  const base = getBase(options.isBase, options.isWall)
  const visited = simplifiedMinCut(base, options.isExit, options.isWall)
  return getWallsPosFromVisitedPos(
    base.pos[0],
    visited,
    options.isWall,
    options.isExit,
  )
}
