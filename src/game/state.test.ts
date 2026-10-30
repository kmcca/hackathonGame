import { describe, expect, it } from 'vitest'
import { getTarget, getWorld, worlds } from '../worlds'
import type { WorldId } from '../worlds'
import { INTRO_BEATS } from '../story/intro'
import {
  FALLBACK_AFTER,
  QUESTIONS_ASKED,
  computeScores,
  createGame,
  fragmentsEarned,
  pickQuestionOrder,
  pickWorldId,
  reducer,
  shouldPulseTarget,
} from './state'
import type { Action, GameState } from './state'
import { SCORING } from './scoring'

function run(state: GameState, ...actions: Action[]): GameState {
  return actions.reduce(reducer, state)
}

function started(worldId: WorldId): GameState {
  const world = getWorld(worldId)
  const order = world.trivia.slice(0, QUESTIONS_ASKED).map((_, i) => i)
  return run(
    createGame(worldId, order),
    { type: 'SET_NAME', name: 'Ada' },
    { type: 'START_STORY' },
    { type: 'SKIP_INTRO' },
  )
}

const wrongWorld = (id: WorldId) => worlds.find((w) => w.id !== id)!

describe('intro', () => {
  it('needs a name before the story starts', () => {
    const blank = run(createGame('oz', [0, 1, 2]), { type: 'SET_NAME', name: '   ' }, { type: 'START_STORY' })
    expect(blank.introStep).toBe(0)
  })

  it('trims the name and walks every beat into the first stage', () => {
    let state = run(createGame('oz', [0, 1, 2]), { type: 'SET_NAME', name: '  Ada ' }, { type: 'START_STORY' })
    expect(state.playerName).toBe('Ada')
    for (let i = 0; i < INTRO_BEATS.length; i++) state = reducer(state, { type: 'ADVANCE_INTRO' })
    expect(state.phase).toBe('identifyWorld')
  })

  it('can be skipped', () => {
    expect(started('oz').phase).toBe('identifyWorld')
  })
})

describe('identify the world', () => {
  it('accepts the world by name or alias and scores it cleanly', () => {
    const state = run(started('westeros'), { type: 'GUESS_WORLD', text: 'Game of Thrones' })
    expect(state.identify.solved).toBe(true)
    expect(computeScores(state).world).toBe(100)
  })

  it('records wrong guesses, including other known stories', () => {
    const state = run(
      started('westeros'),
      { type: 'GUESS_WORLD', text: 'Earthsea' },
      { type: 'GUESS_WORLD', text: wrongWorld('westeros').name },
    )
    expect(state.identify.wrongGuesses).toHaveLength(2)
    expect(state.identify.solved).toBe(false)
  })

  it('ignores empty guesses', () => {
    const state = run(started('oz'), { type: 'GUESS_WORLD', text: '  ' })
    expect(state.identify.wrongGuesses).toHaveLength(0)
  })

  it('holds the labelled map back until every clue has been used', () => {
    let state = run(started('oz'), { type: 'SHOW_LABELLED' })
    expect(state.identify.labelledShown).toBe(false)
    state = run(state, { type: 'WORLD_CLUE' }, { type: 'WORLD_CLUE' }, { type: 'WORLD_CLUE' }, { type: 'WORLD_CLUE' })
    expect(state.identify.cluesUsed).toBe(3)
    state = run(state, { type: 'SHOW_LABELLED' })
    expect(state.identify.labelledShown).toBe(true)
  })

  it('offers the multiple-choice fallback only after enough misses', () => {
    let state = run(started('oz'), { type: 'FALLBACK_GUESS', worldId: 'oz' })
    expect(state.identify.solved).toBe(false)
    for (let i = 0; i < FALLBACK_AFTER; i++) state = reducer(state, { type: 'GUESS_WORLD', text: 'Earthsea' })
    state = reducer(state, { type: 'FALLBACK_GUESS', worldId: 'oz' })
    expect(state.identify.solved).toBe(true)
    expect(state.identify.usedFallback).toBe(true)
    expect(computeScores(state).world).toBeLessThanOrEqual(SCORING.world.fallbackCap)
  })
})

