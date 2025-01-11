import { $creep } from './behavior/creep/$creep'
import { $room } from './behavior/room/$room'
import { tickMemory } from './memory'
import { hookUpProfiler, logProfiler } from './utils/profiler'

hookUpProfiler()

export function loop() {
  try {
    tickMemory()
    for (const roomName in Game.rooms) $room(Game.rooms[roomName])
    // for (const structureId in Game.structures) {
    //   const structure = Game.structures[structureId];
    //   if (structure.structureType === STRUCTURE_TERMINAL) $tower(structure as StructureTower);
    // }
    for (const creepName in Game.creeps) $creep(Game.creeps[creepName])
    if (Game.time % 200 === 0) logProfiler()
    if (Game.cpu.bucket >= 10_000) Game.cpu.generatePixel()
  }
  catch (error) {
    if (error instanceof Error)
      console.log(error.name, error.message, error.stack)
    else console.log(error)
  }
}
