/* eslint-disable sonarjs/cognitive-complexity */
type RGraph = Map<number, number>;
type Pos = [number, number];
type PosIndex = number;
const map = `11111111110001111111
10000000000000000001
10000000000000000001
10000000000000000001
10000000000000000001
10000000000000000001
10000000000000000001
10000000000000000001
00000000000001111101
00000000000001000101
00000000000001200001
10000000000001000101
10000000000001111101
10000000000000000001
10000000000000000001
10000000000000000001
10000000000000000001
10000000000000000001
10000000000000000001
11000111111111111111`;
// const map = `1101
// 1001
// 1121
// 1111`;
const m = map
  .split('')
  .filter((x) => x !== '\n')
  .map((x) => +x);
const size = Math.sqrt(m.length);
const getIndexFromPos = (x: number, y: number, s = size): PosIndex => x + y * s;
const getPosFromIndex = (i: number, s = size): Pos => [i % s, Math.floor(i / s)];
const sourcePosIndexes: PosIndex[] = [];
const sourcePosNeighbors = new Set<PosIndex>();
for (let i = 0; i < m.length; i++)
  if (m[i] === 2) {
    sourcePosIndexes.push(i);
    for (const neighbor of getNeighbors(i)) sourcePosNeighbors.add(neighbor);
  }

function* getNeighbors(index: PosIndex, sizeIndex = m.length): Generator<PosIndex> {
  if (m[index] === 2) for (const neighbor of sourcePosNeighbors) yield neighbor;
  const [x, y] = getPosFromIndex(index);
  for (let dx = -1; dx < 2; dx++)
    for (let dy = -1; dy < 2; dy++) {
      if (dx === 0 && dy === 0) continue;
      const i = getIndexFromPos(x + dx, y + dy);
      if (i < 0 || i >= sizeIndex) continue;
      if (m[i] !== 1) yield i;
    }
}

function bfs(source: PosIndex, isTarget: (a: PosIndex) => boolean, rGraph: RGraph) {
  const queue: PosIndex[] = [source];
  const parents = new Map<PosIndex, PosIndex>();
  while (queue.length) {
    const node = queue.shift()!;
    for (const neighbor of getNeighbors(node)) {
      if (!rGraph.get(getIndexFromPos(node, neighbor, m.length)) || neighbor === source || parents.has(neighbor))
        continue;
      parents.set(neighbor, node);
      if (isTarget(neighbor))
        return {
          target: neighbor,
          parents,
        };
      queue.push(neighbor);
    }
  }
  return {
    parents,
  };
}

function minCut(sources: PosIndex[], isTarget: (a: PosIndex) => boolean) {
  const rGraph: RGraph = new Map();
  for (let i = 0; i < m.length; i++)
    for (const neighbor of getNeighbors(i)) rGraph.set(getIndexFromPos(i, neighbor, m.length), 1);
  let path = bfs(sources[0], isTarget, rGraph);
  while (path.target) {
    let pathFlow = Number.MAX_VALUE;
    let node: PosIndex | undefined = path.target;
    while (true) {
      const parent = path.parents.get(node);
      if (!parent) break;
      const flow = rGraph.get(getIndexFromPos(parent, node, m.length))!;
      if (flow < pathFlow) pathFlow = flow;
      node = parent;
    }
    node = path.target;
    while (true) {
      const parent = path.parents.get(node);
      if (!parent) break;
      const i1 = getIndexFromPos(parent, node, m.length);
      const i2 = getIndexFromPos(node, parent, m.length);
      rGraph.set(i1, (rGraph.get(i1) ?? 0) - pathFlow);
      rGraph.set(i2, (rGraph.get(i2) ?? 0) + pathFlow);
      node = parent;
    }
    path = bfs(sources[0], isTarget, rGraph);
  }
  //for (const source of sources) path.parents.set(source, -1);
  path.parents.set(sources[0], -1);
  return [
    ...new Set(
      [...rGraph.keys()]
        .map((x) => getPosFromIndex(x, m.length))
        .filter(([a, b]) => path.parents.has(a) && !path.parents.has(b))
        .map(([, b]) => b),
    ),
  ].map((b) => getPosFromIndex(b));
}

console.log('start', {
  size,
  sourcePosIndexes,
});
const data = minCut(sourcePosIndexes, (a) => {
  const [x, y] = getPosFromIndex(a);
  return x === 0 || y === 0 || x === size - 1 || y === size - 1;
});
let text = '';
for (let i = 0; i < m.length; i++) {
  if (data.some(([x, y]) => getIndexFromPos(x, y) === i)) text += 'X';
  else text += m[i];
  if ((i + 1) % size === 0) text += '\n';
}
console.log(data);
console.log(text);
