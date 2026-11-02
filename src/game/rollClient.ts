import { nameKey, parseSubmission } from './leaderboard'
import type { RollEntry, RollResponse, RollSubmission } from './leaderboard'

const ENDPOINT = '/api/scores'
const PENDING_KEY = 'pagebreak.pending'
/** A few unsent scores are plenty; this stops a long outage from filling storage. */
const PENDING_MAX = 5

export type RollOutcome<T> =
  | { kind: 'ok'; value: T }
  /** The service could not be reached or gave an unusable answer. Trying again later may work. */
  | { kind: 'offline' }
  /** The service understood the score and said no. Trying again will not help. */
  | { kind: 'refused'; reason: 'name' | 'invalid' | 'slow-down' }

function isBoard(value: unknown): value is RollEntry[] {
  return Array.isArray(value)
}

async function call(init?: RequestInit): Promise<{ status: number; body: unknown } | null> {
  try {
    const response = await fetch(ENDPOINT, { cache: 'no-store', ...init })
    // The dev server answers unknown paths with the page itself, so anything that is not JSON counts as unreachable.
    return { status: response.status, body: await response.json() }
  } catch {
    return null
  }
}

export async function fetchBoard(): Promise<RollOutcome<RollEntry[]>> {
  const result = await call()
  const board = (result?.body as { board?: unknown } | undefined)?.board
  return result?.status === 200 && isBoard(board) ? { kind: 'ok', value: board } : { kind: 'offline' }
}

export async function postScore(submission: RollSubmission): Promise<RollOutcome<RollResponse>> {
  const result = await call({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submission),
  })
  if (!result) return { kind: 'offline' }
  const body = result.body as Partial<RollResponse> & { error?: string }
  if (result.status === 200 && isBoard(body.board) && body.status) return { kind: 'ok', value: body as RollResponse }
  if (result.status === 422) return { kind: 'refused', reason: 'name' }
  if (result.status === 400) return { kind: 'refused', reason: 'invalid' }
  if (result.status === 429) return { kind: 'refused', reason: 'slow-down' }
  return { kind: 'offline' }
}

/** Scores that could not be sent, kept in this browser until the Roll can be reached. */
export function createPendingQueue(storage: Pick<Storage, 'getItem' | 'setItem'>) {
  const read = (): RollSubmission[] => {
    try {
      const parsed: unknown = JSON.parse(storage.getItem(PENDING_KEY) ?? '[]')
      return Array.isArray(parsed) ? parsed.flatMap((item) => parseSubmission(item) ?? []) : []
    } catch {
      return []
    }
  }
  const write = (items: RollSubmission[]) => {
    try {
      storage.setItem(PENDING_KEY, JSON.stringify(items.slice(-PENDING_MAX)))
    } catch {
      // Without storage the score simply is not kept.
    }
  }

  return {
    list: read,
    /** Keeps only the best score for each name. */
    add(submission: RollSubmission) {
      const key = nameKey(submission.name)
      const others = read().filter((item) => nameKey(item.name) !== key)
      const same = read().find((item) => nameKey(item.name) === key)
      write([...others, same && same.score >= submission.score ? same : submission])
    },
    remove(name: string) {
      const key = nameKey(name)
      write(read().filter((item) => nameKey(item.name) !== key))
    },
  }
}

function browserQueue() {
  return createPendingQueue(localStorage)
}

export const pendingScores = {
  add: (submission: RollSubmission) => browserQueue().add(submission),
  remove: (name: string) => browserQueue().remove(name),
}

/** Sends any saved scores. Stops at the first sign the Roll is unreachable. Resolves true if one was accepted. */
export async function flushPending(): Promise<boolean> {
  const queue = browserQueue()
  let sent = false
  for (const submission of queue.list()) {
    const outcome = await postScore(submission)
    if (outcome.kind === 'offline') break
    queue.remove(submission.name)
    sent ||= outcome.kind === 'ok'
  }
  return sent
}
