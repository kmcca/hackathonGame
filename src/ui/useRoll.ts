import { useCallback, useEffect, useState } from 'react'
import { isNameAllowed } from '../game/leaderboard'
import type { RollEntry, RollResponse, RollSubmission } from '../game/leaderboard'
import { fetchBoard, flushPending, pendingScores, postScore } from '../game/rollClient'

export type RollView =
  | { phase: 'loading' }
  /** The Roll could not be reached. A submitted score is saved and sent later. */
  | { phase: 'offline'; saved: boolean }
  | { phase: 'ready'; board: RollEntry[]; response: RollResponse | null; notice?: 'name' | 'busy' }

/**
 * Loads the Roll. Pass the player's finished run to add it first; pass null to just read the board.
 * `retry` tries again after an offline result.
 */
export function useRoll(submission: RollSubmission | null): { view: RollView; retry: () => void } {
  const [view, setView] = useState<RollView>({ phase: 'loading' })
  const [attempt, setAttempt] = useState(0)

  const name = submission?.name
  const score = submission?.score
  const worldId = submission?.worldId

  useEffect(() => {
    let current = true
    const show = (next: RollView) => current && setView(next)
    setView({ phase: 'loading' })

    async function run() {
      if (name === undefined || score === undefined || worldId === undefined) {
        await flushPending()
        const board = await fetchBoard()
        show(board.kind === 'ok' ? { phase: 'ready', board: board.value, response: null } : { phase: 'offline', saved: false })
        return
      }

      const run: RollSubmission = { name, score, worldId }
      // The server enforces this too; checking here saves a round trip and keeps the message accurate.
      const outcome = isNameAllowed(name) ? await postScore(run) : ({ kind: 'refused', reason: 'name' } as const)

      if (outcome.kind === 'ok') {
        pendingScores.remove(name)
        show({ phase: 'ready', board: outcome.value.board, response: outcome.value })
        void flushPending()
      } else if (outcome.kind === 'refused') {
        const board = await fetchBoard()
        show({
          phase: 'ready',
          board: board.kind === 'ok' ? board.value : [],
          response: null,
          notice: outcome.reason === 'name' ? 'name' : 'busy',
        })
      } else {
        pendingScores.add(run)
        show({ phase: 'offline', saved: true })
      }
    }

    void run()
    return () => {
      current = false
    }
  }, [name, score, worldId, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  return { view, retry }
}
