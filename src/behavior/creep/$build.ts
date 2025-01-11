import { NAMES } from '../../consts'
import { isAlreadyCreepsOn } from '../../utils/search'

import $findGoAction from './$find-go-action'

export default function $build(creep: Creep) {
  if (creep.store.getUsedCapacity('energy') === 0) return false
  return $findGoAction<ConstructionSite>(
    creep,
    NAMES.BUILD,
    () => creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, { filter: x => isAlreadyCreepsOn(creep, NAMES.BUILD, x.id) })?.id,
    target => (creep.build(target) === OK ? undefined : false),
    {
      say: '🏗️',
    },
  )
}
