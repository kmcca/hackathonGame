import { describe, expect, it } from 'vitest'
import { worlds } from '../worlds'
import { findMatch, levenshtein, matches, normalize, suggest } from './match'
import { KNOWN_STORIES, knownStory, storyLabel } from './stories'

describe('normalize', () => {
  it('ignores case, punctuation, accents and a leading "the"', () => {
    expect(normalize('  The   Lórd of the Rings! ')).toBe('lord of the rings')
    expect(normalize('Middle-earth')).toBe('middle earth')
  })

  it('treats parentheses as spaces', () => {
    expect(normalize('The Lord of the Rings (Middle-earth)')).toBe('lord of the rings middle earth')
  })
})

describe('levenshtein', () => {
  it('counts single edits', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3)
    expect(levenshtein('oz', 'oz')).toBe(0)
  })
})

describe('story labels', () => {
  it('shows the story with its world in parentheses', () => {
    const labels = worlds.map(storyLabel)
    expect(labels).toContain('The Lord of the Rings (Middle-earth)')
    expect(labels).toContain('A Song of Ice and Fire (Westeros)')
    expect(labels).toContain('The Wizard of Oz (Oz)')
  })
})

describe('matches', () => {
  const westeros = knownStory('westeros')
  const oz = knownStory('oz')
  const middleEarth = knownStory('middleEarth')

  it('accepts the full label, the story alone, the world alone, and aliases', () => {
    expect(matches('A Song of Ice and Fire (Westeros)', westeros)).toBe(true)
    expect(matches('a song of ice and fire', westeros)).toBe(true)
    expect(matches('Westeros', westeros)).toBe(true)
    expect(matches('GAME OF THRONES', westeros)).toBe(true)
    expect(matches('The Lord of the Rings (Middle-earth)', middleEarth)).toBe(true)
    expect(matches('Middle-earth', middleEarth)).toBe(true)
  })

  it('forgives a small typo in longer names', () => {
    expect(matches('Westoros', westeros)).toBe(true)
    expect(matches('wizard of os', oz)).toBe(true)
  })

  it('does not forgive typos in very short names', () => {
    expect(matches('ox', oz)).toBe(false)
  })

  it('rejects other stories and empty input', () => {
    expect(matches('Earthsea', westeros)).toBe(false)
    expect(matches('', westeros)).toBe(false)
    expect(matches('   ', westeros)).toBe(false)
  })

  it('never lets one world accept another world\'s name or alias', () => {
    for (const a of KNOWN_STORIES.filter((s) => s.worldId)) {
      for (const b of KNOWN_STORIES.filter((s) => s.worldId && s.worldId !== a.worldId)) {
        for (const name of [b.name, ...b.aliases]) expect(matches(name, a)).toBe(false)
      }
    }
  })

  it('resolves every label and alias of a playable world to that world, and decoys to none', () => {
    for (const story of KNOWN_STORIES) {
      for (const name of [story.name, ...story.aliases]) {
        expect(findMatch(name, KNOWN_STORIES)?.worldId).toBe(story.worldId)
      }
    }
  })
})

describe('suggest', () => {
  it('returns nothing for empty input', () => {
    expect(suggest('', KNOWN_STORIES)).toEqual([])
  })

  it('suggests full "Story (World)" labels', () => {
    expect(suggest('lord', KNOWN_STORIES)).toContain('The Lord of the Rings (Middle-earth)')
  })

  it('includes decoys so suggestions never give the answer away', () => {
    const result = suggest('e', KNOWN_STORIES)
    expect(result).toContain('A Wizard of Earthsea (Earthsea)')
    expect(result.length).toBeGreaterThan(1)
  })

  it('puts prefix matches ahead of looser matches', () => {
    expect(suggest('w', KNOWN_STORIES)[0]).toMatch(/Westeros|Wizard|Wonderland|Winnie/)
  })

  it('finds a story through the world name or an alias', () => {
    expect(suggest('middle', KNOWN_STORIES)).toContain('The Lord of the Rings (Middle-earth)')
    expect(suggest('thrones', KNOWN_STORIES)).toContain('A Song of Ice and Fire (Westeros)')
  })

  it('respects the limit', () => {
    expect(suggest('e', KNOWN_STORIES, 3).length).toBeLessThanOrEqual(3)
  })
})
