import { middleEarth } from './middleEarth'
import { oz } from './oz'
import { westeros } from './westeros'
import type { World, WorldId } from './types'

export const worlds: World[] = [westeros, middleEarth, oz]

export function getWorld(id: WorldId): World {
  const world = worlds.find((w) => w.id === id)
  if (!world) throw new Error(`Unknown world: ${id}`)
  return world
}

export function getTarget(world: World) {
  const pin = world.pins.find((p) => p.id === world.targetId)
  if (!pin) throw new Error(`World ${world.id} has no target pin`)
  return pin
}

export type { Difficulty, Pin, TriviaQuestion, World, WorldId } from './types'
export { decoys } from './decoys'
