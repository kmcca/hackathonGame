import { useEffect, useState } from 'react'
import { Portrait } from './Layout'
import { usePrefs } from './prefs'
import type { Speaker } from '../story/intro'

const MS_PER_CHARACTER = 16

interface DialogueBoxProps {
  speaker: Speaker
  text: string
  /** Called when the text is already complete and the player asks to move on. */
  onNext: () => void
  nextLabel: string
  /** Seconds of recorded speech for this line. The text types out to match it, never faster than normal. */
  voiceSeconds?: number | null
}

/**
 * Tap-to-complete dialogue. The first press finishes the line, the next moves on.
 * Screen readers get the whole line at once; the typing effect is visual only.
 */
export function DialogueBox({ speaker, text, onNext, nextLabel, voiceSeconds }: DialogueBoxProps) {
  const { reduceMotion } = usePrefs()
  const [shown, setShown] = useState(reduceMotion ? text.length : 0)

  useEffect(() => {
    if (reduceMotion) {
      setShown(text.length)
      return
    }
    setShown(0)
    const msPerCharacter = voiceSeconds ? Math.max(MS_PER_CHARACTER, (voiceSeconds * 900) / text.length) : MS_PER_CHARACTER
    const timer = window.setInterval(() => {
      setShown((count) => {
        if (count >= text.length) {
          window.clearInterval(timer)
          return count
        }
        return count + 1
      })
    }, msPerCharacter)
    return () => window.clearInterval(timer)
  }, [text, reduceMotion, voiceSeconds])

  const complete = shown >= text.length
  const press = () => (complete ? onNext() : setShown(text.length))

  return (
    <div className={`dialogue dialogue--${speaker}`}>
      <Portrait speaker={speaker} />
      <div className="dialogue__box">
        <span className="dialogue__speaker">{speaker === 'mark' ? 'Mark' : 'The storybook'}</span>
        <p className="visually-hidden" role="status">
          {text}
        </p>
        <p className="dialogue__text" aria-hidden="true" onClick={press}>
          {text.slice(0, shown)}
          <span className="dialogue__rest">{text.slice(shown)}</span>
        </p>
        <button type="button" className="button button--primary dialogue__next" onClick={press} autoFocus>
          {complete ? nextLabel : 'Show all'}
        </button>
      </div>
    </div>
  )
}
