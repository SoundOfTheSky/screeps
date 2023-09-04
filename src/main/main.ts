import { $room } from './behavior/room';
import { $creep } from './behavior/creep';
import { tickCache } from './cache';

if (!Memory.cache) Memory.cache = {};

export function loop() {
  console.log('====== NEW TICK ======');
  // Clear tick storage every tick
  for (const key in tickCache) delete tickCache[key as keyof typeof tickCache];
  // Decrease ticks in cache
  for (const key in Memory.cache) {
    const val = Memory.cache[key]!;
    if (val.ticks && --val.ticks <= 0) delete Memory.cache[key];
  }

  for (const roomName in Game.rooms) $room(Game.rooms[roomName]);
  // for (const structureId in Game.structures) {
  //   const structure = Game.structures[structureId];
  //   if (structure.structureType === STRUCTURE_TERMINAL) $tower(structure as StructureTower);
  // }
  for (const creepName in Game.creeps) {
    $creep(Game.creeps[creepName]);
  }
}
