import { PROXIMITY_SCALE } from '../game/geo'
import { ProximityShape } from './icons'

/** Explains the map markers: what each shape means. */
export function ProximityKey() {
  return (
    <section className="marker-key" aria-labelledby="marker-key-title">
      <h2 id="marker-key-title">What the markers mean</h2>
      <p className="marker-key__note">After you tap a place, its marker shows how close it is to the way out.</p>
      <ul className="marker-key__list">
        {PROXIMITY_SCALE.map((entry) => (
          <li key={entry.band} className="marker-key__item">
            <span className="marker-key__mark">
              <ProximityShape band={entry.band} size="1.25rem" />
            </span>
            <span className="marker-key__label">{entry.label}</span>
          </li>
        ))}
        <li className="marker-key__item">
          <span className="marker-key__mark marker-key__mark--new">
            <span className="pin__dot" />
          </span>
          <span className="marker-key__label">Not tried yet</span>
        </li>
      </ul>
    </section>
  )
}
