import { CACHE } from 'main/consts'

import { $and, $any, $determinedAny } from '../task'

import $build from './$build'
import $harvest from './$harvest'
import $haveEnergy from './$have-energy'
import $repair from './$repair'
import $store from './$store'
import $upgradeController from './$upgrade-controller'

export function $creep(creep: Creep) {
  if (creep.spawning) return false
  switch (creep.memory.role) {
    case 'miner': {
      $harvest(creep)
      break
    }
    case 'worker': {
      $any(
        () =>
          $determinedAny(
            `${CACHE.WORKER_TASKS}${creep.id}`,
            () => $haveEnergy(creep, creep.store.getCapacity('energy')),
            () => $store(creep),
            () => $repair(creep),
            () => $build(creep),
          ),
        () => $upgradeController(creep),
      )
      break
    }
    case 'upgrader': {
      $upgradeController(creep)
      break
    }
    case 'hauler': {
      $and(
        () => $haveEnergy(creep),
        () => $store(creep),
      )
      break
    }
  }
}
