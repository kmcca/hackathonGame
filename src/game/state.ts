import { getTarget, getWorld, worlds } from '../worlds'
import type { Difficulty, World, WorldId } from '../worlds'
import { INTRO_BEATS } from '../story/intro'
import { findMatch } from './match'
import { KNOWN_STORIES } from './stories'
import {
  MAX_SCORE,
  SCORING,
  scoreLocation,
  scoreTrivia,
  scoreWorld,
} from './scoring'

export type Phase = 'intro' | 'identifyWorld' | 'findLocation' | 'trivia' | 'binding' | 'ending'

/** Each game asks one easy question, then two moderate, then two hard. */
export const QUESTION_MIX: { difficulty: Difficulty; count: number }[] = [
  { difficulty: 'easy', count: 1 },
  { difficulty: 'moderate', count: 2 },
  { difficulty: 'hard', count: 2 },
]
export const QUESTIONS_ASKED = QUESTION_MIX.reduce((sum, tier) => sum + tier.count, 0)
/** Wrong guesses before the multiple-choice fallback appears. */
export const FALLBACK_AFTER = 3

export interface IdentifyState {
  wrongGuesses: string[]
  cluesUsed: number
  labelledShown: boolean
  usedFallback: boolean
  /** Worlds ruled out in the fallback. */
  fallbackRuledOut: WorldId[]
  solved: boolean
}

export interface FindState {
  guessedPinIds: string[]
  solved: boolean
}

export interface TriviaState {
  /** Indexes into world.trivia, in the order they are asked. */
  order: number[]
  current: number
  /** Options ruled out so far, per question. */
  ruledOut: number[][]
  solved: boolean[]
}

export interface GameState {
  phase: Phase
  playerName: string
  /** 0 is the name screen; 1 onward are story beats. */
  introStep: number
  /** True when the player has escaped one book and been drawn into another. */
  replay: boolean
  worldId: WorldId
  identify: IdentifyState
  find: FindState
  trivia: TriviaState
}

export type Action =
  | { type: 'SET_NAME'; name: string }
  | { type: 'START_STORY' }
  | { type: 'ADVANCE_INTRO' }
  | { type: 'SKIP_INTRO' }
  | { type: 'GUESS_WORLD'; text: string }
  | { type: 'WORLD_CLUE' }
  | { type: 'SHOW_LABELLED' }
  | { type: 'FALLBACK_GUESS'; worldId: WorldId }
  | { type: 'TAP_PIN'; pinId: string }
  | { type: 'ANSWER'; option: number }
  | { type: 'CONTINUE' }
  | { type: 'FINISH_BINDING' }
  | { type: 'REPLAY'; worldId: WorldId; order: number[] }

/** Whether typed text names the given world. Decoys and other worlds never count. */
export function isWorldGuess(text: string, worldId: WorldId): boolean {
  return findMatch(text, KNOWN_STORIES)?.worldId === worldId
}