describe('find the location', () => {
  const atFind = (id: WorldId) =>
    run(started(id), { type: 'GUESS_WORLD', text: getWorld(id).name }, { type: 'CONTINUE' })

  it('counts wrong pins and solves on the target', () => {
    const world = getWorld('oz')
    const wrong = world.pins.find((p) => p.id !== world.targetId)!
    const state = run(
      atFind('oz'),
      { type: 'TAP_PIN', pinId: wrong.id },
      { type: 'TAP_PIN', pinId: wrong.id },
      { type: 'TAP_PIN', pinId: world.targetId },
    )
    expect(state.find.guessedPinIds).toEqual([wrong.id, world.targetId])
    expect(state.find.solved).toBe(true)
    expect(computeScores(state).location).toBe(100 - SCORING.location.wrongPin)
  })

  it('pulses the target after enough wrong pins, then stops once solved', () => {
    const world = getWorld('westeros')
    const wrongPins = world.pins.filter((p) => p.id !== world.targetId)
    let state = atFind('westeros')
    for (const pin of wrongPins.slice(0, SCORING.location.pulseAfter - 1)) {
      state = reducer(state, { type: 'TAP_PIN', pinId: pin.id })
    }
    expect(shouldPulseTarget(state)).toBe(false)
    state = reducer(state, { type: 'TAP_PIN', pinId: wrongPins[SCORING.location.pulseAfter - 1].id })
    expect(shouldPulseTarget(state)).toBe(true)
    state = reducer(state, { type: 'TAP_PIN', pinId: getTarget(world).id })
    expect(shouldPulseTarget(state)).toBe(false)
  })

  it('rejects unknown pins', () => {
    const state = run(atFind('oz'), { type: 'TAP_PIN', pinId: 'nowhere' })
    expect(state.find.guessedPinIds).toHaveLength(0)
  })
})

describe('trivia', () => {
  it('cannot be passed until the question is answered correctly', () => {
    const state = run(
      started('oz'),
      { type: 'GUESS_WORLD', text: 'oz' },
      { type: 'CONTINUE' },
      { type: 'TAP_PIN', pinId: getWorld('oz').targetId },
      { type: 'CONTINUE' },
      { type: 'CONTINUE' },
    )
    expect(state.phase).toBe('trivia')
    expect(state.trivia.current).toBe(0)
  })
})

describe('dead ends', () => {
  it.each(worlds.map((w) => w.id))('%s: failing everything still reaches the ending', (id) => {
    const world = getWorld(id)
    let state = started(id)

    // Every wrong guess, every clue, the labelled map, then the fallback.
    for (let i = 0; i < 6; i++) state = reducer(state, { type: 'GUESS_WORLD', text: 'Earthsea' })
    for (let i = 0; i < 3; i++) state = reducer(state, { type: 'WORLD_CLUE' })
    state = reducer(state, { type: 'SHOW_LABELLED' })
    for (const other of worlds.filter((w) => w.id !== id)) {
      state = reducer(state, { type: 'FALLBACK_GUESS', worldId: other.id })
    }
    state = reducer(state, { type: 'FALLBACK_GUESS', worldId: id })
    expect(state.identify.solved).toBe(true)
    state = reducer(state, { type: 'CONTINUE' })

    // Every wrong pin, then the target.
    for (const pin of world.pins.filter((p) => p.id !== world.targetId)) {
      state = reducer(state, { type: 'TAP_PIN', pinId: pin.id })
    }
    state = reducer(state, { type: 'TAP_PIN', pinId: world.targetId })
    expect(state.find.solved).toBe(true)
    state = reducer(state, { type: 'CONTINUE' })

    // Every wrong answer before each right one.
    for (let q = 0; q < QUESTIONS_ASKED; q++) {
      const question = world.trivia[state.trivia.order[q]]
      question.options.forEach((_, option) => {
        if (option !== question.answer) state = reducer(state, { type: 'ANSWER', option })
      })
      state = reducer(state, { type: 'ANSWER', option: question.answer })
      state = reducer(state, { type: 'CONTINUE' })
    }
    expect(state.phase).toBe('binding')
    expect(fragmentsEarned(state)).toBe(QUESTIONS_ASKED)

    state = reducer(state, { type: 'FINISH_BINDING' })
    expect(state.phase).toBe('ending')

    const scores = computeScores(state)
    expect(scores.world).toBeGreaterThanOrEqual(SCORING.floor)
    expect(scores.location).toBeGreaterThanOrEqual(SCORING.floor)
    expect(scores.trivia).toBeGreaterThanOrEqual(SCORING.floor)
  })
})

describe('replay', () => {
  it('keeps the name, resets progress and skips the intro', () => {
    let state = started('oz')
    state = { ...state, phase: 'ending' }
    const next = reducer(state, { type: 'REPLAY', worldId: 'westeros', order: [0, 1, 2] })
    expect(next.phase).toBe('identifyWorld')
    expect(next.playerName).toBe('Ada')
    expect(next.worldId).toBe('westeros')
    expect(next.replay).toBe(true)
    expect(next.identify.wrongGuesses).toHaveLength(0)
  })

  it('picks a different world when one is to be avoided', () => {
    for (const id of worlds.map((w) => w.id)) {
      for (const roll of [0, 0.4, 0.99]) {
        expect(pickWorldId(() => roll, id)).not.toBe(id)
      }
    }
  })

  it('asks the right number of distinct questions', () => {
    const order = pickQuestionOrder(getWorld('oz'), Math.random)
    expect(order).toHaveLength(QUESTIONS_ASKED)
    expect(new Set(order).size).toBe(QUESTIONS_ASKED)
  })
})
