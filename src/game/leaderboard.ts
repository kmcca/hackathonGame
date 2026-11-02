/**
 * Rules for the Roll of Escapees, the shared top-10 board.
 * The browser and the serverless function both import this file, so it has no runtime imports.
 * The bounds below repeat scoring.ts and the world ids, and leaderboard.test.ts fails if they drift.
 */

export const ROLL_SIZE = 10
export const NAME_MAX = 24
/** Three stages at the 10-point floor, up to three stages at 100. */
export const SCORE_MIN = 30
export const SCORE_MAX = 300
export const WORLD_IDS = [
  'westeros',
  'middleEarth',
  'oz',
  'narnia',
  'treasureIsland',
  'hundredAcreWood',
  'panem',
] as const

export type RollWorldId = (typeof WORLD_IDS)[number]

/** What a player sends when they finish. The server adds the time. */
export interface RollSubmission {
  name: string
  score: number
  worldId: RollWorldId
}

export interface RollEntry extends RollSubmission {
  /** When the server first recorded this score, in milliseconds. Earlier wins a tie. */
  at: number
}

export type RollStatus = 'listed' | 'not-improved' | 'too-low'

export interface RollResponse {
  board: RollEntry[]
  status: RollStatus
  /** 1-based place on the board, or null when the run did not make the top 10. */
  place: number | null
}

/** Trims, collapses runs of whitespace, drops control characters and caps the length. */
export function cleanName(raw: string): string {
  return raw
    .normalize('NFKC')
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2066-\u2069]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, NAME_MAX)
    .trim()
}

/** One entry per name, whatever the capitalisation or spacing. */
export function nameKey(name: string): string {
  return cleanName(name).toLocaleLowerCase('en')
}

/**
 * Words that keep a name off the public board. It is a speed bump, not a guarantee: extend it when
 * something gets through. Words that are also ordinary names or story words (Dick, Hancock, Jon Snow's
 * "bastard") are left out on purpose, so nobody is blocked by accident.
 */
const BLOCKED_ANYWHERE = ['fuck', 'shit', 'bitch', 'asshole', 'whore']
/** Short enough to sit inside innocent words (Scunthorpe), so these only count as whole words. */
const BLOCKED_WHOLE = ['cunt', 'slut']

const LOOK_ALIKES: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', $: 's' }

export function isNameAllowed(name: string): boolean {
  if (!cleanName(name)) return false
  const plain = nameKey(name).replace(/[013457@$]/g, (ch) => LOOK_ALIKES[ch])
  // Spaces and punctuation are squashed out, so "f u c k" does not slip through.
  const squashed = plain.replace(/[^a-z]/g, '')
  if (BLOCKED_ANYWHERE.some((word) => squashed.includes(word))) return false
  return !plain.split(/[^a-z]+/).some((word) => BLOCKED_WHOLE.includes(word))
}

export function isScoreValid(score: unknown): score is number {
  return typeof score === 'number' && Number.isInteger(score) && score >= SCORE_MIN && score <= SCORE_MAX
}

export function isWorldId(value: unknown): value is RollWorldId {
  return typeof value === 'string' && (WORLD_IDS as readonly string[]).includes(value)
}

/** Turns anything a client might send into a submission, or null when it is not one. */
export function parseSubmission(body: unknown): RollSubmission | null {
  if (typeof body !== 'object' || body === null) return null
  const { name, score, worldId } = body as Record<string, unknown>
  if (typeof name !== 'string' || !isScoreValid(score) || !isWorldId(worldId)) return null
  const cleaned = cleanName(name)
  if (!cleaned) return null
  return { name: cleaned, score, worldId }
}

/** Parses a stored entry, dropping anything malformed instead of breaking the whole board. */
export function parseEntry(raw: unknown): RollEntry | null {
  if (typeof raw !== 'object' || raw === null) return null
  const base = parseSubmission(raw)
  const at = (raw as Record<string, unknown>).at
  if (!base || typeof at !== 'number' || !Number.isFinite(at)) return null
  return { ...base, at }
}

/**
 * One number that sorts the board: higher scores first, and among equal scores the earlier one.
 * It must stay below 2^53, so `at` has to be an ordinary millisecond timestamp.
 */
const TIME_SPAN = 1e13
export function sortValue(score: number, at: number): number {
  return score * TIME_SPAN + (TIME_SPAN - at)
}

/** The headline for the player's result, in the voice of the rest of the game. */
export function describePlacement(response: RollResponse, score: number): string {
  const last = response.board[ROLL_SIZE - 1]
  switch (response.status) {
    case 'listed':
      return response.place === 1
        ? 'First on the Roll. No one has escaped better.'
        : `You are number ${response.place} on the Roll of Escapees.`
    case 'not-improved':
      return response.place
        ? `Your name already stands at number ${response.place} with a better score. This run does not replace it.`
        : 'Your name already holds a better score. This run does not replace it.'
    case 'too-low':
      return last
        ? `${score} did not reach the Roll. Tenth place holds ${last.score}.`
        : `${score} did not reach the Roll.`
  }
}
