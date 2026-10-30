import { useVoice } from '../../audio/useVoice'
import { useMemo } from 'react'
import { bearing, distanceInLeagues, proximity } from '../../game/geo'
import { SCORING, scoreLocation } from '../../game/scoring'
import { shouldPulseTarget, wrongPins } from '../../game/state'
import type { Action, GameState } from '../../game/state'
import { mark } from '../../story/mark'
import { getTarget, getWorld } from '../../worlds'
import type { Pin } from '../../worlds'
import { CompassArrow, ProximityShape } from '../icons'
import { ActionBar, MarkStrip, ScreenHeading } from '../Layout'
import { ProximityKey } from '../ProximityKey'
import { StoryMap } from '../StoryMap'

interface Props {
  state: GameState
  dispatch: (action: Action) => void
}

export function FindScreen({ state, dispatch }: Props) {
  const world = getWorld(state.worldId)
  const target = getTarget(world, state.exitId)
  const aspect = world.maps.width / world.maps.height
  const { find } = state

  const results = useMemo(
    () =>
      find.guessedPinIds.map((id) => {
        const pin = world.pins.find((p) => p.id === id) as Pin
        const leagues = pin.id === target.id ? 0 : Math.max(1, distanceInLeagues(pin, target, aspect, world.leaguesAcross))
        return {
          pin,
          leagues,
          proximity: proximity(leagues, world.leaguesAcross),
          bearing: bearing(pin, target, aspect),
        }
      }),
    [find.guessedPinIds, world, target, aspect],
  )

  const last = results[results.length - 1]
  const pulse = shouldPulseTarget(state)
  const earned = scoreLocation({ wrongPins: wrongPins(state) })

  const bandVoice = { veryClose: 'WHERE-02', close: 'WHERE-03', far: 'WHERE-04', veryFar: 'WHERE-05' } as const
  const voiceIds =
    last?.proximity.band === 'found'
      ? null
      : last
        ? [bandVoice[last.proximity.band], ...(pulse ? ['WHERE-06'] : [])]
        : null // The opening line names the place, which the recording cannot.
  useVoice(voiceIds, `${last?.pin.id ?? 'start'}-${pulse}`)

  const line = [last ? mark.findResult(last.proximity.band, target.name) : mark.findStart(target.name), pulse ? mark.findPulse : '']
    .filter(Boolean)
    .join(' ')

  return (
    <main className="screen">
      <ScreenHeading hint="Tap a place to see how close you are and which way to go.">
        Where does the way out lie?
      </ScreenHeading>
      <div className="split split--map-first">
        <div className="split__main">
          <StoryMap
            world={world}
            pins={{
              results: results.map((r) => ({ pin: r.pin, proximity: r.proximity })),
              onTap: (pin) => dispatch({ type: 'TAP_PIN', pinId: pin.id }),
              pulseId: pulse ? target.id : undefined,
              disabled: find.solved,
            }}
          />
          <ProximityKey />
        </div>
        <div className="split__side">
          <MarkStrip>{line}</MarkStrip>

          <section className="result-panel" aria-label="Latest guess" aria-live="polite">
            {last ? (
              <div className={`last-guess last-guess--${last.proximity.band}`}>
                <ProximityShape band={last.proximity.band} size="2rem" />
                <div>
                  <h2 className="last-guess__name">{last.pin.name}</h2>
                  {last.proximity.band === 'found' ? (
                    <p>You found it.</p>
                  ) : (
                    <p>
                      <strong>{last.proximity.label}.</strong> Head {last.bearing.label}.
                    </p>
                  )}
                </div>
                {last.proximity.band !== 'found' && <CompassArrow degrees={last.bearing.degrees} size="2.75rem" />}
              </div>
            ) : (
              <p className="form-note">No places tried yet. Each wrong place costs {SCORING.location.wrongPin} points.</p>
            )}
          </section>

          {results.length > 1 && (
            <section aria-labelledby="tried-title">
              <h2 id="tried-title">Places tried</h2>
              <ul className="tried">
                {[...results].reverse().map((r) => (
                  <li key={r.pin.id}>
                    <ProximityShape band={r.proximity.band} size="1.25rem" />
                    <span className="tried__name">{r.pin.name}</span>
                    <span className="tried__detail">
                      {r.proximity.band === 'found' ? 'Found' : `${r.proximity.label}. Head ${r.bearing.label}.`}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {find.solved && (
            <section className="success" aria-live="polite">
              <h2>{target.name}</h2>
              <p>
                You found the way out. This page scored <strong>{earned}</strong> of {SCORING.stageMax}.
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
            disabled={!find.solved}
            onClick={() => dispatch({ type: 'CONTINUE' })}
          >
            Forge the key
          </button>
        }
      />
    </main>
  )
}
