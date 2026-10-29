import markFile from '../../voice_audio/mark_dialogue_audio_nonspecific.mp3'
import narrationFile from '../../voice_audio/narration_audio.mp3'

/**
 * A spoken line is a slice of a longer recording. Times are in seconds from the start of the file.
 * Ids match docs/AUDIO_SCRIPT.md. Adjust a start or end here if a line is clipped or runs into the next.
 */
export interface Clip {
  file: string
  start: number
  end: number
}

export const CLIPS: Record<string, Clip> = {
  'INTRO-01': { file: narrationFile, start: 0, end: 12.5 },
  'INTRO-02': { file: narrationFile, start: 13.75, end: 20.25 },
  'INTRO-03': { file: narrationFile, start: 20.85, end: 32.65 },
  'INTRO-04': { file: narrationFile, start: 33.2, end: 43.3 },
  'INTRO-05': { file: narrationFile, start: 43.95, end: 56.55 },
  'INTRO-06': { file: narrationFile, start: 57.2, end: 64.85 },
  'INTRO-07': { file: narrationFile, start: 65.4, end: 73.5 },

  // Mark's recording has no story-specific lines, so it works for any story.
  'INTRO-08': { file: markFile, start: 0, end: 8.2 },
  'INTRO-09': { file: markFile, start: 9.95, end: 16.45 },
  'INTRO-10': { file: markFile, start: 17.65, end: 25.7 },
  'INTRO-11': { file: markFile, start: 26.8, end: 34.95 },
  'INTRO-12': { file: markFile, start: 35.8, end: 42.95 },
  'STORY-01': { file: markFile, start: 43.75, end: 49.05 },
  'WHERE-01': { file: markFile, start: 49.9, end: 57.65 },
  'WHERE-02': { file: markFile, start: 58.45, end: 60.7 },
  'WHERE-03': { file: markFile, start: 61.45, end: 63.0 },
  'WHERE-04': { file: markFile, start: 63.85, end: 65.45 },
  'WHERE-05': { file: markFile, start: 66.2, end: 68.1 },
  'WHERE-06': { file: markFile, start: 68.95, end: 72.65 },
  'TRIVIA-01': { file: markFile, start: 73.5, end: 78.5 },
  'TRIVIA-03': { file: markFile, start: 82.55, end: 85.2 },
  'BIND-01': { file: markFile, start: 86.1, end: 92.75 },
  'BIND-02': { file: markFile, start: 93.55, end: 98.1 },
  'BIND-03': { file: markFile, start: 98.9, end: 101.35 },
  'BIND-04': { file: markFile, start: 102.1, end: 105.3 },
  'BIND-05': { file: markFile, start: 106.1, end: 109.2 },
  'BIND-06': { file: markFile, start: 110.0, end: 111.3 },
  'BIND-07': { file: markFile, start: 112.1, end: 113.6 },
  // SPELL-01 to SPELL-04 are not used yet: the recording stops after the second spell line.
  'END-01': { file: markFile, start: 125.95, end: 134.15 },
}

/** Seconds of speech in a clip, or null when the line has no recording yet. */
export function clipSeconds(id: string): number | null {
  const clip = CLIPS[id]
  return clip ? clip.end - clip.start : null
}

const elements = new Map<string, HTMLAudioElement>()
let current: HTMLAudioElement | null = null
let stopTimer: number | undefined
let token = 0

/** Quiet time between lines when several are queued. */
const QUEUE_GAP_MS = 350

function elementFor(file: string): HTMLAudioElement {
  let el = elements.get(file)
  if (!el) {
    el = new Audio(file)
    el.preload = 'auto'
    elements.set(file, el)
  }
  return el
}

export function stopVoice() {
  token++
  window.clearTimeout(stopTimer)
  current?.pause()
  current = null
}

/**
 * Plays one line, or several in order, replacing anything still playing.
 * Lines with no recording are skipped.
 */
export function playVoice(ids: string | string[]) {
  const queue = (Array.isArray(ids) ? ids : [ids]).filter((id) => CLIPS[id])
  stopVoice()
  if (queue.length === 0) return
  const mine = token

  const playAt = (index: number) => {
    if (mine !== token || index >= queue.length) return
    const clip = CLIPS[queue[index]]
    const el = elementFor(clip.file)
    const start = () => {
      if (mine !== token) return
      el.currentTime = clip.start
      current = el
      el.play().catch(() => {
        // The browser blocked playback until the player interacts. The text still reads on its own.
      })
      stopTimer = window.setTimeout(() => {
        if (mine !== token) return
        el.pause()
        if (index + 1 < queue.length) stopTimer = window.setTimeout(() => playAt(index + 1), QUEUE_GAP_MS)
      }, (clip.end - clip.start) * 1000)
    }
    if (el.readyState >= 1) start()
    else el.addEventListener('loadedmetadata', start, { once: true })
  }
  playAt(0)
}
