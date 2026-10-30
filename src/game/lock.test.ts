import { describe, expect, it } from 'vitest'
import { RUNE_COUNT, RUNES, createLock, describeClue, holds, inPlace, isUnique } from './lock'
import type { Clue } from './lock'

/** A small seeded generator so each test lock is the same every run. */
function seeded(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

const SEEDS = Array.from({ length: 60 }, (_, i) => i + 1)

describe('createLock', () => {
  it('uses every rune exactly once in the solution and the start', () => {
    const ids = RUNES.map((rune) => rune.id).sort()
    for (const seed of SEEDS) {
      const lock = createLock(seeded(seed))
      expect([...lock.solution].sort()).toEqual(ids)
      expect([...lock.start].sort()).toEqual(ids)
    }
  })

  it('only gives clues that are true of the solution', () => {
    for (const seed of SEEDS) {
      const lock = createLock(seeded(seed))
      for (const clue of lock.clues) expect(holds(clue, lock.solution)).toBe(true)
    }
  })

  it('leaves exactly one arrangement that satisfies the clues', () => {
    for (const seed of SEEDS) {
      const lock = createLock(seeded(seed))
      expect(isUnique(lock.clues)).toBe(true)
    }
  })

  it('carries no clue the others make unnecessary', () => {
    for (const seed of SEEDS) {
      const { clues } = createLock(seeded(seed))
      for (const clue of clues) expect(isUnique(clues.filter((other) => other !== clue))).toBe(false)
    }
  })

  it('keeps the clue count small and hands over at most one place outright', () => {
    for (const seed of SEEDS) {
      const { clues } = createLock(seeded(seed))
      expect(clues.length).toBeGreaterThanOrEqual(3)
      expect(clues.length).toBeLessThanOrEqual(6)
      expect(clues.filter((clue) => clue.kind === 'at').length).toBeLessThanOrEqual(1)
    }
  })

  it('starts with the runes not solved and at most one already in place', () => {
    for (const seed of SEEDS) {
      const lock = createLock(seeded(seed))
      expect(inPlace(lock.start, lock.solution)).toBeLessThanOrEqual(1)
    }
  })

  it('draws a different lock for a different seed', () => {
    const solutions = new Set(SEEDS.map((seed) => createLock(seeded(seed)).solution.join()))
    expect(solutions.size).toBeGreaterThan(10)
  })
})

describe('holds', () => {
  const order = ['moon', 'leaf', 'flame', 'star', 'wave'] as const
  const arrangement = [...order]

  it('reads places from the left, starting at the first', () => {
    expect(holds({ kind: 'at', rune: 'moon', place: 0 }, arrangement)).toBe(true)
    expect(holds({ kind: 'at', rune: 'moon', place: 1 }, arrangement)).toBe(false)
    expect(holds({ kind: 'notAt', rune: 'moon', place: 1 }, arrangement)).toBe(true)
  })

  it('checks order, neighbours and gaps', () => {
    expect(holds({ kind: 'before', rune: 'leaf', other: 'star' }, arrangement)).toBe(true)
    expect(holds({ kind: 'before', rune: 'star', other: 'leaf' }, arrangement)).toBe(false)
    expect(holds({ kind: 'beside', rune: 'flame', other: 'star' }, arrangement)).toBe(true)
    expect(holds({ kind: 'beside', rune: 'moon', other: 'flame' }, arrangement)).toBe(false)
    expect(holds({ kind: 'apart', rune: 'moon', other: 'flame' }, arrangement)).toBe(true)
    expect(holds({ kind: 'apart', rune: 'moon', other: 'leaf' }, arrangement)).toBe(false)
  })
})

describe('isUnique', () => {
  it('is false when too few clues are given', () => {
    expect(isUnique([{ kind: 'at', rune: 'moon', place: 0 }])).toBe(false)
  })

  it('is false when the clues contradict each other', () => {
    const clues: Clue[] = [
      { kind: 'at', rune: 'moon', place: 0 },
      { kind: 'at', rune: 'moon', place: 1 },
    ]
    expect(isUnique(clues)).toBe(false)
  })
})

describe('inPlace', () => {
  it('counts the runes sitting where the lock wants them', () => {
    const solution = ['moon', 'leaf', 'flame', 'star', 'wave'] as const
    expect(inPlace([...solution], [...solution])).toBe(RUNE_COUNT)
    expect(inPlace(['leaf', 'moon', 'flame', 'wave', 'star'], [...solution])).toBe(1)
    expect(inPlace(['leaf', 'moon', 'star', 'wave', 'flame'], [...solution])).toBe(0)
  })
})

describe('describeClue', () => {
  it('names runes and says places in words', () => {
    expect(describeClue({ kind: 'notAt', rune: 'moon', place: 2 })).toBe('The Moon rune does not sit in the third place.')
    expect(describeClue({ kind: 'before', rune: 'leaf', other: 'star' })).toBe(
      'The Leaf rune comes somewhere before the Star rune.',
    )
  })
})
