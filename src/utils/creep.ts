import { getNextId } from '.'

export type CreepLayout = Partial<Record<BodyPartConstant, number>>

export function findCreepByLayout(room: Room, layout: CreepLayout) {
  creep: for (const creepName in Game.creeps) {
    const creep = Game.creeps[creepName]
    if (creep.room.name !== room.name) continue
    for (const key in layout)
      if (creep.getActiveBodyparts(key as BodyPartConstant) !== layout[key as BodyPartConstant]) continue creep
    return creep
  }
}

export function getBestAvailableCreepLayout(room: Room, ratio: CreepLayout, maxMult = Infinity) {
  const availableEnergy = room.energyCapacityAvailable
  let multiplier = 1
  let lastLayout: CreepLayout | undefined
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (true) {
    const layout: CreepLayout = {}
    for (const type in ratio)
      layout[type as BodyPartConstant] = Math.ceil(ratio[type as BodyPartConstant]! * multiplier)
    if (availableEnergy < calcCreepLayoutPrice(layout) || multiplier === maxMult) return lastLayout
    lastLayout = layout
    multiplier++
  }
}

export function calcCreepLayoutPrice(layout: CreepLayout) {
  let sum = 0
  let parts = 0
  for (const type in layout) {
    sum += BODYPART_COST[type as BodyPartConstant] * layout[type as BodyPartConstant]!
    parts += layout[type as BodyPartConstant]!
    if (parts > 50) return Infinity
  }
  return sum
}

export function creepLayoutToArray(layout: CreepLayout) {
  const parts: BodyPartConstant[] = []
  for (const key in layout)
    for (let index = 0; index < layout[key as BodyPartConstant]!; index++)
      parts.push(key as BodyPartConstant)
  return parts
}

export function creepLayoutFromParts(parts: BodyPartConstant[]) {
  const layout: CreepLayout = {}
  for (const part of parts)
    layout[part] = (layout[part] ?? 0) + 1
  return layout
}

export function spawnCreep(room: Room, layout: CreepLayout, name = getNextId(), options?: SpawnOptions) {
  for (const spawnName in Game.spawns) {
    const spawn = Game.spawns[spawnName]
    if (spawn.spawning || spawn.room.name !== room.name) continue
    if (spawn.spawnCreep(creepLayoutToArray(layout), name, options) === OK)
      return name
  }
}
