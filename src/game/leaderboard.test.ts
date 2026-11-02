import { describe, expect, it } from 'vitest'
import { worlds } from '../worlds'
import {
  NAME_MAX,
  SCORE_MAX,
  SCORE_MIN,
  WORLD_IDS,
  cleanName,
  describePlacement,
  isNameAllowed,
  isScoreValid,
  nameKey,
  parseEntry,
  parseSubmission,
  sortValue,
} from './leaderboard'
import type { RollResponse } from './leaderboard'
import { MAX_SCORE, SCORING, STAGE_COUNT } from './scoring'

describe('constants that repeat other modules', () => {
  it('match the scoring bounds', () => {
    expect(SCORE_MAX).toBe(MAX_SCORE)
    expect(SCORE_MIN).toBe(SCORING.floor * STAGE_COUNT)
  })

  it('list every world', () => {
    expect([...WORLD_IDS].sort()).toEqual(worlds.map((w) => w.id).sort())
  })
})

describe('cleanName and nameKey', () => {
  it('trims, collapses spaces and caps the length', () => {
    expect(cleanName('  Ada   Lovelace ')).toBe('Ada Lovelace')
    expect(cleanName('x'.repeat(40))).toHaveLength(NAME_MAX)
  })

  it('removes control and zero-width characters', () => {
    expect(cleanName('Ad\u0000a​')).toBe('Ada')
  })

  it('treats capitalisation and spacing as the same name', () => {
    expect(nameKey('  SAM  Vimes')).toBe(nameKey('sam vimes'))
  })
})

describe('isNameAllowed', () => {
  it('allows ordinary names, including ones that contain a blocked-looking fragment', () => {
    for (const name of ['Sam', 'Hancock', 'Dickinson', 'Jon Snow, the Bastard', 'Scunthorpe', '李雷']) {
      expect(isNameAllowed(name), name).toBe(true)
    }
  })

  it('blocks listed words, however they are spaced or disguised', () => {
    for (const name of ['shit', 'SH1T', 'f u c k', 'b1tch', 'Mr Slut']) {
      expect(isNameAllowed(name), name).toBe(false)
    }
  })

  it('blocks names that are empty once cleaned', () => {
    expect(isNameAllowed('   ')).toBe(false)
    expect(isNameAllowed('​')).toBe(false)
  })
})

describe('isScoreValid', () => {
  it('accepts whole numbers from the floor to the maximum', () => {
    expect(isScoreValid(SCORE_MIN)).toBe(true)
    expect(isScoreValid(SCORE_MAX)).toBe(true)
  })

  it('rejects anything else', () => {
    for (const value of [SCORE_MIN - 1, SCORE_MAX + 1, 150.5, NaN, Infinity, '200', null, undefined]) {
      expect(isScoreValid(value), String(value)).toBe(false)
    }
  })
})

describe('parseSubmission', () => {
  const good = { name: ' Ada ', score: 240, worldId: 'oz' }

  it('cleans the name', () => {
    expect(parseSubmission(good)).toEqual({ name: 'Ada', score: 240, worldId: 'oz' })
  })

  it('drops the extra fields a client might add', () => {
    expect(parseSubmission({ ...good, at: 1, admin: true })).toEqual({ name: 'Ada', score: 240, worldId: 'oz' })
  })

  it('rejects bad shapes', () => {
    for (const body of [null, 'x', 7, [], { ...good, name: 5 }, { ...good, name: '  ' }, { ...good, worldId: 'mordor' }]) {
      expect(parseSubmission(body), JSON.stringify(body)).toBeNull()
    }
  })
})

describe('parseEntry', () => {
  it('needs a time as well', () => {
    expect(parseEntry({ name: 'Ada', score: 240, worldId: 'oz', at: 5 })).toEqual({
      name: 'Ada',
      score: 240,
      worldId: 'oz',
      at: 5,
    })
    expect(parseEntry({ name: 'Ada', score: 240, worldId: 'oz' })).toBeNull()
  })
})

describe('sortValue', () => {
  const now = 1_800_000_000_000

  it('puts a higher score first whatever the time', () => {
    expect(sortValue(250, now + 1e9)).toBeGreaterThan(sortValue(240, now))
  })

  it('puts the earlier of two equal scores first', () => {
    expect(sortValue(300, now)).toBeGreaterThan(sortValue(300, now + 1))
  })

  it('stays an exact integer at the top of the range', () => {
    expect(Number.isSafeInteger(sortValue(SCORE_MAX, 0))).toBe(true)
  })
})

describe('describePlacement', () => {
  const entry = (score: number) => ({ name: 'A', score, worldId: 'oz' as const, at: 1 })
  const full = { board: Array.from({ length: 10 }, (_, i) => entry(300 - i * 10)) }

  it('names the place when listed', () => {
    const response: RollResponse = { ...full, status: 'listed', place: 4 }
    expect(describePlacement(response, 270)).toContain('number 4')
  })

  it('celebrates first place', () => {
    expect(describePlacement({ ...full, status: 'listed', place: 1 }, 300)).toContain('First')
  })

  it('says why a run was not added', () => {
    expect(describePlacement({ ...full, status: 'not-improved', place: 2 }, 100)).toContain('better score')
    expect(describePlacement({ ...full, status: 'too-low', place: null }, 100)).toContain('Tenth place holds 210')
  })
})
