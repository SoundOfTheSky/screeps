import { CACHE } from 'main/consts'
import { isAlreadyCreepsOn } from 'main/utils/search'

import $findGoAction from './$find-go-action'

export default function $store(creep: Creep) {
  if (creep.store.getUsedCapacity('energy') === 0) return false
  return $findGoAction<AnyCreep | Structure>(
    creep,
    CACHE.STORE,
    () =>
      creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
        filter: x =>
          'store' in x
          && x.store.getFreeCapacity('energy') > 20
          && isAlreadyCreepsOn(creep, CACHE.STORE, x.id),
      })?.id
      ?? Object.values(Game.creeps).find(
        x =>
          x.memory.role === 'upgrader'
          && x.store.getFreeCapacity('energy') > 20
          && isAlreadyCreepsOn(x, CACHE.STORE, x.id),
      )?.id,
    target => creep.transfer(target, 'energy') === OK,
    {
      say: '⤵️',
    },
  )
}
