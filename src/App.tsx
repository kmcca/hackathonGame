import { useCallback, useReducer } from 'react'
import { PinTool } from './dev/PinTool'
import { MAX_SCORE } from './game/scoring'
import {
  QUESTIONS_ASKED,
  computeScores,
  createGame,
  fragmentsEarned,
  pickQuestionOrder,
  pickWorldId,
  reducer,
} from './game/state'
import type { GameState } from './game/state'
import { getWorld } from './worlds'
import { Hud } from './ui/Hud'
import { BindingScreen } from './ui/screens/BindingScreen'
import { EndingScreen } from './ui/screens/EndingScreen'
import { FindScreen } from './ui/screens/FindScreen'
import { IdentifyScreen } from './ui/screens/IdentifyScreen'
import { IntroBackdrop } from './ui/IntroBackdrop'
import { IntroScreen } from './ui/screens/IntroScreen'
import { TitleScreen } from './ui/screens/TitleScreen'
import { TriviaScreen } from './ui/screens/TriviaScreen'

function newGame(): GameState {
  const worldId = pickWorldId(Math.random)
  return createGame(worldId, pickQuestionOrder(getWorld(worldId), Math.random))
}

const isPinTool = () => window.location.pathname.endsWith('/pin-tool') || window.location.hash === '#pin-tool'

export default function App() {
  if (isPinTool()) return <PinTool />
  return <Game />
}

/** Stages already started count towards the score; later stages are not shown as full marks. */
function visibleScore(state: GameState): number {
  const scores = computeScores(state)
  switch (state.phase) {
    case 'intro':
    case 'identifyWorld':
      return scores.world
    case 'findLocation':
      return scores.world + scores.location
    default:
      return scores.total
  }
}

function Game() {
  const [state, dispatch] = useReducer(reducer, undefined, newGame)

  const replay = useCallback(() => {
    const worldId = pickWorldId(Math.random, state.worldId)
    dispatch({ type: 'REPLAY', worldId, order: pickQuestionOrder(getWorld(worldId), Math.random) })
  }, [state.worldId])

  const finishBinding = useCallback(() => dispatch({ type: 'FINISH_BINDING' }), [])

  const inTitle = state.phase === 'intro' && state.introStep === 0
  const scores = computeScores(state)

  return (
    <div className="app">
      {state.phase === 'intro' && <IntroBackdrop />}
      <Hud
        bare={state.phase === 'intro'}
        fragments={fragmentsEarned(state)}
        fragmentsTotal={QUESTIONS_ASKED}
        score={visibleScore(state)}
        maxScore={MAX_SCORE}
      />
      {state.phase === 'intro' &&
        (inTitle ? (
          <TitleScreen
            name={state.playerName}
            onNameChange={(name) => dispatch({ type: 'SET_NAME', name })}
            onStart={() => dispatch({ type: 'START_STORY' })}
          />
        ) : (
          <IntroScreen
            step={state.introStep}
            playerName={state.playerName}
            onNext={() => dispatch({ type: 'ADVANCE_INTRO' })}
            onSkip={() => dispatch({ type: 'SKIP_INTRO' })}
          />
        ))}
      {state.phase === 'identifyWorld' && <IdentifyScreen key={state.worldId} state={state} dispatch={dispatch} />}
      {state.phase === 'findLocation' && <FindScreen state={state} dispatch={dispatch} />}
      {state.phase === 'trivia' && <TriviaScreen state={state} dispatch={dispatch} />}
      {state.phase === 'binding' && <BindingScreen playerName={state.playerName} onFinish={finishBinding} />}
      {state.phase === 'ending' && <EndingScreen state={state} scores={scores} onReplay={replay} />}
    </div>
  )
}
