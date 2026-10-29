import { useVoice } from '../../audio/useVoice'
import { useCallback, useState } from 'react'
import { mark } from '../../story/mark'
import { BindingScene } from '../BindingScene'
import { MarkStrip, ScreenHeading } from '../Layout'

interface Props {
  playerName: string
  onFinish: () => void
}

export function BindingScreen({ playerName, onFinish }: Props) {
  const [line, setLine] = useState(() => mark.bindingStart(playerName))
  useVoice('BIND-01', 'start')
  const onMessage = useCallback((message: string) => setLine(message), [])

  return (
    <main className="screen screen--binding">
      <ScreenHeading hint="Fit the five pieces together, then speak the spell.">Bind the key</ScreenHeading>
      <MarkStrip>{line}</MarkStrip>
      <BindingScene playerName={playerName} onFinish={onFinish} onMessage={onMessage} />
    </main>
  )
}
