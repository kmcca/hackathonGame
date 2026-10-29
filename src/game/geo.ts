export interface Point {
  x: number
  y: number
}

export type Compass = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'

export interface Bearing {
  compass: Compass
  /** Clockwise from north, snapped to a multiple of 45. */
  degrees: number
  /** Spoken form, for example "north-east". */
  label: string
}

export type ProximityBand = 'found' | 'veryClose' | 'close' | 'far' | 'veryFar'

export interface Proximity {
  band: ProximityBand
  label: string
}

const COMPASS: { compass: Compass; label: string }[] = [
  { compass: 'N', label: 'north' },
  { compass: 'NE', label: 'north-east' },
  { compass: 'E', label: 'east' },
  { compass: 'SE', label: 'south-east' },
  { compass: 'S', label: 'south' },
  { compass: 'SW', label: 'south-west' },
  { compass: 'W', label: 'west' },
  { compass: 'NW', label: 'north-west' },
]

/**
 * Distance between two map points in leagues.
 * Pins use fractions of width and height, so the vertical offset is rescaled by
 * the image aspect ratio (width / height) to keep distances isotropic.
 */
export function distanceInLeagues(a: Point, b: Point, aspect: number, leaguesAcross: number): number {
  const dx = b.x - a.x
  const dy = (b.y - a.y) / aspect
  return Math.round(Math.hypot(dx, dy) * leaguesAcross)
}

/** Eight-way compass bearing from one point to another. North is up the map. */
export function bearing(from: Point, to: Point, aspect: number): Bearing {
  const dx = (to.x - from.x) * aspect
  const dy = to.y - from.y
  const radians = Math.atan2(dx, -dy)
  const degrees = (radians * 180) / Math.PI
  const index = Math.round(((degrees % 360) + 360) % 360 / 45) % 8
  const entry = COMPASS[index]
  return { compass: entry.compass, degrees: index * 45, label: entry.label }
}

/** The four wrong-place bands, nearest first. The on-screen key reads from this too. */
export const PROXIMITY_SCALE: Proximity[] = [
  { band: 'veryClose', label: 'Very close' },
  { band: 'close', label: 'Close' },
  { band: 'far', label: 'Far' },
  { band: 'veryFar', label: 'Very far' },
]

/** Buckets a distance, as a share of the map width, into a named band. */
export function proximity(leagues: number, leaguesAcross: number): Proximity {
  if (leagues <= 0) return { band: 'found', label: 'You found it' }
  const share = leagues / leaguesAcross
  if (share < 0.08) return PROXIMITY_SCALE[0]
  if (share < 0.2) return PROXIMITY_SCALE[1]
  if (share < 0.38) return PROXIMITY_SCALE[2]
  return PROXIMITY_SCALE[3]
}
