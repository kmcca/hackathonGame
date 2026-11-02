import { useEffect, useId, useRef } from 'react'
import { ROLL_SIZE, describePlacement } from '../game/leaderboard'
import type { RollEntry, RollSubmission } from '../game/leaderboard'
import { rankTitle } from '../game/scoring'
import { getWorld } from '../worlds'
import { ActionBar } from './Layout'
import { useRoll } from './useRoll'
import type { RollView } from './useRoll'

interface RollProps {
  /** The player's finished run, to add to the board. Leave out to just read it. */
  submission?: RollSubmission
}

/** The Roll of Escapees: the ten best escapes from every book. */
export function Roll({ submission }: RollProps) {
  const headingId = useId()
  const { view, retry } = useRoll(submission ?? null)

  return (
    <section className="page roll" aria-labelledby={headingId}>
      <h2 id={headingId} className="roll__title">
        Roll of Escapees
      </h2>
      <RollStatus view={view} score={submission?.score} onRetry={retry} />
      {view.phase === 'ready' && <RollTable board={view.board} mine={view.response?.place ?? null} />}
    </section>
  )
}

function RollStatus({ view, score, onRetry }: { view: RollView; score?: number; onRetry: () => void }) {
  let message: string | null = null
  if (view.phase === 'loading') message = 'Reading the Roll…'
  else if (view.phase === 'offline') {
    message = view.saved
      ? 'The Roll could not be reached. Your score is saved in this browser and will be added when it can.'
      : 'The Roll could not be reached.'
  } else if (view.response && score !== undefined) message = describePlacement(view.response, score)
  else if (view.notice === 'name') message = 'That name cannot be shown on the Roll, so this run is not listed.'
  else if (view.notice === 'busy') message = 'The Roll is busy. This run was not listed. Try again in a minute.'
  else if (view.board.length === 0) message = 'No one has escaped yet. Finish a tale to be the first.'

  return (
    <>
      {/* Announced when it changes. The retry button sits outside it so it is not read twice. */}
      {message && (
        <p className="roll__status" role="status">
          {message}
        </p>
      )}
      {view.phase === 'offline' && (
        <ActionBar
          primary={
            <button type="button" className="button button--primary" onClick={onRetry}>
              Try again
            </button>
          }
        />
      )}
    </>
  )
}

function RollTable({ board, mine }: { board: RollEntry[]; mine: number | null }) {
  if (board.length === 0) return null
  return (
    <table className="roll__table">
      <caption className="visually-hidden">The {ROLL_SIZE} best escapes from any book, best first</caption>
      <thead>
        <tr>
          <th scope="col">Place</th>
          <th scope="col">Escapee</th>
          <th scope="col">Score</th>
        </tr>
      </thead>
      <tbody>
        {board.map((entry, index) => (
          <RollRow key={`${entry.name}-${entry.at}`} entry={entry} place={index + 1} isMine={mine === index + 1} />
        ))}
      </tbody>
    </table>
  )
}

function RollRow({ entry, place, isMine }: { entry: RollEntry; place: number; isMine: boolean }) {
  const ref = useRef<HTMLTableRowElement>(null)
  // Bring the player's own line into view when the board is long enough to scroll.
  useEffect(() => {
    if (isMine) ref.current?.scrollIntoView({ block: 'nearest' })
  }, [isMine])

  return (
    <tr ref={ref} className={isMine ? 'roll__row roll__row--mine' : 'roll__row'} aria-current={isMine ? 'true' : undefined}>
      <th scope="row" className="roll__place">
        {place}
      </th>
      <td className="roll__who">
        <span className="roll__name">{entry.name}</span>
        {isMine && <span className="roll__you">You</span>}
        <span className="roll__meta">
          {rankTitle(entry.score)} in {getWorld(entry.worldId).name}
        </span>
      </td>
      <td className="roll__score">{entry.score}</td>
    </tr>
  )
}

/** The board in a native modal dialog, which traps focus, closes on Escape and returns focus to the opener. */
export function RollDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="roll-dialog"
      aria-label="Roll of Escapees"
      onClose={onClose}
      onClick={(event) => {
        // A click on the dimmed backdrop lands on the dialog itself, not on the page inside it.
        if (event.target === event.currentTarget) onClose()
      }}
    >
      {open && (
        <div className="roll-dialog__body">
          <Roll />
          <ActionBar
            secondary={
              <button type="button" className="button button--ghost" onClick={onClose}>
                Back
              </button>
            }
          />
        </div>
      )}
    </dialog>
  )
}
