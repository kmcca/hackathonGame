import { useCallback, useEffect } from 'react'
import { usePrefs } from '../ui/prefs'
import { playVoice, stopVoice } from './voice'

/**
 * Speaks a line (or several in order) when the key changes, and stops when it changes again
 * or the screen goes away. Pass null for lines with no recording.
 */
export function useVoice(ids: string | string[] | null, key: string) {
  const { voice } = usePrefs()
  useEffect(() => {
    if (voice && ids) playVoice(ids)
    return stopVoice
    // The key stands in for ids, which may be a new array each render.
  }, [voice, key]) // eslint-disable-line react-hooks/exhaustive-deps
}

/** For lines spoken in response to something the player does, such as pressing a button. */
export function useSpeak() {
  const { voice } = usePrefs()
  return useCallback(
    (ids: string | string[]) => {
      if (voice) playVoice(ids)
    },
    [voice],
  )
}
