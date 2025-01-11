import { findCreepByLayout, getBestAvailableCreepLayout, spawnCreep } from '../../utils/creep'

type CreepHarvestTask = Task<{
  t: Id<Source>
  c?: string
}>
export const creepHarvestTaskDefinition = {
  create(task: CreepHarvestTask) {},
  idle(task: CreepHarvestTask) {},
  run(task: CreepHarvestTask) {
    const target = Game.getObjectById(task.d.t)!
    let creep = task.d.c && Game.creeps[task.d.c]
    if (!creep) {
      const room = Game.rooms[target.pos.roomName]
      const layout = getBestAvailableCreepLayout(room, {
        work: 1,
        move: 0.01,
      })!
      creep = findCreepByLayout(room, layout)
      if (creep) task.d.c = creep.name
      else {
        task.d.c = spawnCreep(room, layout)
        return
      }
    }
    if (creep.spawning) return
    if (creep.pos.isNearTo(target.pos.x, target.pos.y)) {
      creep.drop('energy')
      return creep.harvest(target) === OK ? undefined : false
    }
    
  },

}
