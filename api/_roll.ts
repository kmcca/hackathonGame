/**
 * The Roll of Escapees, independent of where it is stored. api/scores.ts plugs in Redis,
 * api/_memoryStore.ts plugs in a Map for tests and `npm run dev`. Files that start with an underscore
 * are not deployed as functions.
 */
import { ROLL_SIZE, isNameAllowed, nameKey, parseEntry, parseSubmission, sortValue } from '../src/game/leaderboard.js'
import type { RollEntry, RollResponse, RollStatus } from '../src/game/leaderboard.js'

/** The few operations the Roll needs. Members are name keys; values come from sortValue. */
export interface RollStore {
  /** Sets the member's value only if it is new or higher. Resolves true when it changed. */
  addIfHigher(member: string, value: number): Promise<boolean>
  setDetails(member: string, json: string): Promise<void>
  /** Every member, best first. */
  rankedMembers(): Promise<string[]>
  remove(members: string[]): Promise<void>
  details(members: string[]): Promise<(string | null)[]>
  /** Counts a submission from this address in the current minute and resolves the count so far. */
  hit(address: string): Promise<number>
}

export interface RollReply {
  status: number
  body: unknown
}

/** Submissions per address per minute. A person replaying quickly stays well under it. */
export const RATE_LIMIT = 20

const reply = (status: number, body: unknown): RollReply => ({ status, body })

export async function readBoard(store: RollStore): Promise<RollEntry[]> {
  const members = (await store.rankedMembers()).slice(0, ROLL_SIZE)
  const stored = await store.details(members)
  return stored.flatMap((json) => {
    try {
      const entry = json ? parseEntry(JSON.parse(json)) : null
      return entry ? [entry] : []
    } catch {
      return []
    }
  })
}

async function submit(store: RollStore, body: unknown, address: string, now: number): Promise<RollReply> {
  const submission = parseSubmission(body)
  if (!submission) return reply(400, { error: 'invalid' })
  if (!isNameAllowed(submission.name)) return reply(422, { error: 'name' })
  if ((await store.hit(address)) > RATE_LIMIT) return reply(429, { error: 'slow-down' })

  const member = nameKey(submission.name)
  const changed = await store.addIfHigher(member, sortValue(submission.score, now))
  if (changed) await store.setDetails(member, JSON.stringify({ ...submission, at: now }))

  // Only the top ten are kept, so the board cannot grow without limit.
  const stale = (await store.rankedMembers()).slice(ROLL_SIZE)
  if (stale.length) await store.remove(stale)

  const board = await readBoard(store)
  const index = board.findIndex((entry) => nameKey(entry.name) === member)
  const place = index === -1 ? null : index + 1
  const status: RollStatus = place === null ? 'too-low' : changed ? 'listed' : 'not-improved'
  const response: RollResponse = { board, status, place }
  return reply(200, response)
}

/** GET returns the board. POST adds a score and returns the board with the player's place. */
export async function handleRoll(
  store: RollStore,
  method: string,
  body: unknown,
  address: string,
  now: number,
): Promise<RollReply> {
  if (method === 'GET') return reply(200, { board: await readBoard(store) })
  if (method === 'POST') return submit(store, body, address, now)
  return reply(405, { error: 'method' })
}
