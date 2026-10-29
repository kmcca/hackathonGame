import { useVoice } from '../../audio/useVoice'
import { SCORING, scoreTrivia } from '../../game/scoring'
import { wrongAnswers } from '../../game/state'
import type { Action, GameState } from '../../game/state'
import { mark } from '../../story/mark'
import { getWorld } from '../../worlds'
import { ActionBar, MarkStrip, ScreenHeading } from '../Layout'
import { TriviaCard } from '../TriviaCard'

interface Props {
  state: GameState
  dispatch: (action: Action) => void
}

export function TriviaScreen({ state, dispatch }: Props) {
  const world = getWorld(state.worldId)
  const { trivia } = state
  const index = trivia.current
  const question = world.trivia[trivia.order[index]]
  const ruledOut = trivia.ruledOut[index]
  const solved = trivia.solved[index]
  const isLast = index === trivia.order.length - 1
  const earned = scoreTrivia({ wrongAnswers: wrongAnswers(state) })

  const line = solved
    ? isLast
      ? mark.triviaLast
      : mark.triviaRight(index)
    : ruledOut.length > 0
      ? mark.triviaWrong(question.hint)
      : mark.triviaStart

  // Wrong answers get a story-specific hint, which is not recorded, so they stay silent.
  const voiceId = solved ? (isLast ? 'TRIVIA-03' : null) : ruledOut.length > 0 ? null : index === 0 ? 'TRIVIA-01' : null
  useVoice(voiceId, `${index}-${solved}-${ruledOut.length}`)

  return (
    <main className="screen">
      <ScreenHeading
        key={index}
        hint={`Each wrong answer costs ${SCORING.trivia.wrongAnswer} points, but you can always try again.`}
      >
        {`Forge the key: piece ${index + 1} of ${trivia.order.length}`}
      </ScreenHeading>
      <div className="split split--even">
        <div className="split__main">
          {/* Keyed so each question starts fresh and focus returns to its heading. */}
          <TriviaCard
            key={question.id}
            question={question}
            ruledOut={ruledOut}
            solved={solved}
            onAnswer={(option) => dispatch({ type: 'ANSWER', option })}
          />
        </div>
        <div className="split__side">
          <MarkStrip>{line}</MarkStrip>
          <p className="form-note">This page is worth {earned} of {SCORING.stageMax} points so far.</p>
        </div>
      </div>
      <ActionBar
        primary={
          <button
            type="button"
            className="button button--primary"
            disabled={!solved}
            onClick={() => dispatch({ type: 'CONTINUE' })}
          >
            {isLast ? 'Bind the key' : 'Next piece'}
          </button>
        }
      />
    </main>
  )
}
