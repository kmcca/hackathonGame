import { useEffect, useRef, useState } from 'react'
import { RUNE_COUNT, createLock, describeClue, inPlace, runeLabel } from '../game/lock'
import type { RuneId } from '../game/lock'
import { RuneGlyph } from './icons'
import { usePrefs } from './prefs'

/** How long the lit runes are shown before the lock hands over to the spell. */
const OPEN_MS = 800
const OPEN_REDUCED_MS = 400

interface LockPuzzleProps {
  /** Called when the runes are set right and the lock listens. */
  onOpen: () => void
}

/**
 * Five runes must be set in the order the clues allow. Choosing one rune and then another swaps them;
 * the lock only says how many are in place, never which, and a wrong try costs nothing.
 * A right answer lights the runes for a moment before the lock calls `onOpen`.
 */
export function LockPuzzle({ onOpen }: LockPuzzleProps) {
  const { reduceMotion } = usePrefs()
  const [lock] = useState(() => createLock(Math.random))
  const [order, setOrder] = useState<RuneId[]>(lock.start)
  const [selected, setSelected] = useState<number | null>(null)
  const [note, setNote] = useState('Choose a rune, then choose another to swap them. Try the lock when you think the order is right.')
  const [opened, setOpened] = useState(false)

  const open = useRef(onOpen)
  useEffect(() => {
    open.current = onOpen
  })

  useEffect(() => {
    if (!opened) return
    const timer = window.setTimeout(() => open.current(), reduceMotion ? OPEN_REDUCED_MS : OPEN_MS)
    return () => window.clearTimeout(timer)
  }, [opened, reduceMotion])

  const choose = (place: number) => {
    if (opened) return
    if (selected === null) {
      setSelected(place)
      setNote(`The ${runeLabel(order[place])} rune is in your hand. Choose another rune to swap with it.`)
      return
    }
    if (selected === place) {
      setSelected(null)
      setNote('Choose a rune, then choose another to swap them.')
      return
    }
    const next = [...order]
    ;[next[selected], next[place]] = [next[place], next[selected]]
    setOrder(next)
    setSelected(null)
    setNote(`Swapped the ${runeLabel(order[selected])} and ${runeLabel(order[place])} runes.`)
  }

  const tryLock = () => {
    if (opened) return
    const right = inPlace(order, lock.solution)
    if (right === RUNE_COUNT) {
      setOpened(true)
      setNote('The runes blaze and the lock listens.')
      return
    }
    setNote(
      right === 0
        ? 'The lock stays shut. None of the runes are in the right place.'
        : `The lock stays shut. ${right} of ${RUNE_COUNT} runes are in the right place.`,
    )
  }

  return (
    <section className="lock" aria-labelledby="lock-title">
      <h2 id="lock-title">The lock</h2>
      <p className="form-note">Every clue is true. Places are counted from the left.</p>
      <ol className="lock__clues">
        {lock.clues.map((clue, index) => (
          <li key={index}>{describeClue(clue)}</li>
        ))}
      </ol>
      <ul className={opened ? 'lock__runes lock__runes--open' : 'lock__runes'}>
        {order.map((rune, place) => (
          // Keyed by place, so each number stays with its socket while the runes move.
          <li key={place}>
            <span className="rune__place" aria-hidden="true">
              {place + 1}
            </span>
            <button
              type="button"
              className="fragment rune"
              aria-pressed={selected === place}
              aria-disabled={opened}
              aria-label={`Place ${place + 1} of ${RUNE_COUNT}: ${runeLabel(rune)} rune`}
              onClick={() => choose(place)}
            >
              <RuneGlyph id={rune} />
              <span>{runeLabel(rune)}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="binding__note" role="status">
        {note}
      </p>
      <button type="button" className="button button--primary" onClick={tryLock} disabled={opened}>
        Try the lock
      </button>
    </section>
  )
}
