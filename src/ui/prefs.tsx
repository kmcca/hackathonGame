import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type TextSize = 'normal' | 'large' | 'larger'

interface Prefs {
  textSize: TextSize
  setTextSize: (size: TextSize) => void
  /** True when the player or their system asked for less motion. */
  reduceMotion: boolean
  setReduceMotion: (reduce: boolean) => void
  /** True when recorded voices should play. */
  voice: boolean
  setVoice: (on: boolean) => void
}

const STORAGE_KEY = 'pagebreak.prefs'

interface Stored {
  textSize?: TextSize
  reduceMotion?: boolean
  voice?: boolean
}

function readStored(): Stored {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Stored
  } catch {
    return {}
  }
}

function systemPrefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const PrefsContext = createContext<Prefs | null>(null)

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [textSize, setTextSize] = useState<TextSize>(() => readStored().textSize ?? 'normal')
  const [reduceMotion, setReduceMotion] = useState<boolean>(
    () => readStored().reduceMotion ?? systemPrefersReducedMotion(),
  )

  const [voice, setVoice] = useState<boolean>(() => readStored().voice ?? true)

  useEffect(() => {
    const root = document.documentElement
    root.dataset.textSize = textSize
    root.dataset.motion = reduceMotion ? 'reduce' : 'full'
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ textSize, reduceMotion, voice }))
    } catch {
      // Preferences just won't persist.
    }
  }, [textSize, reduceMotion, voice])

  const value = useMemo(
    () => ({ textSize, setTextSize, reduceMotion, setReduceMotion, voice, setVoice }),
    [textSize, reduceMotion, voice],
  )
  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
}

export function usePrefs(): Prefs {
  const prefs = useContext(PrefsContext)
  if (!prefs) throw new Error('usePrefs must be used inside PrefsProvider')
  return prefs
}
