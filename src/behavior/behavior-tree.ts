/**
 * === Behavior tree ===
 * All node functions must be prepended with $.
 *
 * Task return values:
 * 1. true - Task is DONE
 * false - Task can not be done
 * undefined - Task is in progress (needs to be called again)
 */

import { BEHAVIOR_CACHE_TIMEOUT } from '../consts'

export type BehaviorNode = () => boolean | undefined

/**
 * True if every true.
 * Otherwise returns status.
 * Determined functions keep doing one task until it's done or failed.
 */
export function $determinedAnd(primary: string, ...tasks: BehaviorNode[]) {
  const start = (Memory.cache[primary]?.r as number | undefined) ?? 0
  for (let index = start; index < tasks.length; index++) {
    const result = tasks[index]()
    if (result === undefined) {
      Memory.cache[primary] = {
        r: index,
        t: BEHAVIOR_CACHE_TIMEOUT,
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
export function $determinedAny(primary: string, ...tasks: BehaviorNode[]) {
  const start = (Memory.cache[primary]?.r as number | undefined) ?? 0
  for (let index = start; index < tasks.length; index++) {
    const result = tasks[index]()
    if (result === undefined) {
      Memory.cache[primary] = {
        r: index,
        t: BEHAVIOR_CACHE_TIMEOUT,
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
export function $determinedOr(primary: string, ...tasks: BehaviorNode[]) {
  const start = (Memory.cache[primary]?.r as number | undefined) ?? 0
  for (let index = start; index < tasks.length; index++) {
    const result = tasks[index]()
    if (result === undefined) {
      Memory.cache[primary] = {
        r: index,
        t: BEHAVIOR_CACHE_TIMEOUT,
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
export function $and(...tasks: BehaviorNode[]) {
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
export function $any(...tasks: BehaviorNode[]) {
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
export function $or(...tasks: BehaviorNode[]) {
  for (let index = 0; index < tasks.length; index++) {
    const result = tasks[index]()
    if (result === true) return true
    if (result === undefined) return
  }
  return false
}
