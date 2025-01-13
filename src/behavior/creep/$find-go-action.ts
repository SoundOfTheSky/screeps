import { useCache } from '../../memory'

import $moveTo from './$move-near-to'

export default function $findGoAction<T extends { pos: RoomPosition } & _HasId>(
  creep: Creep,
  primary: string,
  find: () => Id<T> | undefined,
  $action: (target: T) => boolean | undefined,
  options: {
    say?: string
    ticks?: number
    key?: string
  } = {},
) {
  const $primaryKey = `${primary}${creep.id}`
  const targetId = useCache($primaryKey, find, options)
  if (!targetId) {
    delete Memory.cache[$primaryKey]
    return true // TRUE here because we can't find another and task is basically done
  }
  const target = Game.getObjectById(targetId)
  if (!target) {
    delete Memory.cache[$primaryKey]
    return // UNDEFINED here because we can retry search
  }
  if (options.say) creep.say(options.say)
  const _nearTo = $moveTo(creep, target.pos)
  if (_nearTo === false) {
    delete Memory.cache[$primaryKey] // UNDEFINED here because we can retry search
    return
  }
  if (_nearTo === undefined) return // Status propagation
  // UNDEFINED here because we can retry search
  // If true or false start anew
  if ($action(target) !== undefined) delete Memory.cache[$primaryKey]
}
