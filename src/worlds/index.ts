import { hundredAcreWood } from './hundredAcreWood'
import { middleEarth } from './middleEarth'
import { narnia } from './narnia'
import { oz } from './oz'
import { panem } from './panem'
import { treasureIsland } from './treasureIsland'
import { westeros } from './westeros'
import type { World, WorldId } from './types'

export const worlds: World[] = [westeros, middleEarth, oz, narnia, treasureIsland, hundredAcreWood, panem]

export function getWorld(id: WorldId): World {
  const world = worlds.find((w) => w.id === id)
  if (!world) throw new Error(`Unknown world: ${id}`)
  return world
}

export function getTarget(world: World, exitId: string) {
  const pin = world.pins.find((p) => p.id === exitId)
  if (!pin) throw new Error(`World ${world.id} has no pin ${exitId}`)
  return pin
}

export type { Difficulty, Exit, Pin, TriviaQuestion, World, WorldId } from './types'
export { decoys } from './decoys'
