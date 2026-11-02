import { beforeEach, describe, expect, it } from 'vitest'
import type { RollResponse } from '../src/game/leaderboard.js'
import { createMemoryStore } from './_memoryStore.js'
import { RATE_LIMIT, handleRoll } from './_roll.js'
import type { RollStore } from './_roll.js'

const T0 = 1_800_000_000_000
let store: RollStore
let tick: number

beforeEach(() => {
  store = createMemoryStore(() => T0 + tick)
  tick = 0
})

async function post(name: string, score: number, worldId = 'oz', address = 'a') {
  tick += 1
  return handleRoll(store, 'POST', { name, score, worldId }, address, T0 + tick)
}

const asResponse = (body: unknown) => body as RollResponse

describe('reading the board', () => {
  it('starts empty', async () => {
    expect(await handleRoll(store, 'GET', null, 'a', T0)).toEqual({ status: 200, body: { board: [] } })
  })

  it('refuses other methods', async () => {
    expect((await handleRoll(store, 'DELETE', null, 'a', T0)).status).toBe(405)
  })
})

describe('submitting a score', () => {
  it('lists a first score at number one', async () => {
    const { status, body } = await post('Ada', 240)
    expect(status).toBe(200)
    expect(asResponse(body)).toMatchObject({ status: 'listed', place: 1 })
    expect(asResponse(body).board).toEqual([{ name: 'Ada', score: 240, worldId: 'oz', at: T0 + 1 }])
  })

  it('orders by score, best first', async () => {
    await post('Low', 100)
    await post('High', 280)
    const { body } = await post('Mid', 200)
    expect(asResponse(body).board.map((e) => e.name)).toEqual(['High', 'Mid', 'Low'])
    expect(asResponse(body).place).toBe(2)
  })

  it('puts the earlier of two equal scores first', async () => {
    await post('First', 300)
    const { body } = await post('Second', 300)
    expect(asResponse(body).board.map((e) => e.name)).toEqual(['First', 'Second'])
    expect(asResponse(body).place).toBe(2)
  })
})

describe('one entry per name', () => {
  it('replaces an entry only with a better score', async () => {
    await post('Ada', 200)
    const better = asResponse((await post('Ada', 250)).body)
    expect(better).toMatchObject({ status: 'listed', place: 1 })
    expect(better.board).toHaveLength(1)
    expect(better.board[0].score).toBe(250)
  })

  it('keeps the old entry, and says so, when the new score is not better', async () => {
    await post('Ada', 250)
    const worse = asResponse((await post('Ada', 200)).body)
    expect(worse).toMatchObject({ status: 'not-improved', place: 1 })
    expect(worse.board[0].score).toBe(250)
  })

  it('keeps the first time on an equal score', async () => {
    await post('Ada', 250)
    const again = asResponse((await post('Ada', 250)).body)
    expect(again.status).toBe('not-improved')
    expect(again.board[0].at).toBe(T0 + 1)
  })

  it('counts different capitalisation and spacing as the same name', async () => {
    await post('Ada Lovelace', 200)
    const { body } = await post('  ada   LOVELACE ', 220)
    expect(asResponse(body).board).toHaveLength(1)
    expect(asResponse(body).board[0]).toMatchObject({ name: 'ada LOVELACE', score: 220 })
  })

  it('is safe to submit the same result twice', async () => {
    await post('Ada', 250)
    await post('Ada', 250)
    expect(asResponse((await handleRoll(store, 'GET', null, 'a', T0)).body).board).toHaveLength(1)
  })
})

describe('the top ten', () => {
  async function fill() {
    for (let i = 0; i < 10; i++) await post(`Player ${i}`, 100 + i * 10)
  }

  it('drops the lowest when a better score arrives', async () => {
    await fill()
    const { body } = await post('Newcomer', 155)
    const response = asResponse(body)
    expect(response.board).toHaveLength(10)
    expect(response.board.map((e) => e.name)).not.toContain('Player 0')
    expect(response).toMatchObject({ status: 'listed', place: 5 })
  })

  it('turns away a score that is too low, and does not store it', async () => {
    await fill()
    const { body } = await post('Newcomer', 90)
    expect(asResponse(body)).toMatchObject({ status: 'too-low', place: null })
    expect(asResponse(body).board.map((e) => e.name)).not.toContain('Newcomer')
  })

  it('lets a dropped player back in later with a better score', async () => {
    await post('Ada', 100)
    for (let i = 0; i < 10; i++) await post(`Player ${i}`, 120 + i * 10)
    const { body } = await post('Ada', 300)
    expect(asResponse(body)).toMatchObject({ status: 'listed', place: 1 })
  })
})

describe('bad input', () => {
  it('rejects scores no one can earn', async () => {
    for (const score of [0, 29, 301, 99.5, -10]) {
      expect((await post('Ada', score)).status, String(score)).toBe(400)
    }
  })

  it('rejects an unknown world and a missing body', async () => {
    expect((await post('Ada', 200, 'mordor')).status).toBe(400)
    expect((await handleRoll(store, 'POST', null, 'a', T0)).status).toBe(400)
  })

  it('keeps blocked names off the board', async () => {
    expect((await post('sh1t', 200)).status).toBe(422)
    expect(asResponse((await handleRoll(store, 'GET', null, 'a', T0)).body).board).toEqual([])
  })

  it('slows an address that posts too often, but not others', async () => {
    for (let i = 0; i < RATE_LIMIT; i++) expect((await post(`P${i}`, 100, 'oz', 'busy')).status).toBe(200)
    expect((await post('One more', 100, 'oz', 'busy')).status).toBe(429)
    expect((await post('One more', 100, 'oz', 'quiet')).status).toBe(200)
  })

  it('stores names as text, never as markup', async () => {
    const { body } = await post('<script>alert(1)</script>', 200)
    expect(asResponse(body).board[0].name).toBe('<script>alert(1)</script>'.slice(0, 24))
  })
})
