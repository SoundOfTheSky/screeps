export function getCreepHarvestSpeed(creep: Creep) {
  let speed = 0
  for (let index = 0; index < creep.body.length; index++) {
    const part = creep.body[index]
    if (part.hits > 0 && part.type === WORK) speed += 2
  }
  return speed
}
