import { useEffect, useRef, useState } from 'react'
import { FRAGMENTS, FragmentGlyph, GearIcon } from './icons'
import { usePrefs } from './prefs'
import type { TextSize } from './prefs'

interface HudProps {
  /** Hide the score and key on the title screen. */
  bare?: boolean
  fragments: number
  fragmentsTotal: number
  score: number
  maxScore: number
}

const TEXT_SIZES: { id: TextSize; label: string }[] = [
  { id: 'normal', label: 'Normal' },
  { id: 'large', label: 'Large' },
  { id: 'larger', label: 'Larger' },
]

export function Hud({ bare, fragments, fragmentsTotal, score, maxScore }: HudProps) {
  return (
    <header className="hud">
      <p className="hud__mark">Page Break</p>
      {!bare && (
        <>
          <div className="hud__key" role="img" aria-label={`Key fragments: ${fragments} of ${fragmentsTotal}`}>
            {FRAGMENTS.slice(0, fragmentsTotal).map((fragment, index) => (
              <span
                key={fragment.id}
                className={index < fragments ? 'hud__fragment hud__fragment--earned' : 'hud__fragment'}
              >
                <FragmentGlyph id={fragment.id} />
              </span>
            ))}
          </div>
          <p className="hud__score">
            <span className="hud__score-label">Score</span> <strong>{score}</strong>
            <span className="hud__score-max"> of {maxScore}</span>
          </p>
        </>
      )}
      <Settings />
    </header>
  )
}

function Settings() {
  const { textSize, setTextSize, reduceMotion, setReduceMotion, voice, setVoice } = usePrefs()
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggle.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="settings">
      <button
        ref={toggle}
        type="button"
        className="button button--ghost"
        aria-expanded={open}
        aria-controls="settings-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <GearIcon />
        <span>Settings</span>
      </button>
      {open && (
        <div id="settings-panel" className="settings__panel" role="group" aria-label="Settings">
          <fieldset className="settings__group">
            <legend>Text size</legend>
            <div className="segmented">
              {TEXT_SIZES.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  className="segmented__option"
                  aria-pressed={textSize === size.id}
                  onClick={() => setTextSize(size.id)}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="settings__switch">
            <input type="checkbox" checked={reduceMotion} onChange={(event) => setReduceMotion(event.target.checked)} />
            <span>Reduce motion</span>
          </label>
          <label className="settings__switch">
            <input type="checkbox" checked={voice} onChange={(event) => setVoice(event.target.checked)} />
            <span>Play voices</span>
          </label>
          <button type="button" className="button button--primary" onClick={() => setOpen(false)}>
            Done
          </button>
        </div>
      )}
    </div>
  )
}
