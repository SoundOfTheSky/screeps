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
const roleBuilds: Record<CreepRoles, BodyPartConstant[]> = {
  // 2 WORK = fast mining
  miner: [CARRY, MOVE, WORK, WORK],
  // Probably needs just carry us much as he can work in field
  worker: [CARRY, MOVE, WORK, CARRY, CARRY],
  // Speed is irrelevant mostly. It already speedy enough, just have big pockets pls
  upgrader: [CARRY, MOVE, WORK, CARRY, CARRY],
  // Fast boooy
  hauler: [CARRY, MOVE, WORK, MOVE, CARRY],
}
export default function $maintainCreeps(
  room: Room,
  role: CreepRoles,
  number = 1,
): boolean | undefined {
  const availableSpawn = room.find(FIND_MY_SPAWNS).find(x => !x.spawning)
  if (!availableSpawn) return false
  let count = 0
  for (const creepName in Game.creeps)
    if (Game.creeps[creepName].memory.role === role) {
      count++
      if (count > number) Game.creeps[creepName].suicide()
    }
  if (count >= number) return true
  if (
    Game.spawns.Spawn1.spawnCreep(roleBuilds[role], Date.now().toString(), {
      memory: {
        role,
      },
    }) !== OK
  )
    return false
}
