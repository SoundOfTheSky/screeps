if (!Memory.id) Memory.id = 65
export function getNextId() {
  return String.fromCharCode(Memory.id++)
}
