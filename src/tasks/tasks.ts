/**
 * === Tasks ===
 */

import { JSONSerializable, Optional } from '@softsky/utils'

import { DEFAULT_TASK_TIMEOUT } from '../consts'
import { getNextId } from '../utils'

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (!Memory.tasks) Memory.tasks = []
export function createTask<T extends JSONSerializable>(
  task: Optional<Task<T>, 't' | 'i' | 'p' | 's'>,
): Task<T> {
  task.t ??= DEFAULT_TASK_TIMEOUT
  task.i ??= getNextId()
  task.p ??= 0
  task.s ??= TaskStatus.IDLE
  freeTask(task as Task<T>)
  return task as Task<T>
}

export function delegateTask(creep: Creep, task: Task) {
  const index = Memory.tasks.indexOf(task)
  if (index !== -1) Memory.tasks.splice(index, 1)
  const index2 = creep.memory.t.findIndex(x => x.p < task.p)
  creep.memory.t.splice(index2 === -1 ? creep.memory.t.length : index2, 0, task)
}

export function freeTask(task: Task) {
  if (Memory.tasks.includes(task)) return
  const index = Memory.tasks.findIndex(x => x.p < task.p)
  Memory.tasks.splice(index === -1 ? Memory.tasks.length : index, 0, task)
}

export function tickTasks() {
  if (Game.time % 3600 !== 0) return
  // for (const roomName in Game.rooms) {
  //   const room = Game.rooms[roomName]
  //   if (room.controller?.my) {
  //     const sources = room.find(FIND_SOURCES_ACTIVE)
  //     for (const source of sources) {
  //       const generationSpeed = source.energyCapacity / 300
  //       createTask({
  //         n: NAMES.HARVEST_SOURCE,
  //         d: {
  //           a,
  //         },
  //       })
  //     }
  //     for (const source of sources)
  //       tasks.push({ type: 'harvest', targetId: source.id, priority: 1 })

  //     // Repair tasks
  //     const structures = room.find(FIND_STRUCTURES, {
  //       filter: s => s.hits < s.hitsMax,
  //     })
  //     for (const s of structures) {
  //       const priority = s.structureType === STRUCTURE_WALL ? 5 : 3
  //       tasks.push({ type: 'repair', targetId: s.id, priority })
  //     }

  //     // Sort by priority
  //     tasks.sort((a, b) => a.priority - b.priority)

  //     Memory.taskQueue = tasks
  //   }
  // }
}
