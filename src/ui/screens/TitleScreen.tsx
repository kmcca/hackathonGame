import titleArt from '../../../reference_images/pack-break-theme.png'
import { ScreenHeading } from '../Layout'

interface TitleScreenProps {
  name: string
  onNameChange: (name: string) => void
  onStart: () => void
}

export function TitleScreen({ name, onNameChange, onStart }: TitleScreenProps) {
  return (
    <main className="screen screen--title">
      <img
        className="title-art"
        src={titleArt}
        alt="An open book titled Hackathon 28: Page Break, with a green-glowing wizard rising from its pages"
        width="750"
        height="508"
      />
      <ScreenHeading hint="Name the story you have landed in, find the place where the way out lies, and forge the key.">
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
        <p className="form-note">Your name stays in this browser. It is only used to write you into the story.</p>
      </form>
    </main>
  )
}
