import { packPos, unpackPos } from './pack'
import { aStar } from './pathfinding'
import {
  Pos,
  PosIndex,
  getNeighbors,
  isPosBuildable,
  isPosRoad,
} from './pos'

const StructureInitial = {
  L: STRUCTURE_LAB,
  I: STRUCTURE_LINK,
  S: STRUCTURE_SPAWN,
  B: STRUCTURE_STORAGE,
  N: STRUCTURE_NUKER,
  F: STRUCTURE_FACTORY,
  T: STRUCTURE_TERMINAL,
  E: STRUCTURE_EXTENSION,
  R: STRUCTURE_ROAD,
} as const

type Template = {
  width: number
  height: number
  ports: Pos[]
  structures: (Pos & {
    structure: (typeof StructureInitial)[keyof typeof StructureInitial] | undefined
  })[]
}

const Templates = {
  main: () => ({
    ...parseTemplate(`FNS
BRI
TSR`),
    getBuildPlan(room: Room, pos: Pos) {
      return getBuildPlanForTemplate(this, room, pos)
    },
  }),
  labs1: () => ({
    ...parseTemplate(`0LLR
LLRL
LRLL
RLL0`),
    getBuildPlan(room: Room, pos: Pos) {
      return getBuildPlanForTemplate(this, room, pos)
    },
  }),
  labs2: () => ({
    ...parseTemplate(`RLL0
LRLL
LLRL
0LLR`),
    getBuildPlan(room: Room, pos: Pos) {
      return getBuildPlanForTemplate(this, room, pos)
    },
  }),
  ext1: () => ({
    ...parseTemplate(`RE0
ERE
0ER`),
    getBuildPlan(room: Room, pos: Pos) {
      return getBuildPlanForTemplate(this, room, pos)
    },
  }),
  ext2: () => ({
    ...parseTemplate(`0ER
ERE
RE0`),
    getBuildPlan(room: Room, pos: Pos) {
      return getBuildPlanForTemplate(this, room, pos)
    },
  }),
} as const

function parseTemplate(text: string) {
  const t = text.split('\n') as unknown as (keyof typeof StructureInitial)[][]
  const template: Template = {
    width: t[0].length,
    height: t.length,
    structures: [],
    ports: [],
  }
  for (let x = 0; x < template.width; x++)
    for (let y = 0; y < template.height; y++) {
      const structure = StructureInitial[t[y][x]]
      template.structures.push({ x, y, structure })
      if (
        structure === STRUCTURE_ROAD
        && (x === 0
          || y === 0
          || x === template.width - 1
          || y === template.height - 1)
      )
        template.ports.push({ x, y })
    }
  if (template.ports.length === 0) template.ports.push({ x: 0, y: 0 })
  return template
}

function getBuildPlanForTemplate(
  template: Template,
  room: Room,
  pos: Pos,
): Template['structures'] | undefined {
  // if (pos.x === 23 && pos.y === 16) debugger
  port: for (let index = 0; index < template.ports.length; index++) {
    const portPos = template.ports[index]
    let identical = 0
    for (let index2 = 0; index2 < template.structures.length; index2++) {
      const build = template.structures[index2]
      const look = room.lookAt(pos.x - portPos.x + build.x, pos.y - portPos.y + build.y)
      for (let index3 = 0; index3 < look.length; index3++) {
        const x = look[index3]
        const structure = x.constructionSite?.structureType ?? x.structure?.structureType
        if (x.terrain === 'wall') continue port
        if (build.structure === structure) identical++
        else if (!!build.structure === !!structure)
          continue port
      }
    }
    if (identical === template.structures.length) continue port
    return template.structures.map(s => ({
      x: pos.x - portPos.x + s.x,
      y: pos.y - portPos.y + s.y,
      structure: s.structure,
    }))
  }
}

export function findPlaceToBuildTemplate(
  room: Room,
  start: PosIndex,
  templateNames: (keyof typeof Templates)[],
) {
  const templates = templateNames.map(key => Templates[key]())
  const buildPlan: Template['structures'] = []
  const terrain = room.getTerrain()
  const path = aStar({
    start,
    getNeighbors: a => getNeighbors(unpackPos(a))
      .filter(neighbor =>
        terrain.get(neighbor.x, neighbor.y) !== 1,
      ).map(x => packPos(x)),
    // Basically turning this in Dijkstra
    heuristic: () => 0,
    isTarget(index) {
      const pos = unpackPos(index)
      for (let index = 0; index < templates.length; index++) {
        const buildable = templates[index].getBuildPlan(room, pos)
        if (buildable) {
          console.log('building', pos.x, pos.y)
          buildPlan.push(...buildable)
          return true
        }
      }
      return false
    },
    // Prefer roads
    getWeight: index => (isPosRoad(room, unpackPos(index)) ? 1 : 10),
  })
  if (path) {
    // Add roads if there is any needed
    buildPlan.push(
      ...path
        .slice(1, -1)
        .map(unpackPos)
        .filter(pos => isPosBuildable(room, pos))
        .map(pos => ({ ...pos, structure: STRUCTURE_ROAD })),
    )
    return buildPlan
  }
}
