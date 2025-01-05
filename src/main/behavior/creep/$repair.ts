import { CACHE } from 'main/consts'
import { isAlreadyCreepsOn } from 'main/utils/search'

import $findGoAction from './$find-go-action'

export default function $repair(creep: Creep) {
  if (creep.store.getUsedCapacity('energy') === 0) return false
  return $findGoAction<Structure>(
    creep,
    CACHE.REPAIR,
    () =>
      creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: x => x.hits < x.hitsMax && isAlreadyCreepsOn(creep, CACHE.REPAIR, x.id),
      })?.id,
    target => creep.repair(target) === OK,
    {
      say: '🛠️',
    },
  )
}
