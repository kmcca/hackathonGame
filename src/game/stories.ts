import { decoys, worlds } from '../worlds'
import type { World, WorldId } from '../worlds'
import type { Matchable } from './match'

/** How a story is shown to the player, for example "The Lord of the Rings (Middle-earth)". */
export function storyLabel(story: { story: string; name: string }): string {
  return `${story.story} (${story.name})`
}

export interface KnownStory extends Matchable {
  /** Set only for stories the game can actually play. */
  worldId?: WorldId
}

function playable(world: World): KnownStory {
  return {
    worldId: world.id,
    name: storyLabel(world),
    // The story alone, the world alone, and the usual shorthand all count.
    aliases: [world.story, world.name, `${world.name} ${world.story}`, ...world.aliases],
  }
}

/** Every story the player can type, playable worlds first. Decoys keep the suggestions honest. */
export const KNOWN_STORIES: KnownStory[] = [
  ...worlds.map(playable),
  ...decoys.map((decoy) => ({
    name: storyLabel(decoy),
    aliases: [decoy.story, decoy.name, ...decoy.aliases],
  })),
]

export function knownStory(worldId: WorldId): KnownStory {
  const hit = KNOWN_STORIES.find((story) => story.worldId === worldId)
  if (!hit) throw new Error(`No known story for ${worldId}`)
  return hit
}
