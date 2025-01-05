import $moveNearTo from './$move-near-to'

export default function $upgradeController(creep: Creep) {
  if (!creep.room.controller || creep.store.getUsedCapacity('energy') === 0) return false
  creep.say('🆙')
  const _nearTo = $moveNearTo(creep, creep.room.controller.pos)
  if (!_nearTo) return _nearTo
  if (creep.upgradeController(creep.room.controller) !== OK) return false
}