export function shuffle<T>(items: T[], rng: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Chooses questions at random within each difficulty and orders them easiest first. */
export function pickQuestionOrder(world: World, rng: () => number): number[] {
  return QUESTION_MIX.flatMap(({ difficulty, count }) => {
    const pool = world.trivia.flatMap((question, index) => (question.difficulty === difficulty ? [index] : []))
    return shuffle(pool, rng).slice(0, count)
  })
}

/** Picks a world, avoiding the one just played when there is a choice. */
export function pickWorldId(rng: () => number, avoid?: WorldId): WorldId {
  const pool = worlds.filter((w) => w.id !== avoid)
  const choices = pool.length ? pool : worlds
  return choices[Math.floor(rng() * choices.length)].id
}

export function createGame(worldId: WorldId, order: number[], playerName = ''): GameState {
  return {
    phase: 'intro',
    playerName,
    introStep: 0,
    replay: false,
    worldId,
    identify: {
      wrongGuesses: [],
      cluesUsed: 0,
      labelledShown: false,
      usedFallback: false,
      fallbackRuledOut: [],
      solved: false,
    },
    find: { guessedPinIds: [], solved: false },
    trivia: {
      order,
      current: 0,
      ruledOut: order.map(() => []),
      solved: order.map(() => false),
    },
  }
}

export function reducer(state: GameState, action: Action): GameState {
  const world = getWorld(state.worldId)

  switch (action.type) {
    case 'SET_NAME':
      return { ...state, playerName: action.name.slice(0, 24) }

    case 'START_STORY':
      if (state.phase !== 'intro' || !state.playerName.trim()) return state
      return { ...state, playerName: state.playerName.trim(), introStep: 1 }

    case 'ADVANCE_INTRO': {
      if (state.phase !== 'intro' || state.introStep === 0) return state
      if (state.introStep >= INTRO_BEATS.length) return { ...state, phase: 'identifyWorld' }
      return { ...state, introStep: state.introStep + 1 }
    }

    case 'SKIP_INTRO':
      if (state.phase !== 'intro' || state.introStep === 0) return state
      return { ...state, phase: 'identifyWorld' }

    case 'GUESS_WORLD': {
      const { identify } = state
      if (state.phase !== 'identifyWorld' || identify.solved || !action.text.trim()) return state
      if (isWorldGuess(action.text, state.worldId)) {
        return { ...state, identify: { ...identify, solved: true } }
      }
      return {
        ...state,
        identify: { ...identify, wrongGuesses: [...identify.wrongGuesses, action.text.trim()] },
      }
    }

    case 'WORLD_CLUE': {
      const { identify } = state
      if (state.phase !== 'identifyWorld' || identify.solved || identify.cluesUsed >= world.worldClues.length) {
        return state
      }
      return { ...state, identify: { ...identify, cluesUsed: identify.cluesUsed + 1 } }
    }

    case 'SHOW_LABELLED': {
      const { identify } = state
      if (state.phase !== 'identifyWorld' || identify.solved || identify.cluesUsed < world.worldClues.length) {
        return state
      }
      return { ...state, identify: { ...identify, labelledShown: true } }
    }

    case 'FALLBACK_GUESS': {
      const { identify } = state
      if (
        state.phase !== 'identifyWorld' ||
        identify.solved ||
        identify.wrongGuesses.length < FALLBACK_AFTER ||
        identify.fallbackRuledOut.includes(action.worldId)
      ) {
        return state
      }
      if (action.worldId === state.worldId) {
        return { ...state, identify: { ...identify, solved: true, usedFallback: true } }
      }
      return {
        ...state,
        identify: {
          ...identify,
          usedFallback: true,
          fallbackRuledOut: [...identify.fallbackRuledOut, action.worldId],
        },
      }
    }

    case 'TAP_PIN': {
      const { find } = state
      if (state.phase !== 'findLocation' || find.solved || find.guessedPinIds.includes(action.pinId)) return state
      if (!world.pins.some((pin) => pin.id === action.pinId)) return state
      return {
        ...state,
        find: {
          ...find,
          guessedPinIds: [...find.guessedPinIds, action.pinId],
          solved: action.pinId === world.targetId,
        },
      }
    }

    case 'ANSWER': {
      const { trivia } = state
      if (state.phase !== 'trivia' || trivia.solved[trivia.current]) return state
      const question = world.trivia[trivia.order[trivia.current]]
      if (!question || action.option < 0 || action.option >= question.options.length) return state
      if (trivia.ruledOut[trivia.current].includes(action.option)) return state
      if (action.option === question.answer) {
        return {
          ...state,
          trivia: { ...trivia, solved: trivia.solved.map((s, i) => (i === trivia.current ? true : s)) },
        }
      }
      return {
        ...state,
        trivia: {
          ...trivia,
          ruledOut: trivia.ruledOut.map((list, i) => (i === trivia.current ? [...list, action.option] : list)),
        },
      }
    }

    case 'CONTINUE': {
      if (state.phase === 'identifyWorld' && state.identify.solved) return { ...state, phase: 'findLocation' }
      if (state.phase === 'findLocation' && state.find.solved) return { ...state, phase: 'trivia' }
      if (state.phase === 'trivia' && state.trivia.solved[state.trivia.current]) {
        if (state.trivia.current >= state.trivia.order.length - 1) return { ...state, phase: 'binding' }
        return { ...state, trivia: { ...state.trivia, current: state.trivia.current + 1 } }
      }
      return state
    }

    case 'FINISH_BINDING':
      return state.phase === 'binding' ? { ...state, phase: 'ending' } : state

    case 'REPLAY': {
      if (state.phase !== 'ending') return state
      return { ...createGame(action.worldId, action.order, state.playerName), phase: 'identifyWorld', replay: true }
    }
  }
}

export interface Scores {
  world: number
  location: number
  trivia: number
  total: number
}

export function wrongPins(state: GameState): number {
  return state.find.guessedPinIds.filter((id) => id !== getWorld(state.worldId).targetId).length
}

export function wrongAnswers(state: GameState): number {
  return state.trivia.ruledOut.reduce((sum, list) => sum + list.length, 0)
}

export function computeScores(state: GameState): Scores {
  const world = scoreWorld({
    wrongGuesses: state.identify.wrongGuesses.length,
    cluesUsed: state.identify.cluesUsed,
    labelledShown: state.identify.labelledShown,
    usedFallback: state.identify.usedFallback,
  })
  const location = scoreLocation({ wrongPins: wrongPins(state) })
  const trivia = scoreTrivia({ wrongAnswers: wrongAnswers(state) })
  return { world, location, trivia, total: world + location + trivia }
}

/** Whether the target should pulse on the map as a last-resort hint. */
export function shouldPulseTarget(state: GameState): boolean {
  return !state.find.solved && wrongPins(state) >= SCORING.location.pulseAfter
}

export function fragmentsEarned(state: GameState): number {
  return state.trivia.solved.filter(Boolean).length
}

export function targetName(state: GameState): string {
  return getTarget(getWorld(state.worldId)).name
}

export { MAX_SCORE }
