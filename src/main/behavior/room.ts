import { and } from './task';

export function $room(room: Room) {
  if (room.controller?.my) {
    and(
      () => $maintainCreeps(room, CreepRole.miner),
      () => $maintainCreeps(room, CreepRole.hauler),
      () => $maintainCreeps(room, CreepRole.worker),
    );
  }
}
/**
 * Spawns new creeps if needed for task
 */
// const bodyPartsCost: { [key: BodyPartConstant]: number } = {
//   [MOVE]: 50,
//   [WORK]: 100,
//   [CARRY]: 50,
//   [ATTACK]: 80,
//   [RANGED_ATTACK]: 150,
//   [HEAL]: 250,
//   [CLAIM]: 600,
//   [TOUGH]: 10,
// };
// const spawnsAmount = [1, 1, 1, 1, 1, 1, 2, 3] as const;
// const extensionsAmount = [0, 5, 10, 20, 30, 40, 50, 60] as const;
const roleBuilds: Record<CreepRole, BodyPartConstant[]> = {
  [CreepRole.miner]: [CARRY, MOVE, WORK, WORK],
  [CreepRole.hauler]: [CARRY, MOVE, WORK, MOVE, CARRY],
  [CreepRole.worker]: [CARRY, MOVE, WORK, WORK],
};
export function $maintainCreeps(room: Room, role: CreepRole, number = 1): boolean | undefined {
  const availableSpawn = room.find(FIND_MY_SPAWNS, {
    filter: (s) => !s.spawning,
  })[0];
  if (!availableSpawn) return false;
  let count = 0;
  for (const creepName in Game.creeps)
    if (Game.creeps[creepName].memory.role === role) {
      count++;
      if (count > number) Game.creeps[creepName].suicide();
    }
  if (count >= number) return true;
  if (
    Game.spawns['Spawn1'].spawnCreep(roleBuilds[role], Date.now().toString(), {
      memory: {
        role,
      },
    }) !== OK
  )
    return false;
}
