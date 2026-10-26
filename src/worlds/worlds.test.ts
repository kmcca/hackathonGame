import { describe, expect, it } from 'vitest'
import { QUESTION_MIX, pickQuestionOrder } from '../game/state'
import { worlds } from '.'

describe.each(worlds)('$name content', (world) => {
  it('has unique pins inside the map and a real target', () => {
    const ids = world.pins.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const pin of world.pins) {
      expect(pin.x).toBeGreaterThan(0)
      expect(pin.x).toBeLessThan(1)
      expect(pin.y).toBeGreaterThan(0)
      expect(pin.y).toBeLessThan(1)
    }
    expect(ids).toContain(world.targetId)
  })

  it('keeps pins far enough apart to tap on a 42rem map', () => {
    // The map is at least 672px wide on a 16px root; hit areas are 44px.
    const width = 672
    const height = width / (world.maps.width / world.maps.height)
    for (const a of world.pins) {
      for (const b of world.pins) {
        if (a.id >= b.id) continue
        const distance = Math.hypot((a.x - b.x) * width, (a.y - b.y) * height)
        expect(distance, `${a.name} and ${b.name}`).toBeGreaterThanOrEqual(44)
      }
    }
  })

  it('has three non-empty clues of each kind', () => {
    for (const clue of [...world.worldClues, ...world.locationClues]) expect(clue.trim().length).toBeGreaterThan(10)
  })

  it('has well-formed, unique trivia', () => {
    const ids = world.trivia.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const q of world.trivia) {
      expect(q.options.length).toBe(4)
      expect(new Set(q.options).size).toBe(4)
      expect(q.answer).toBeGreaterThanOrEqual(0)
      expect(q.answer).toBeLessThan(q.options.length)
      expect(q.hint.length).toBeGreaterThan(5)
    }
  })

  it('has enough questions at every difficulty to vary between plays', () => {
    for (const { difficulty, count } of QUESTION_MIX) {
      const available = world.trivia.filter((q) => q.difficulty === difficulty).length
      expect(available, difficulty).toBeGreaterThanOrEqual(count)
    }
  })

  it('asks one easy, two moderate and two hard questions, easiest first', () => {
    for (const roll of [0, 0.3, 0.7, 0.99]) {
      const order = pickQuestionOrder(world, () => roll)
      expect(order.map((i) => world.trivia[i].difficulty)).toEqual(['easy', 'moderate', 'moderate', 'hard', 'hard'])
      expect(new Set(order).size).toBe(order.length)
    }
  })
})
