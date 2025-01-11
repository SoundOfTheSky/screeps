import { NAMES } from '../../consts'
import { getNeighbors, isPosWalkable } from '../../graphs/pos'
import { createTask } from '../../tasks/tasks'
import { findCreepByLayout, getBestAvailableCreepLayout, spawnCreep, spawnLayout } from '../../utils/creep'

export type TaskHarvestSource = {
  /** target id */
  t: Id<_HasId>
  /** Generation speed */
  s: number
  /** Max number of creeps */
  p: number
}
export function $harvestRoomEnergy(room: Room) {
  const sources = room.find(FIND_SOURCES_ACTIVE)
  for (const source of sources) {
    // Target mining speed
    const generationSpeed = source.energyCapacity / 300

    // Find max creeps that can harvest source at the same time
    let maxCreeps = 0
    for (const pos of getNeighbors(source.pos))
      if (isPosWalkable(room, pos)) maxCreeps++
    if (maxCreeps === 0) continue

    // Find or create creep to fulfill task
    const layout = getBestAvailableCreepLayout(room, {
      move: 0.01,
      work: 1,
    }, ~~(generationSpeed / 2))
    if (!layout) return false
    // Based on generation speed get how many creeps needed
    let creepsNeeded = Math.ceil(generationSpeed / (layout.work! * 2))
    if (creepsNeeded > maxCreeps) creepsNeeded = maxCreeps
    for (let index = 0; index < creepsNeeded; index++) {
      const task = createTask({
        n: NAMES.HARVEST_SOURCE,
        d: source.id,
      })
      const creep = findCreepByLayout(room, layout)
      if (creep) creep.memory.t.push(task.i)
      else
        spawnCreep(room, {}, undefined, {
          memory: {
            t: [task.i],
          },
        })
    }
  }
}

export function handleTaskHarvestSource(task: Task) {
  const d = task.d as TaskHarvestSource
  const target = Game.getObjectById(d.t) as Source
  const layout = getBestAvailableCreepLayout(target.room, {
    move: 0.01,
    work: 1,
  })
  spawnLayout(layout)
}
