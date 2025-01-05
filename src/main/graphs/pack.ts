/* eslint-disable unicorn/prefer-code-point */
/**
 * Slightly modified screeps-packrat by bencbartlett
 * Original: https://github.com/bencbartlett/screeps-packrat
 *
 * Changes:
 * - Highly optimized speed of packing/unpacking room names. Removed cache.
 * - Removed id packing because it's broken for characters in range 0xd800 - 0xdfff
 */

import { Pos } from './pos'

/**
 * Reduce stringified size by 80%
 */
export function packPos({ x, y }: Pos): string {
  return String.fromCharCode(((x << 6) | y) + 65)
}

export function unpackPos(char: string): Pos {
  const index = char.charCodeAt(0) - 65
  return { x: (index & 0b1111_1100_0000) >>> 6, y: index & 0b0000_0011_1111 }
}

/**
 * Reduce stringified size by 94%
 */
export function packPosList(posList: Pos[]): string {
  let result = ''
  for (let index = 0; index < posList.length; index++)
    result += packPos(posList[index])
  return result
}

export function unpackPosList(chars: string): Pos[] {
  // eslint-disable-next-line unicorn/no-new-array
  const result = new Array(chars.length)
  for (let index = 0; index < chars.length; index++)
    result[index] = unpackPos(chars[index])
  return result as Pos[]
}

export function packRoomName(roomName: string): string {
  if (roomName === 'sim') return '㺀'
  let x = ''
  let y = ''
  let quadrant = 0
  for (let index = 0; index < roomName.length; index++) {
    const char = roomName[index]
    if (index === 0) {
      if (char === 'E') quadrant += 1
    }
    else {
      if (char === 'S') quadrant += 2
      else if (char !== 'N') {
        if (index < 3) x += char
        else y += char
      }
    }
  }
  return String.fromCharCode(
    ((quadrant << 12) | (Number.parseInt(x) << 6) | Number.parseInt(y)) + 65,
  )
}

export function unpackRoomName(char: string): string {
  if (char === '㺀') return 'sim'
  const number_ = char.charCodeAt(0) - 65
  const x = (number_ & 0b00_1111_1100_0000) >>> 6
  const y = number_ & 0b00_0000_0011_1111
  switch (((number_ & 0b11_0000_0011_1111) >>> 12) as 0 | 1 | 2 | 3) {
    case 0: {
      return 'W' + x + 'N' + y
    }
    case 1: {
      return 'E' + x + 'N' + y
    }
    case 2: {
      return 'W' + x + 'S' + y
    }
    case 3: {
      return 'E' + x + 'S' + y
    }
  }
}

/**
 * Reduce stringified size by 90%
 */
export function packRoomPosition(pos: RoomPosition): string {
  return packPos(pos) + packRoomName(pos.roomName)
}

export function unpackRoomPosition(chars: string): RoomPosition {
  const { x, y } = unpackPos(chars[0])
  return new RoomPosition(x, y, unpackRoomName(chars[1]))
}

/**
 * Reduce stringified size by 95%
 */
export function packRoomPositionList(posList: RoomPosition[]): string {
  let result = ''
  for (let index = 0; index < posList.length; ++index)
    result += packRoomPosition(posList[index])
  return result
}

export function unpackRoomPositionList(chars: string): RoomPosition[] {
  const posList: RoomPosition[] = []
  for (let index = 0; index < chars.length; index += 2)
    posList.push(unpackRoomPosition(chars.slice(index, index + 2)))
  return posList
}
