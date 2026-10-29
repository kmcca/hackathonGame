/**
 * Every stage is worth 100 points. Hints and mistakes have fixed, visible costs,
 * and no stage ever scores below the floor, so the player can always finish.
 */
export const SCORING = {
  stageMax: 100,
  floor: 10,
  world: {
    wrongGuess: 10,
    clueCosts: [10, 20, 30] as const,
    labelledMap: 25,
    /** The multiple-choice fallback unblocks the player but caps the stage. */
    fallbackCap: 40,
  },
  location: {
    wrongPin: 5,
    /** Wrong pins before the target pulses. */
    pulseAfter: 6,
  },
  trivia: {
    wrongAnswer: 10,
  },
} as const

export const STAGE_COUNT = 3
export const MAX_SCORE = SCORING.stageMax * STAGE_COUNT

export interface WorldStats {
  wrongGuesses: number
  cluesUsed: number
  labelledShown: boolean
  usedFallback: boolean
}

export interface LocationStats {
  wrongPins: number
}

export interface TriviaStats {
  wrongAnswers: number
}

export function worldClueCost(index: number): number {
  return SCORING.world.clueCosts[index] ?? 0
}

function clamp(raw: number, ceiling: number = SCORING.stageMax): number {
  return Math.min(ceiling, Math.max(SCORING.floor, raw))
}

export function scoreWorld(stats: WorldStats): number {
  const clues = SCORING.world.clueCosts.slice(0, stats.cluesUsed).reduce((sum, cost) => sum + cost, 0)
  const raw =
    SCORING.stageMax -
    stats.wrongGuesses * SCORING.world.wrongGuess -
    clues -
    (stats.labelledShown ? SCORING.world.labelledMap : 0)
  return clamp(raw, stats.usedFallback ? SCORING.world.fallbackCap : SCORING.stageMax)
}

export function scoreLocation(stats: LocationStats): number {
  return clamp(SCORING.stageMax - stats.wrongPins * SCORING.location.wrongPin)
}

export function scoreTrivia(stats: TriviaStats): number {
  return clamp(SCORING.stageMax - stats.wrongAnswers * SCORING.trivia.wrongAnswer)
}

const RANKS: { min: number; title: string }[] = [
  { min: 270, title: 'Keeper of Every Tale' },
  { min: 220, title: 'Storied Scholar' },
  { min: 160, title: 'Bookwalker' },
  { min: 100, title: 'Page Turner' },
  { min: 0, title: 'Dog-Eared Wanderer' },
]

export function rankTitle(total: number): string {
  return (RANKS.find((rank) => total >= rank.min) ?? RANKS[RANKS.length - 1]).title
}
