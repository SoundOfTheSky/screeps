export type Task = () => boolean | undefined;

export function and(...tasks: Task[]) {
  for (const task of tasks) {
    const result = task();
    if (result) continue;
    return result;
  }
  return true;
}
export function or(...tasks: Task[]) {
  for (const task of tasks) {
    const result = task();
    if (result === false) continue;
    return result;
  }
  return false;
}
export function all(...tasks: Task[]) {
  let final: true | undefined = true;
  for (const task of tasks) {
    const result = task();
    if (result === false) return false;
    if (result === undefined) final = undefined;
  }
  return final;
}
