import { AVAILABLE_EXTENSIONS_BY_CONTROLLER_LEVEL, NAMES, ROOM_RESCAN_INTERVAL } from '../../consts'
import { packPos } from '../../graphs/pack'
import { findPlaceToBuildTemplate } from '../../graphs/templates'
import { useCache } from '../../memory'

export default function $haveMaxExtensions(room: Room) {
  const key = `${NAMES.HAVE_MAX_EXTENSIONS}${room.name}`
  const extensions = useCache(
    key,
    () =>
      room.find(FIND_MY_CONSTRUCTION_SITES, {
        filter: x => x.structureType === 'extension',
      }).length
      + room.find(FIND_MY_STRUCTURES, {
        filter: x => x.structureType === 'extension',
      }).length,
    {
      ticks: ROOM_RESCAN_INTERVAL,
      key: room.controller!.level.toString(),
    },
  )
  const available
    = AVAILABLE_EXTENSIONS_BY_CONTROLLER_LEVEL[room.controller!.level - 1]
    - extensions
  if (available <= 0) return true
  const buildPlan = findPlaceToBuildTemplate(
    room,
    packPos(room.controller!.pos),
    ['ext1', 'ext2'],
  )
  if (!buildPlan) return false
  delete Memory.cache[key]
  for (let index = 0; index < buildPlan.length; index++) {
    const build = buildPlan[index]
    if (build.structure)
      room.createConstructionSite(build.x, build.y, build.structure)
  }
}
