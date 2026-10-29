import book from '../../assets/intro-book.jpg'
import bookClosed from '../../assets/intro-book-closed.jpg'
import dragon from '../../assets/intro-dragon.jpg'
import fantasy from '../../assets/intro-fantasy.jpg'
import fantasyKey from '../../assets/intro-fantasy-key.jpg'
import office from '../../assets/intro-office.jpg'
import vortex from '../../assets/intro-vortex.jpg'
import { useVoice } from '../../audio/useVoice'
import { clipSeconds } from '../../audio/voice'
import { INTRO_BEATS, fillName, type IntroScene } from '../../story/intro'
import { DialogueBox } from '../DialogueBox'
import { ActionBar } from '../Layout'
import { usePrefs } from '../prefs'

const SCENES: Record<IntroScene, { src: string; alt: string }> = {
  office: {
    src: office,
    alt: 'The office overrun by fairy-tale creatures: a dragon clamped to the water cooler, a troll raiding the filing cabinet, fairies stealing a stapler and a beanstalk through the ceiling',
  },
  dragon: {
    src: dragon,
    alt: 'You hold out an empty mug to a water cooler, but a green dragon is curled around the jug and glaring at you, with a sticky note reading "Please refill"',
  },
  bookClosed: {
    src: bookClosed,
    alt: 'A closed book titled Hackathon History glowing green on a table in the empty Veracafe, with a drinking glass beside it and loose pages drifting in the air',
  },
  book: {
    src: book,
    alt: 'Your hands on an open book titled Hackathon History, its pages burning with green light',
  },
  vortex: {
    src: vortex,
    alt: 'A person tumbling headfirst out of a green whirlwind above the glowing book on a Veracafe table',
  },
  fantasyKey: {
    src: fantasyKey,
    alt: 'The same valley, now with a huge glowing brass key hanging in the air above the road, its handle engraved with a small book',
  },
  fantasy: {
    src: fantasy,
    alt: 'A fairy-tale valley at dusk: a winding dirt road leads to a dark castle on a hill while two dragons circle in the cloudy sky',
  },
}

interface IntroScreenProps {
  step: number
  playerName: string
  onNext: () => void
  onSkip: () => void
}

export function IntroScreen({ step, playerName, onNext, onSkip }: IntroScreenProps) {
  const beat = INTRO_BEATS[step - 1]
  const last = step === INTRO_BEATS.length
  const scene = beat.scene ? SCENES[beat.scene] : null
  const { voice } = usePrefs()
  const voiceId = `INTRO-${String(step).padStart(2, '0')}`
  const voiceSeconds = voice ? clipSeconds(voiceId) : null

  useVoice(voiceId, voiceId)

  return (
    <main className="screen screen--intro">
      <h1 className="visually-hidden">The story so far</h1>
      <div className={scene ? 'scene' : 'scene scene--none'}>
        {scene && beat.scene && (
          <img
            key={beat.scene}
            className={`scene__art scene__art--${beat.scene}`}
            src={scene.src}
            alt={scene.alt}
            width="1344"
            height="756"
          />
        )}
      </div>
      <DialogueBox
        speaker={beat.speaker}
        text={fillName(beat.text, playerName)}
        onNext={onNext}
        nextLabel={last ? 'Look around' : 'Next'}
        voiceSeconds={voiceSeconds}
      />
      <ActionBar
        secondary={
          <button type="button" className="button button--ghost" onClick={onSkip}>
            Skip the story
          </button>
        }
      />
    </main>
  )
}
