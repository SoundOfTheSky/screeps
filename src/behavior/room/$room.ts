import { $and } from '../behavior-tree'

import $haveMaxExtensions from './$have-max-extensions'
import $maintainCreeps from './$maintain-creeps'

export function $room(room: Room) {
  if (room.controller?.my) {
    $haveMaxExtensions(room)
    if (room.controller.level === 1) {
      $and(
        () => $maintainCreeps(room, 'upgrader'),
        () => $maintainCreeps(room, 'worker', 2),
        () => $maintainCreeps(room, 'miner', 2),
      )
    }
    else if (room.controller.level === 2) {
      $and(
        () => $maintainCreeps(room, 'upgrader', 2),
        () => $maintainCreeps(room, 'worker', 4),
        () => $maintainCreeps(room, 'miner', 4),
      )
    }
  }
}
