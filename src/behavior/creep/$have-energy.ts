import { NAMES } from '../../consts'
import { findClosestObject } from '../../graphs/pos'
import { isAlreadyCreepsOn } from '../../utils/search'

import $findGoAction from './$find-go-action'

export default function $haveEnergy(creep: Creep, amount = 10) {
  const have = creep.store.getUsedCapacity('energy')
  const max = creep.store.getCapacity('energy')
  if (max < amount) return false
  const needed = amount - have
  return $findGoAction<Source | Resource<'energy'>>(
    creep,
    NAMES.HAVE_ENERGY,
    () => {
      if (have >= amount) return
      let found: (Resource<RESOURCE_ENERGY> | Source)[] = creep.room
        .lookForAtArea('energy', 0, 0, 49, 49, true)
        .filter(x => x.energy.amount + 50 >= needed && isAlreadyCreepsOn(creep, NAMES.HAVE_ENERGY, x.energy.id))
        .map(x => x.energy)
      if (found.length === 0)
        found = creep.room
          .lookForAtArea('source', 0, 0, 49, 49, true)
          .filter(x => x.source.energy >= needed && isAlreadyCreepsOn(creep, NAMES.HAVE_ENERGY, x.source.id))
          .map(x => x.source)
      return findClosestObject<Resource<RESOURCE_ENERGY> | Source>(
        creep.pos,
        found,
      )?.id
    },
    (target) => {
      if (have >= max) return true
      if (target instanceof Source) {
        if (target.energy < needed) return false
        return creep.harvest(target) === OK ? undefined : false
      }
      if (target.amount < needed) return false
      return creep.pickup(target) === OK ? undefined : false
    },
    {
      say: '⚡️🔎',
    },
  )
}
