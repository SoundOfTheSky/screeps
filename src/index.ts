// hookUpProfiler()

export function loop() {
  try {
    // tickMemory()
    // for (const roomName in Game.rooms) $room(Game.rooms[roomName])
    // for (const creepName in Game.creeps) $creep(Game.creeps[creepName])
    // if (Game.time % 200 === 0) logProfiler()
    if (Game.cpu.bucket >= 10_000) Game.cpu.generatePixel()

    // const matrix = new PathFinder.CostMatrix()
    // for (let x = 0; x < 50; x++)
    //   for (let y = 0; y < 50; y++)
    //     matrix.set(x, y, ~~(Math.random() * 255))
    // console.log(11, measurePerformance(() => {
    //   packMatrix(matrix)
    // }))
    // console.log(12, measurePerformance(() => {
    //   matrix.serialize()
    // }))
    // const m = packMatrix(matrix)
    // const m2 = matrix.serialize()
    // console.log(21, measurePerformance(() => {
    //   unpackMatrix(m)
    // }))
    // console.log(22, measurePerformance(() => {
    //   PathFinder.CostMatrix.deserialize(m2)
    // }))
  }
  catch (error) {
    if (error instanceof Error)
      console.log(error.name, error.message, error.stack)
    else console.log(error)
  }
}
