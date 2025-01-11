import { packPos } from './graphs/pack'

for (let x = 0; x < 128; x++) {
  for (let y = 0; y < 128; y++) {
    if (packPos({ x, y }).length !== 1) console.log(x, y, packPos({ x, y }))
  }
}
console.log(JSON.stringify(String.fromCharCode(87 + 65)))
