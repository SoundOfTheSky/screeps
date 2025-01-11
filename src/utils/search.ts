export function isAlreadyCreepsOn(creep: Creep, cacheName: string, id: Id<_HasId>, limit = 1) {
  for (const creepName in Game.creeps)
    if (
      creep.name !== creepName,
      Memory.cache[`${cacheName}${Game.creeps[creepName].id}`]?.r
      === id && --limit === 0
    )
      return false
  return true
}
