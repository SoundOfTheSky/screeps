export const tickCache: {
  busy?: Record<Id<_HasId>, boolean>;
} = {};
type SerializableTypes =
  | undefined
  | null
  | number
  | string
  | SerializableTypes[]
  | { [key: string]: SerializableTypes };
export function useCache<T extends SerializableTypes>(placeKey: string, argKey: string, task: () => T, ticks?: number) {
  let result = Memory.cache[placeKey];
  if (!result || result.key !== argKey) {
    result = {
      key: argKey,
      result: task(),
      ticks,
    };
    Memory.cache[placeKey] = result;
  }
  return result.result as T;
}
export const clearCache = (placeKey: string) => delete Memory.cache[placeKey];
export const setCache = (
  placeKey: string,
  data: {
    key: string;
    result: unknown;
    ticks?: number;
  },
) => (Memory.cache[placeKey] = data);
