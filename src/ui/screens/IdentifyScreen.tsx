import { useState } from 'react'
import { FALLBACK_AFTER, isWorldGuess } from '../../game/state'
import { KNOWN_STORIES, storyLabel } from '../../game/stories'
import type { Action, GameState } from '../../game/state'
import { suggest } from '../../game/match'
import { SCORING, scoreWorld, worldClueCost } from '../../game/scoring'
import { mark } from '../../story/mark'
import { getWorld, worlds } from '../../worlds'
import type { WorldId } from '../../worlds'
import { Autocomplete } from '../Autocomplete'
import { ClueLadder } from '../ClueLadder'
import { CrossIcon } from '../icons'
import { ActionBar, MarkStrip, ScreenHeading } from '../Layout'
import { StoryMap } from '../StoryMap'

interface Props {
  state: GameState
  dispatch: (action: Action) => void
}

export function IdentifyScreen({ state, dispatch }: Props) {
  const world = getWorld(state.worldId)
  const label = storyLabel(world)
  const { identify } = state
  const [text, setText] = useState('')
  const [line, setLine] = useState(() => mark.identifyStart(state.playerName, state.replay))

  const allClues = identify.cluesUsed >= world.worldClues.length
  const fallbackOpen = identify.wrongGuesses.length >= FALLBACK_AFTER && !identify.solved
  const earned = scoreWorld({
    wrongGuesses: identify.wrongGuesses.length,
    cluesUsed: identify.cluesUsed,
    labelledShown: identify.labelledShown,
    usedFallback: identify.usedFallback,
  })

  const guess = (value: string) => {
    if (!value.trim()) return
    dispatch({ type: 'GUESS_WORLD', text: value })
    setText('')
    const wrongSoFar = identify.wrongGuesses.length + 1
    if (isWorldGuess(value, state.worldId)) setLine(mark.identifySolved(label))
    else if (wrongSoFar === FALLBACK_AFTER) setLine(mark.identifyFallback(state.playerName))
    else setLine(mark.identifyWrong(wrongSoFar))
  }

  const pick = (id: WorldId) => {
    dispatch({ type: 'FALLBACK_GUESS', worldId: id })
    setLine(id === world.id ? mark.identifySolved(label) : 'Not that one. Look at the map again.')
  }

  return (
    <main className="screen">
      <ScreenHeading hint="The page has dropped you somewhere unfamiliar. Work out which story it is.">
        Which story are you standing in?
      </ScreenHeading>
      <div className="split">
        <div className="split__main">
          <StoryMap world={world} labelled={identify.labelledShown} revealKey={world.id} />
        </div>
        <div className="split__side">
          <MarkStrip>{line}</MarkStrip>

          {!identify.solved && (
            <>
              <Autocomplete
                label="Name the story"
                value={text}
                onChange={setText}
                suggestions={suggest(text, KNOWN_STORIES)}
                onSubmit={guess}
                submitLabel="Name it"
              />
              {identify.wrongGuesses.length > 0 && (
                <p className="wrong-guesses">
                  <CrossIcon /> Not these: {identify.wrongGuesses.join(', ')}
                </p>
              )}

              <ClueLadder
                title="Mark’s clues"
                clues={world.worldClues}
                used={identify.cluesUsed}
                nextCost={allClues ? null : worldClueCost(identify.cluesUsed)}
                onAsk={() => dispatch({ type: 'WORLD_CLUE' })}
                extra={
                  allClues && !identify.labelledShown ? (
                    <button
                      type="button"
                      className="button button--secondary"
                      onClick={() => {
                        dispatch({ type: 'SHOW_LABELLED' })
                        setLine(mark.identifyLabelled)
                      }}
                    >
                      Borrow the labelled map (−{SCORING.world.labelledMap} points)
                    </button>
                  ) : null
                }
              />

              {fallbackOpen && (
                <section className="shelf" aria-labelledby="shelf-title">
                  <h2 id="shelf-title">Mark’s shelf</h2>
                  <p className="form-note">
                    Pick the book you think holds you. This always works, but it caps the page at{' '}
                    {SCORING.world.fallbackCap} points.
                  </p>
                  <ul className="shelf__books">
                    {worlds.map((candidate) => {
                      const ruledOut = identify.fallbackRuledOut.includes(candidate.id)
                      return (
                        <li key={candidate.id}>
                          <button
                            type="button"
                            className="book"
                            disabled={ruledOut}
                            aria-disabled={ruledOut}
                            onClick={() => pick(candidate.id)}
                          >
                            {storyLabel(candidate)}
                            {ruledOut && (
                              <span className="option__status">
                                <CrossIcon /> Not this one
                              </span>
                            )}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              )}
            </>
          )}

          {identify.solved && (
            <section className="success" aria-live="polite">
              <h2>{label}</h2>
              <p>
                You named the story. This page scored <strong>{earned}</strong> of {SCORING.stageMax}.
              </p>
            </section>
          )}
        </div>
      </div>
      <ActionBar
        primary={
          <button
            type="button"
            className="button button--primary"
            disabled={!identify.solved}
            onClick={() => dispatch({ type: 'CONTINUE' })}
          >
            Find the way out
          </button>
        }
      />
    </main>
  )
}
