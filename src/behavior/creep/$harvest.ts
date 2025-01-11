import { NAMES } from '../../consts'

import $findGoAction from './$find-go-action'

/**
 * Build any construction sites in room
 * Will harvest sources if capacity is 0
 */
export default function $harvest(creep: Creep) {
  return $findGoAction<Source>(
    creep,
    NAMES.HARVEST,
    () => {
      const harvestSpeed = creep.getActiveBodyparts(WORK) * 2
      // Find if any creeps around already harvesting it and calculate speed
      return creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE, {
        filter: (x: Source) => {
          let speed = harvestSpeed
          for (const creepName in Game.creeps)
            if (
              Memory.cache[`${NAMES.HARVEST}${Game.creeps[creepName].id}`]?.r
              === x.id
            )
              speed += Game.creeps[creepName].getActiveBodyparts(WORK) * 2
          return speed <= x.energyCapacity / 300
        },
      })?.id
    },
    (target) => {
      if (creep.store.getFreeCapacity() <= 10) creep.drop('energy', 10)
      // Never stop mining (sorry little one...)
      return creep.harvest(target) === OK ? undefined : false
    },
    {
      say: '⛏️',
    },
  )
}
