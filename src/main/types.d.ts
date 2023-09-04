declare const enum CreepRole {
  miner,
  hauler,
  worker,
}
declare const Memory: {
  creeps: { [name: string]: CreepMemory };
  powerCreeps: { [name: string]: PowerCreepMemory };
  flags: { [name: string]: FlagMemory };
  rooms: { [name: string]: RoomMemory };
  spawns: { [name: string]: SpawnMemory };
  cache: Record<
    string,
    {
      key: string;
      result: unknown;
      ticks?: number;
    }
  >;
};
declare type CreepMemory = {
  role: CreepRole;
  $getResources?: boolean;
  nextPos?: [number, number];
  stuck?: number;
};
declare type FlagMemory = {
  [name: string]: unknown;
};
declare type PowerCreepMemory = {
  [name: string]: unknown;
};
declare type RoomMemory = {
  sourcesMiners: WeakMap<Creep>;
  [name: string]: unknown;
};
declare type SpawnMemory = {
  spawning?: boolean;
};
