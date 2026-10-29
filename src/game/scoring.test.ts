import { describe, expect, it } from 'vitest'
import {
  MAX_SCORE,
  SCORING,
  rankTitle,
  scoreLocation,
  scoreTrivia,
  scoreWorld,
  worldClueCost,
} from './scoring'

const clean = { wrongGuesses: 0, cluesUsed: 0, labelledShown: false, usedFallback: false }

describe('scoreWorld', () => {
  it('awards full marks for an unaided answer', () => {
    expect(scoreWorld(clean)).toBe(100)
  })

  it('charges wrong guesses', () => {
    expect(scoreWorld({ ...clean, wrongGuesses: 2 })).toBe(80)
  })

  it('charges more for each later clue', () => {
    expect(worldClueCost(0)).toBeLessThan(worldClueCost(1))
    expect(worldClueCost(1)).toBeLessThan(worldClueCost(2))
    expect(scoreWorld({ ...clean, cluesUsed: 1 })).toBe(90)
    expect(scoreWorld({ ...clean, cluesUsed: 3 })).toBe(40)
  })

  it('charges for the labelled map', () => {
    expect(scoreWorld({ ...clean, labelledShown: true })).toBe(75)
  })

  it('caps the multiple-choice fallback', () => {
    expect(scoreWorld({ ...clean, usedFallback: true })).toBe(SCORING.world.fallbackCap)
  })

  it('never drops below the floor, however badly it goes', () => {
    const worst = { wrongGuesses: 50, cluesUsed: 3, labelledShown: true, usedFallback: true }
    expect(scoreWorld(worst)).toBe(SCORING.floor)
    expect(scoreWorld({ ...worst, usedFallback: false })).toBe(SCORING.floor)
  })
})

describe('scoreLocation', () => {
  it('charges a small amount for each wrong place', () => {
    expect(scoreLocation({ wrongPins: 0 })).toBe(100)
    expect(scoreLocation({ wrongPins: 4 })).toBe(80)
  })

  it('never drops below the floor', () => {
    expect(scoreLocation({ wrongPins: 100 })).toBe(SCORING.floor)
  })
})

describe('scoreTrivia', () => {
  it('charges per wrong answer and holds the floor', () => {
    expect(scoreTrivia({ wrongAnswers: 0 })).toBe(100)
    expect(scoreTrivia({ wrongAnswers: 3 })).toBe(70)
    expect(scoreTrivia({ wrongAnswers: 99 })).toBe(SCORING.floor)
  })
})

describe('rankTitle', () => {
  it('has a title for every possible total', () => {
    for (let total = 0; total <= MAX_SCORE; total += 10) {
      expect(rankTitle(total).length).toBeGreaterThan(0)
    }
  })

  it('rewards the best total with the top title', () => {
    expect(rankTitle(MAX_SCORE)).toBe('Keeper of Every Tale')
    expect(rankTitle(30)).toBe('Dog-Eared Wanderer')
  })
})
