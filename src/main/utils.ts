import { tickCache } from './cache';

export function setBusy(target: _HasId, isBusy = true) {
  if (!tickCache.busy) tickCache.busy = {};
  tickCache.busy[target.id] = isBusy;
}
export const getBusy = (target: _HasId) => tickCache.busy?.[target.id] ?? false;

export const posToString = (pos: RoomPosition) => `${pos.x}_${pos.y}_${pos.roomName}`;
export function posFromString(pos: string) {
  const [x, y, room] = pos.split('_');
  return new RoomPosition(+x, +y, room);
}
