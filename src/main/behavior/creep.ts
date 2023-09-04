import { clearCache, setCache, useCache } from '../cache';
import { posToString } from '../utils';
import { directionsDelta, drawPath, getPath } from '../pathfinding';

export function $creep(creep: Creep) {
  if (creep.spawning) return false;
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (creep.memory.role) {
    case CreepRole.miner:
      $mine(creep);
      break;
  }
}

/**
 * Build any construction sites in room
 * Will harvest sources if capacity is 0
 */
export function $mine(creep: Creep) {
  creep.say('⛏️');
  if (creep.store.getFreeCapacity() === 0) return true;
  const sourceId = useCache(
    `$mine${creep.id}`,
    '',
    () =>
      creep.pos.findInRange(FIND_SOURCES_ACTIVE, 1, {
        filter: (x) => x.energy >= creep.store.getFreeCapacity(),
      })[0]?.id ??
      creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE, {
        filter: (x) => x.energy >= creep.store.getFreeCapacity(),
      })?.id,
    25,
  );
  if (!sourceId) return false;
  const source = Game.getObjectById(sourceId);
  if (!source) return;
  const _nearTo = $moveNearTo(creep, source.pos);
  if (!_nearTo) return _nearTo;
  if (creep.harvest(source) !== OK) return false;
}

/**
 * Build any construction sites in room
 * Will harvest sources if capacity is 0
 */
export function $build(creep: Creep) {
  const _haveEnergy = $haveEnergy(creep);
  if (!_haveEnergy) return _haveEnergy;
  const key = `$build${creep.id}`;
  const targetId = useCache(key, '', () => creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES)?.id, 25);
  if (!targetId) return false;
  const target = Game.getObjectById(targetId);
  if (!target) return false;
  const _nearTo = $moveNearTo(creep, target.pos);
  creep.say('🔨');
  if (!_nearTo) return _nearTo;
  if (creep.build(target) === ERR_INVALID_TARGET) return true;
}

/**
 * Get resources than free capacity is 0
 */
export function $haveEnergy(creep: Creep) {
  const key = `$getResourcesPaths${creep.id}`;
  creep.say('⛏️');
  if (creep.store.getFreeCapacity() === 0) {
    delete creep.memory.$getResources;
    clearCache(key);
    return true;
  } else if (creep.memory.$getResources || creep.store.getUsedCapacity() === 0) {
    creep.memory.$getResources = true;
    // Invalidate distance cache in 25 ticks
    const sourceId = useCache(
      key,
      '',
      () =>
        creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE, {
          filter: (x) => x.energy >= creep.store.getFreeCapacity(),
        })?.id,
      25,
    );
    if (!sourceId) return false;
    const source = Game.getObjectById(sourceId);
    if (!source) return false;
    const _nearTo = $moveNearTo(creep, source.pos);
    if (!_nearTo) return _nearTo;
    if (creep.harvest(source) !== OK) return false;
  } else return true;
}

/**
 * Find and move near to.
 */
export function $moveNearTo(creep: Creep, target: RoomPosition, initialPath?: DirectionConstant[]) {
  if (creep.pos.isNearTo(target)) return true;
  const key = `$moveNearTo${creep.id}`;
  const argKey = posToString(target);
  let path = useCache(key, argKey, () => initialPath ?? getPath(creep.pos, target));
  if (!path || path.length === 0) return false;
  if (creep.memory.nextPos) {
    if (creep.memory.nextPos[0] === creep.pos.x && creep.memory.nextPos[1] === creep.pos.y) {
      path.shift();
      delete creep.memory.stuck;
      delete creep.memory.nextPos;
    } else {
      console.log('Stuck', creep.memory.stuck);
      if (creep.memory.stuck ?? 0 >= 3) {
        console.log('Recalc cache');
        path = getPath(creep.pos, target);
        setCache(key, { key: argKey, result: path });
      }
    }
  }
  if (!path || path.length === 0) return false;
  drawPath(creep.pos, path);
  if (creep.move(path[0]) === OK) {
    const delta = directionsDelta[path[0]];
    creep.memory.nextPos = [creep.pos.x + delta[0], creep.pos.y + delta[1]];
    creep.memory.stuck = (creep.memory.stuck ?? 0) + 1;
  }
}
