export const directionsDelta = {
  [TOP]: [0, -1],
  [RIGHT]: [1, 0],
  [BOTTOM]: [0, 1],
  [LEFT]: [-1, 0],
  [TOP_RIGHT]: [1, -1],
  [BOTTOM_RIGHT]: [1, 1],
  [BOTTOM_LEFT]: [-1, 1],
  [TOP_LEFT]: [-1, -1],
} as const;

export function drawPath(startPos: RoomPosition, path: DirectionConstant[]) {
  const pos: [number, number] = [startPos.x, startPos.y];
  const room = Game.rooms[startPos.roomName];
  for (const dir of path) {
    const d = directionsDelta[dir];
    const x = pos[0] + d[0];
    const y = pos[1] + d[1];
    room.visual.line(pos[0], pos[1], x, y);
    pos[0] = x;
    pos[1] = y;
  }
}

export function getPath(pos: RoomPosition, target: RoomPosition) {
  console.log('getPath', pos.x, pos.y, target.x, target.y);
  const path = pos.findPathTo(target);
  const lastPoint = path[path.length - 1];
  if (target.isEqualTo(lastPoint.x, lastPoint.y) || target.isNearTo(lastPoint.x, lastPoint.y))
    return path.map((p) => p.direction);
}

export function findClosestByPath<K extends FindConstant, S extends FindTypes[K]>(
  pos: RoomPosition,
  find: K,
  opts?: FilterOptions<K, S>,
): [S, DirectionConstant[]] | undefined {
  let min: S | undefined;
  let minPath: DirectionConstant[] | undefined;
  for (const x of Game.rooms[pos.roomName].find<K, S>(find, opts)) {
    const path = getPath(pos, x instanceof RoomPosition ? x : x.pos);
    if (path && (!minPath || path.length < minPath.length)) {
      minPath = path;
      min = x;
    }
  }
  if (!min) return;
  return [min, minPath!];
}

export function buildRoadForPath(room: Room, start: RoomPosition, path: DirectionConstant[]) {
  const pos = [start.x, start.y];
  room.createConstructionSite(pos[0], pos[1], STRUCTURE_ROAD);
  for (const dir of path) {
    const d = directionsDelta[dir];
    const x = pos[0] + d[0];
    const y = pos[1] + d[1];
    room.createConstructionSite(pos[0], pos[1], STRUCTURE_ROAD);
    pos[0] = x;
    pos[1] = y;
  }
}
