import { $and } from '../task'

import $haveMaxExtensions from './$have-max-extensions'
import $maintainCreeps from './$maintain-creeps'

export function $room(room: Room) {
  if (room.controller?.my) {
    $haveMaxExtensions(room)
    $and(
      () => $maintainCreeps(room, 'worker', 2),
      // () => $maintainCreeps(room, 'hauler'),
      () => $maintainCreeps(room, 'miner', 2),
      () => $maintainCreeps(room, 'upgrader'),
    )
  }
}
