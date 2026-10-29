import { useSpeak } from '../audio/useVoice'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { SPELL_LINES } from '../story/mark'
import { fillName } from '../story/intro'
import { CheckIcon, FRAGMENTS } from './icons'
import { KEY_HEIGHT, KEY_PIECES, KEY_TOGETHER } from './keyArt'
import type { FragmentId } from './icons'
import { usePrefs } from './prefs'

const HOLD_MS = 2400
const TAPS_NEEDED = 5
const SLAM_MS = 1500
const SLAM_REDUCED_MS = 500
/** Fragments are offered in a different order from the key, so placing them is a small puzzle. */
const OFFER_ORDER: FragmentId[] = ['ward', 'bow', 'bit', 'collar', 'shaft']

interface BindingSceneProps {
  playerName: string
  /** Called when the book has closed. */
  onFinish: () => void
  onMessage: (message: string) => void
}

type Step = 'assemble' | 'recite' | 'slam'

export function BindingScene({ playerName, onFinish, onMessage }: BindingSceneProps) {
  const { reduceMotion } = usePrefs()
  const speak = useSpeak()
  const [step, setStep] = useState<Step>('assemble')
  const [placed, setPlaced] = useState<FragmentId[]>([])
  const [selected, setSelected] = useState<FragmentId | null>(null)
  const [note, setNote] = useState('Choose a fragment, then choose where it belongs on the key.')

  const place = (slot: FragmentId) => {
    if (placed.includes(slot)) return
    if (!selected) {
      setNote('Choose a fragment first.')
      return
    }
    if (selected !== slot) {
      setNote(`The ${label(selected)} does not fit there. Try another place on the key.`)
      setSelected(null)
      return
    }
    const next = [...placed, slot]
    setPlaced(next)
    setSelected(null)
    if (next.length === FRAGMENTS.length) {
      setNote('The key is whole.')
      onMessage('The key is whole, and it is warm to the touch. Now speak the spell.')
      speak(['BIND-02', 'BIND-04'])
      setStep('recite')
    } else {
      setNote(`The ${label(slot)} clicks into place.`)
    }
  }

  const finishRecital = useCallback(() => {
    setStep('slam')
    onMessage('The book is closing. Hold on to your hat.')
    speak(['BIND-07', 'BIND-03'])
  }, [onMessage, speak])

  const finish = useRef(onFinish)
  useEffect(() => {
    finish.current = onFinish
  })

  useEffect(() => {
    if (step !== 'slam') return
    const timer = window.setTimeout(() => finish.current(), reduceMotion ? SLAM_REDUCED_MS : SLAM_MS)
    return () => window.clearTimeout(timer)
  }, [step, reduceMotion])

  return (
    <div className="binding">
      <section className="binding__key" aria-label="The key">
        <ul className="key" style={{ aspectRatio: `${KEY_TOGETHER.width} / ${KEY_HEIGHT}` }}>
          {FRAGMENTS.map((fragment) => {
            const isPlaced = placed.includes(fragment.id)
            return (
              <li key={fragment.id} className="key__cell" style={{ flexGrow: KEY_PIECES[fragment.id].width }}>
                <button
                  type="button"
                  className={isPlaced ? `key__slot key__slot--${fragment.id} key__slot--filled` : `key__slot key__slot--${fragment.id}`}
                  onClick={() => place(fragment.id)}
                  aria-disabled={isPlaced || step !== 'assemble'}
                  aria-label={isPlaced ? `${fragment.label} slot, filled` : `${fragment.label} slot, empty`}
                >
                  <img className="key__piece" src={KEY_PIECES[fragment.id].src} alt="" draggable={false} />
                </button>
              </li>
            )
          })}
          {step !== 'assemble' && (
            <li className="key__whole" aria-hidden="true">
              <img src={KEY_TOGETHER.src} alt="" draggable={false} />
            </li>
          )}
        </ul>
        {step !== 'assemble' && <p className="visually-hidden">{KEY_TOGETHER.alt}</p>}
      </section>

      {step === 'assemble' && (
        <section className="binding__tray" aria-labelledby="tray-title">
          <h2 id="tray-title">Fragments</h2>
          <ul className="tray">
            {OFFER_ORDER.map((id) => {
              const isPlaced = placed.includes(id)
              return (
                <li key={id}>
                  <button
                    type="button"
                    className="fragment"
                    aria-pressed={selected === id}
                    disabled={isPlaced}
                    onClick={() => {
                      setSelected(id)
                      setNote(`The ${label(id)} is in your hand. Where does it belong?`)
                    }}
                  >
                    <img className="fragment__piece" src={KEY_PIECES[id].src} alt="" draggable={false} />
                    <span>{label(id)}</span>
                    {isPlaced && <CheckIcon />}
                  </button>
                </li>
              )
            })}
          </ul>
          <p className="binding__note" role="status">
            {note}
          </p>
        </section>
      )}

      {step !== 'assemble' && <Recital name={playerName} onDone={finishRecital} done={step === 'slam'} />}

      {step === 'slam' && <BookSlam />}
    </div>
  )
}

