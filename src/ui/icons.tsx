import type { ProximityBand } from '../game/geo'

/** Each band has its own shape, so closeness is never carried by colour alone. */
export function ProximityShape({ band, size = '1.5rem' }: { band: ProximityBand; size?: string }) {
  return (
    <svg className={`shape shape--${band}`} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      {band === 'found' && <path d="M12 2l2.9 6.6 7.1.7-5.3 4.8 1.5 7-6.2-3.6-6.2 3.6 1.5-7L2 9.3l7.1-.7z" />}
      {band === 'veryClose' && <path d="M12 2l9 10-9 10-9-10z" />}
      {band === 'close' && <path d="M12 3l10 18H2z" />}
      {band === 'far' && <rect x="4" y="4" width="16" height="16" rx="2" />}
      {band === 'veryFar' && <circle cx="12" cy="12" r="8" />}
    </svg>
  )
}

/** A compass arrow. Zero degrees points up the map (north). */
export function CompassArrow({ degrees, size = '2rem' }: { degrees: number; size?: string }) {
  return (
    <svg className="compass-arrow" viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <circle cx="16" cy="16" r="14" className="compass-arrow__ring" />
      <g transform={`rotate(${degrees} 16 16)`}>
        <path d="M16 4l6 14h-4v8h-4v-8h-4z" className="compass-arrow__needle" />
      </g>
    </svg>
  )
}

export function Pips({ count, max = 4 }: { count: number; max?: number }) {
  return (
    <span className="pips" aria-hidden="true">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < count ? 'pips__pip pips__pip--on' : 'pips__pip'} />
      ))}
    </span>
  )
}

export type FragmentId = 'bow' | 'collar' | 'shaft' | 'ward' | 'bit'

export const FRAGMENTS: { id: FragmentId; label: string }[] = [
  { id: 'bow', label: 'Bow' },
  { id: 'collar', label: 'Collar' },
  { id: 'shaft', label: 'Shaft' },
  { id: 'ward', label: 'Ward' },
  { id: 'bit', label: 'Bit' },
]

/** One piece of the key. */
export function FragmentGlyph({ id }: { id: FragmentId }) {
  return (
    <svg className="fragment-glyph" viewBox="0 0 100 100" aria-hidden="true">
      {id === 'bow' && (
        <>
          <circle cx="56" cy="50" r="30" fill="none" strokeWidth="14" />
          <circle cx="56" cy="50" r="8" stroke="none" />
          <rect x="86" y="43" width="14" height="14" stroke="none" />
        </>
      )}
      {id === 'collar' && (
        <>
          <rect x="22" y="18" width="16" height="64" rx="3" stroke="none" />
          <rect x="62" y="18" width="16" height="64" rx="3" stroke="none" />
          <rect x="38" y="42" width="24" height="16" stroke="none" />
        </>
      )}
      {id === 'ward' && <path d="M14 22h72v56H14zM40 40h20v20H40z" fillRule="evenodd" stroke="none" />}
      {id === 'shaft' && (
        <>
          <rect x="0" y="40" width="100" height="20" rx="3" stroke="none" />
          <rect x="38" y="28" width="12" height="44" rx="2" stroke="none" />
        </>
      )}
      {id === 'bit' && <path d="M0 40h40V20h14v18h30v14H54v18H40V52H0z" stroke="none" />}
    </svg>
  )
}

export function BookGlyph() {
  return (
    <svg className="book-glyph" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M6 10c6-3 12-3 18 1 6-4 12-4 18-1v28c-6-3-12-3-18 1-6-4-12-4-18-1z" fill="none" strokeWidth="3" />
      <path d="M24 11v28" fill="none" strokeWidth="3" />
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" width="1.25rem" height="1.25rem" aria-hidden="true">
      <path d="M4 12.5l5 5L20 6.5" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CrossIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" width="1.25rem" height="1.25rem" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" fill="none" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function GearIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" width="1.5rem" height="1.5rem" aria-hidden="true">
      <circle cx="12" cy="12" r="3.2" fill="none" strokeWidth="2" />
      <path
        d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
