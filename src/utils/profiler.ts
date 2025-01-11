/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/no-unsafe-function-type */
const commonFunctionProperties = new Set([
  'length',
  'name',
  'arguments',
  'caller',
  'prototype',
])
const functionNameBlacklist = new Set(['getUsed', 'constructor'])

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (!Memory.profiler) Memory.profiler = {}

export function getUsedCPU() {
  return Game.shard.name === 'sim' ? performance.now() : Game.cpu.getUsed()
}
export function profileFunction<T extends unknown[], R>(
  original: (...arguments_: T) => R,
  title?: string,
): (...arguments_: T) => R {
  const name = title ?? original.name
  const stats = [0, 0] as [number, number]
  Memory.profiler[name] = stats

  function wrapped(
    this: { constructor: (...arguments_: T) => R } | undefined,
    ...arguments_: T
  ): R {
    stats[0]++
    const start = getUsedCPU()
    const result
      = this && this.constructor === wrapped
        ? new (original as unknown as new (...arguments_: T) => R)(
          ...arguments_,
        )
        : original.apply(this, arguments_)
    const took = getUsedCPU() - start
    stats[1] += took
    return result
  }

  for (const property of Object.getOwnPropertyNames(original))
    if (!commonFunctionProperties.has(property))
      wrapped[property as keyof typeof wrapped]
        = original[property as keyof typeof original]
  return wrapped
}
export function profileObject(object: unknown, name: string) {
  if (!object || !(typeof object === 'object' || typeof object === 'function'))
    return
  const prototype = (object as { prototype?: object }).prototype
  if (prototype) profileObject(prototype, name)
  for (const functionName of Object.getOwnPropertyNames(object)) {
    const extendedLabel = `${name}.${functionName}`
    const descriptor = Object.getOwnPropertyDescriptor(object, functionName)
    if (functionNameBlacklist.has(functionName) || !descriptor) continue
    if (descriptor.get || descriptor.set) {
      if (!descriptor.configurable) continue
      const profileDescriptor: PropertyDescriptor = {}
      if (descriptor.get)
        profileDescriptor.get = profileFunction(
          descriptor.get,
          `${extendedLabel}:get`,
        )
      if (descriptor.set)
        profileDescriptor.set = profileFunction(
          descriptor.set,
          `${extendedLabel}:set`,
        )
      Object.defineProperty(object, functionName, profileDescriptor)
      continue
    }
    if (typeof descriptor.value !== 'function' || !descriptor.writable) continue
    ;(object as Record<string, Function>)[functionName] = profileFunction(
      (object as Record<string, Function>)[functionName] as () => void,
      extendedLabel,
    )
  }
}
export function logProfiler(amount = 10) {
  console.log('=== Profiler ===')
  const print = Object.entries(Memory.profiler)
    // Remove 0 calls
    .filter(([,[calls]]) => calls !== 0)
    // Sort by total time
    .sort(([,[,a]], [,[,b]]) => b - a)
    .slice(0, amount)
    .map(([name, [calls, total]]) => ({
      name,
      calls,
      total,
      avg: total / calls,
    }))
  for (let index = 0; index < print.length; index++) {
    const stat = print[index]
    console.log(
      `${stat.name}\t${stat.calls} calls\t${stat.total} ms\t${stat.avg} avg`,
    )
  }
  console.log('===============')
  for (const key in Memory.profiler) {
    Memory.profiler[key][0] = 0
    Memory.profiler[key][1] = 0
  }
}

export function hookUpProfiler() {
  for (const [key, value] of Object.entries({
    ConstructionSite,
    Creep,
    Deposit,
    Flag,
    Game,
    Mineral,
    Nuke,
    OwnedStructure,
    PathFinder,
    PowerCreep,
    RawMemory,
    Resource,
    Room,
    RoomObject,
    RoomPosition,
    RoomVisual,
    Ruin,
    Source,
    Structure,
    StructureContainer,
    StructureController,
    StructureExtension,
    StructureExtractor,
    StructureFactory,
    StructureInvaderCore,
    StructureKeeperLair,
    StructureLab,
    StructureLink,
    StructureNuker,
    StructureObserver,
    StructurePortal,
    StructurePowerBank,
    StructurePowerSpawn,
    StructureRampart,
    StructureRoad,
    StructureSpawn,
    StructureStorage,
    StructureTerminal,
    StructureTower,
    StructureWall,
    Tombstone,
  } as const))
    profileObject(value, key)
}