function label(id: FragmentId): string {
  return FRAGMENTS.find((fragment) => fragment.id === id)?.label.toLowerCase() ?? id
}

interface RecitalProps {
  name: string
  onDone: () => void
  done: boolean
}

/** Hold-to-confirm: the spell is only spoken once the button has been held for the whole ritual. */
function Recital({ name, onDone, done }: RecitalProps) {
  const speak = useSpeak()
  const [progress, setProgress] = useState(0)
  const [tapMode, setTapMode] = useState(false)
  const [message, setMessage] = useState('Press and hold the seal until the spell is spoken.')
  const start = useRef<number | null>(null)
  const frame = useRef(0)

  const stop = useCallback(() => {
    if (start.current === null) return
    start.current = null
    cancelAnimationFrame(frame.current)
    setProgress(0)
    setMessage('Too soon. Hold the seal for the whole spell.')
    speak('BIND-05')
  }, [speak])

  const begin = useCallback(() => {
    if (done || tapMode || start.current !== null) return
    start.current = performance.now()
    setMessage('Keep holding…')
    speak('BIND-06')
    const tick = (now: number) => {
      if (start.current === null) return
      const next = Math.min(1, (now - start.current) / HOLD_MS)
      setProgress(next)
      if (next >= 1) {
        start.current = null
        onDone()
        return
      }
      frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
  }, [done, tapMode, onDone, speak])

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
      event.preventDefault()
      if (!tapMode) begin()
    }
  }
  const onKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      if (tapMode) tap()
      else stop()
    }
  }
  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    if (!tapMode) begin()
  }
  const onPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (tapMode) tap()
    else stop()
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const tap = () => {
    if (done) return
    const next = Math.min(1, progress + 1 / TAPS_NEEDED)
    setProgress(next)
    setMessage(next >= 1 ? 'The spell is spoken.' : `Tap again (${Math.ceil((1 - next) * TAPS_NEEDED)} to go).`)
    if (next >= 1) onDone()
  }

  const lit = Math.floor(progress * SPELL_LINES.length)

  return (
    <section className="recital" aria-labelledby="recital-title">
      <h2 id="recital-title">The spell</h2>
      <p className="recital__lines">
        {SPELL_LINES.map((line, index) => (
          <span key={index} className={index < lit ? 'recital__line recital__line--lit' : 'recital__line'}>
            {fillName(line, name)}
          </span>
        ))}
      </p>
      <button
        type="button"
        className="seal"
        style={{ ['--progress' as string]: progress }}
        disabled={done}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => !tapMode && stop()}
        onBlur={() => !tapMode && stop()}
        onContextMenu={(event) => event.preventDefault()}
        aria-describedby="recital-help"
      >
        <span className="seal__label">{tapMode ? 'Tap to speak' : 'Hold to speak'}</span>
      </button>
      <p id="recital-help" className="binding__note" role="status">
        {message}
      </p>
      {!done && (
        <button
          type="button"
          className="button button--ghost"
          onClick={() => {
            setTapMode((value) => !value)
            setProgress(0)
            setMessage(tapMode ? 'Press and hold the seal until the spell is spoken.' : `Tap the seal ${TAPS_NEEDED} times.`)
          }}
          aria-pressed={tapMode}
        >
          {tapMode ? 'Hold instead of tapping' : 'Cannot hold? Tap instead'}
        </button>
      )}
    </section>
  )
}

/** The book shuts around the player. Under reduced motion it is a plain fade. */
function BookSlam() {
  return (
    <div className="slam" aria-hidden="true">
      <div className="slam__cover slam__cover--left" />
      <div className="slam__cover slam__cover--right" />
      <div className="slam__flash" />
    </div>
  )
}
