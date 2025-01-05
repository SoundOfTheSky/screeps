/**
 * === TASK BIBLE ===
 * All tasks function must be prepended with $.
 * Please use creep's $repair() function as boilerplate
 *
 * Task return values:
 * true - Task is DONE
 * false - Task can't be done
 * undefined - Task is in progress (needs to be called again)
 *
 * 1. Don't return false until you're sure that task can't be completed
 * 2. idk lol
 */

export type Task = () => boolean | undefined

/**
 * True if every true.
 * Otherwise returns status.
 * Determined functions keep doing one task until it's done or failed.
 */
export function $determinedAnd(primary: string, ...tasks: Task[]) {
  const start = (Memory.cache[primary]?.r as number | undefined) ?? 0
  for (let index = start; index < tasks.length; index++) {
    const result = tasks[index]()
    if (result === undefined) {
      Memory.cache[primary] = {
        r: index,
      }
      return
    }
    else if (!result) {
      delete Memory.cache[primary]
      return false
    }
  }
  delete Memory.cache[primary]
  return true
}

/**
 * Executes all no matter result.
 * At the end returns true.
 * Determined functions keep doing one task until it's done or failed.
 */
export function $determinedAny(primary: string, ...tasks: Task[]) {
  const start = (Memory.cache[primary]?.r as number | undefined) ?? 0
  for (let index = start; index < tasks.length; index++) {
    const result = tasks[index]()
    if (result === undefined) {
      Memory.cache[primary] = {
        r: index,
      }
      return
    }
  }
  delete Memory.cache[primary]
  return true
}

/**
 * Executes until any is true.
 * Otherwise return last result.
 * Determined functions keep doing one task until it's done or failed.
 */
export function $determinedOr(primary: string, ...tasks: Task[]) {
  const start = (Memory.cache[primary]?.r as number | undefined) ?? 0
  for (let index = start; index < tasks.length; index++) {
    const result = tasks[index]()
    if (result === undefined) {
      Memory.cache[primary] = {
        r: index,
      }
      return
    }
    else if (result) {
      delete Memory.cache[primary]
      return true
    }
  }
  delete Memory.cache[primary]
  return false
}

/**
 * True if every true.
 * Otherwise returns status.
 */
export function $and(...tasks: Task[]) {
  for (let index = 0; index < tasks.length; index++) {
    const result = tasks[index]()
    if (!result) return result
  }
  return true
}

/**
 * Executes all no matter result.
 * At the end returns true.
 */
export function $any(...tasks: Task[]) {
  for (let index = 0; index < tasks.length; index++) {
    const result = tasks[index]()
    if (result === undefined) return
  }
  return true
}

/**
 * Executes until any is true.
 * Otherwise return last result.
 */
export function $or(...tasks: Task[]) {
  for (let index = 0; index < tasks.length; index++) {
    const result = tasks[index]()
    if (result === true) return true
    if (result === undefined) return
  }
  return false
}
