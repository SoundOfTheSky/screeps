import { $creep } from './behavior/creep/$creep'
import { $room } from './behavior/room/$room'
import { tickCache } from './cache'
import { hookUpProfiler, logProfiler } from './utils/profiler'

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (!Memory.cache) Memory.cache = {}
hookUpProfiler()

export function loop() {
  try {
    const time = performance.now()
    tickCache()
    for (const roomName in Game.rooms) $room(Game.rooms[roomName])
    // for (const structureId in Game.structures) {
    //   const structure = Game.structures[structureId];
    //   if (structure.structureType === STRUCTURE_TERMINAL) $tower(structure as StructureTower);
    // }
    for (const creepName in Game.creeps) $creep(Game.creeps[creepName])

    const timeTook = performance.now() - time
    if (timeTook > 4) console.log(`====== [${timeTook}ms] ======`)
    if (Game.time % 200 === 0) logProfiler()
  }
  catch (error) {
    if (error instanceof Error)
      console.error(error.name, error.message, error.stack)
    else console.error(error)
  }
}
