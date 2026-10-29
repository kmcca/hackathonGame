import { describe, expect, it } from 'vitest'
import { bearing, distanceInLeagues, proximity } from './geo'

const ASPECT = 2

describe('bearing', () => {
  const origin = { x: 0.5, y: 0.5 }
  // Offsets are chosen so the bearing is unambiguous on a 2:1 map.
  const cases: [string, { x: number; y: number }, string, number][] = [
    ['north', { x: 0.5, y: 0.3 }, 'N', 0],
    ['north-east', { x: 0.6, y: 0.3 }, 'NE', 45],
    ['east', { x: 0.7, y: 0.5 }, 'E', 90],
    ['south-east', { x: 0.6, y: 0.7 }, 'SE', 135],
    ['south', { x: 0.5, y: 0.7 }, 'S', 180],
    ['south-west', { x: 0.4, y: 0.7 }, 'SW', 225],
    ['west', { x: 0.3, y: 0.5 }, 'W', 270],
    ['north-west', { x: 0.4, y: 0.3 }, 'NW', 315],
  ]

  it.each(cases)('points %s', (label, to, compass, degrees) => {
    const result = bearing(origin, to, ASPECT)
    expect(result.compass).toBe(compass)
    expect(result.degrees).toBe(degrees)
    expect(result.label).toBe(label)
  })

  it('accounts for the aspect ratio when judging diagonals', () => {
    // Equal fractional offsets on a wide map are not a true diagonal.
    const result = bearing(origin, { x: 0.65, y: 0.4 }, ASPECT)
    expect(result.compass).toBe('E')
  })
})

describe('distanceInLeagues', () => {
  it('is zero for the same point', () => {
    expect(distanceInLeagues({ x: 0.2, y: 0.2 }, { x: 0.2, y: 0.2 }, ASPECT, 900)).toBe(0)
  })

  it('scales a full-width trip to leaguesAcross', () => {
    expect(distanceInLeagues({ x: 0, y: 0.5 }, { x: 1, y: 0.5 }, ASPECT, 900)).toBe(900)
  })

  it('rescales vertical offsets by the aspect ratio', () => {
    // A full-height trip on a 2:1 map is half the map width.
    expect(distanceInLeagues({ x: 0.5, y: 0 }, { x: 0.5, y: 1 }, ASPECT, 900)).toBe(450)
  })

  it('is symmetric', () => {
    const a = { x: 0.1, y: 0.8 }
    const b = { x: 0.7, y: 0.2 }
    expect(distanceInLeagues(a, b, ASPECT, 800)).toBe(distanceInLeagues(b, a, ASPECT, 800))
  })
})

describe('proximity', () => {
  it('marks a zero distance as found', () => {
    expect(proximity(0, 900).band).toBe('found')
  })

  it('gets warmer as the distance shrinks and never relies on colour alone', () => {
    const bands = [700, 250, 120, 40].map((leagues) => proximity(leagues, 900))
    expect(bands.map((b) => b.band)).toEqual(['veryFar', 'far', 'close', 'veryClose'])
    bands.forEach((b) => expect(b.label.length).toBeGreaterThan(0))
  })
})
