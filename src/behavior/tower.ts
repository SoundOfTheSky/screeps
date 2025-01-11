export function $tower(actor: StructureTower | Creep) {
  return $heal(actor) || $repair(actor) || $attack(actor)
}
/**
 * Will try to repair closest target
 */
export function $repair(actor: StructureTower | Creep) {
  const target = actor.pos.findClosestByRange(FIND_STRUCTURES, {
    filter: x => x.hits < x.hitsMax,
  })
  return !!target && actor.repair(target) === OK
}
/**
 * Will try to heal closest target
 */
export function $heal(actor: StructureTower | Creep) {
  const target = actor.pos.findClosestByRange(FIND_CREEPS, {
    filter: x => x.hits < x.hitsMax,
  })
  return !!target && actor.heal(target) === OK
}
/**
 * Will try to attack closest target
 */
export function $attack(actor: StructureTower | Creep) {
  const target = actor.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
  return !!target && actor.attack(target) === OK
}
