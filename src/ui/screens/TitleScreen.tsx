import { useState } from 'react'
import titleArt from '../../../reference_images/pack-break-theme.jpg'
import { ScreenHeading } from '../Layout'
import { RollDialog } from '../Roll'

interface TitleScreenProps {
  name: string
  onNameChange: (name: string) => void
  onStart: () => void
}

export function TitleScreen({ name, onNameChange, onStart }: TitleScreenProps) {
  const [rollOpen, setRollOpen] = useState(false)
  return (
    <main className="screen screen--title">
      <img
        className="title-art"
        src={titleArt}
        alt="An open book titled Hackathon 28: Page Break, with a green-glowing wizard rising from its pages"
        width="750"
        height="508"
      />
      <ScreenHeading hint="Name the tale that swallowed you, find where the way out lies, and forge the key to set yourself free.">
        Page Break: Breakout
      </ScreenHeading>
      <form
        className="name-form"
        onSubmit={(event) => {
          event.preventDefault()
          if (name.trim()) onStart()
        }}
      >
        <label htmlFor="player-name" className="guess-form__label">
          Your name, Veracoder
        </label>
        <div className="guess-form__row">
          <input
            id="player-name"
            className="input"
            type="text"
            autoComplete="given-name"
            maxLength={24}
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
          />
          <button type="submit" className="button button--primary" disabled={!name.trim()}>
            Open the book
          </button>
        </div>
        <p className="form-note">
          Your name writes you into the story. If your score reaches the top ten, it is also shown on the Roll of
          Escapees, which every player can see.
        </p>
      </form>
      <div className="title-roll">
        <button type="button" className="button button--ghost" onClick={() => setRollOpen(true)}>
          See the Roll of Escapees
        </button>
      </div>
      <RollDialog open={rollOpen} onClose={() => setRollOpen(false)} />
    </main>
  )
}
