import { useVoice } from '../../audio/useVoice'
import veracafe from '../../assets/veracafe.png'
import type { GameState, Scores } from '../../game/state'
import { mark } from '../../story/mark'
import { MarkStrip, ScreenHeading } from '../Layout'
import { ResultCard } from '../ResultCard'
import { Roll } from '../Roll'

interface Props {
  state: GameState
  scores: Scores
  onReplay: () => void
}

export function EndingScreen({ state, scores, onReplay }: Props) {
  useVoice('END-01', 'ending')
  return (
    <main className="screen screen--ending">
      <img
        className="ending-art"
        src={veracafe}
        alt="The Veracafe, where the table is quiet and the books are shut"
        width="745"
        height="372"
      />
      <ScreenHeading>Back in the Veracafe</ScreenHeading>
      <MarkStrip>{mark.ending(state.playerName)}</MarkStrip>
      <div className="ending-pages">
        <ResultCard state={state} scores={scores} onReplay={onReplay} />
        <Roll submission={{ name: state.playerName, score: scores.total, worldId: state.worldId }} />
      </div>
    </main>
  )
}
