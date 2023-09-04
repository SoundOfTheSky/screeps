/* eslint-disable sonarjs/cognitive-complexity */
export type Position = [number, number];

export type Region = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type Vertex = number;
export type Edge = [Vertex, Vertex];
export type Weight = number;
// Outer array is indexed by "from" vertex
// Inner array is just a list
export type GraphData<EdgeData> = Array<Array<{ vertex: Vertex } & EdgeData>>;

type EdgeData = {
  weight: Weight;
  initialWeight: Weight;
};

export class Graph {
  data: GraphData<EdgeData>;

  constructor(length: number) {
    this.data = Array.from(Array(length), () => []);
  }

  getEdgeData(from: Vertex, to: Vertex) {
    const list = this.data[from];
    return list.find((edge) => to === edge.vertex);
  }

  getWeight(from: Vertex, to: Vertex) {
    return this.getEdgeData(from, to)?.weight;
  }

  getInitialWeight(from: Vertex, to: Vertex) {
    return this.getEdgeData(from, to)?.initialWeight;
  }

  createEdge(from: Vertex, to: Vertex, weight: Weight) {
    this.data[from].push({ vertex: to, weight, initialWeight: weight });
  }

  createEdgeUnique(from: Vertex, to: Vertex, weight: Weight) {
    if (this.getEdgeData(from, to)) return;
    this.data[from].push({ vertex: to, weight, initialWeight: weight });
  }

  addWeight(from: Vertex, to: Vertex, weight: Weight) {
    const edgeData = this.getEdgeData(from, to);
    if (edgeData === undefined) {
      this.data[from].push({ vertex: to, weight, initialWeight: 0 });
    } else {
      edgeData.weight += weight;
    }
  }

  *iterateEdgesFrom(from: Vertex) {
    const list = this.data[from];
    if (!list) return;
    for (let index = 0; index < list.length; index++) {
      yield list[index];
    }
  }

  *iterateEdges() {
    for (let from = 0; from < this.data.length; from++) {
      const list = this.data[from];
      for (let index = 0; index < list.length ?? 0; index++) {
        yield [from, list[index].vertex] as Edge;
      }
    }
  }

  *filterEdges(predicate: (edge: Edge) => boolean) {
    for (const edge of this.iterateEdges()) {
      if (predicate(edge)) yield edge;
    }
  }

  breadthFirstSearch(source: Vertex) {
    const levels = Array(this.data.length).fill(-1) as number[];
    levels[source] = 0;
    const queue = [source];
    let nextIndex = 0;

    while (queue.length > nextIndex) {
      const current = queue[nextIndex++];

      for (const { vertex: next, weight } of this.iterateEdgesFrom(current)) {
        if (levels[next] === -1 && weight > 0) {
          queue.push(next);
          levels[next] = levels[current] + 1;
        }
      }
    }

    return { levels, isConnected: (vertex: Vertex) => levels[vertex] !== -1 };
  }

  getFilledEdgesOnEdge(source: Vertex) {
    const visited = Array(this.data.length).fill(false) as boolean[];
    visited[source] = true;
    const queue = [source];
    let nextIndex = 0;

    const filledEdges: Edge[] = [];

    while (queue.length > nextIndex) {
      const current = queue[nextIndex++];

      for (const { vertex: next, weight, initialWeight } of this.iterateEdgesFrom(current)) {
        if (!visited[next] && weight > 0) {
          queue.push(next);
          visited[next] = true;
        } else if (weight === 0 && initialWeight > 0) {
          filledEdges.push([current, next]);
        }
      }
    }

    return filledEdges.filter(([from, to]) => visited[from] && !visited[to]);
  }
}

/**
 * Implementation using Dinic's algorithm
 *
 * It could break when some weights are `Infinity` because there could be a flow with infinite capacity resulting in `Infinity - Infinity === NaN`.
 * Better use a "large enough" value instead of `Infinity` - unless you know there won't be a flow with infinite capacity.
 */
export const minCut = ({ graph, source, target }: { graph: Graph; source: Vertex; target: Vertex }): Edge[] => {
  const augment = ([from, to]: Edge, capacity: number) => {
    graph.addWeight(from, to, -capacity);
    graph.addWeight(to, from, capacity);
  };

  const findFlowAndAugment = (levels: Record<Vertex, number>) => {
    const findFlowRecursive = (current: Vertex, currentCapacity: number): number => {
      if (current === target) return currentCapacity;

      for (const { vertex: next, weight: capacity } of graph.iterateEdgesFrom(current)) {
        const isInNextLevel = levels[current] + 1 === levels[next];
        if (!isInNextLevel || capacity <= 0) continue;

        const nextCapacity = Math.min(currentCapacity, capacity);
        const flow = findFlowRecursive(next, nextCapacity);
        if (flow > 0) {
          augment([current, next], flow);
          return flow;
        }
      }
      // This is a dead end...
      levels[current] = -1;
      return 0;
    };
    return findFlowRecursive(source, Number.MAX_SAFE_INTEGER);
  };

  while (true) {
    const { levels, isConnected } = graph.breadthFirstSearch(source);
    if (!isConnected(target)) break;

    while (true) {
      const flow = findFlowAndAugment(levels);
      if (flow === 0) break;
    }
  }

  return graph.getFilledEdgesOnEdge(source);
};
