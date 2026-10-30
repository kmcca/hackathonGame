import { shuffle } from './state'

export const RUNES = [
  { id: 'moon', label: 'Moon' },
  { id: 'leaf', label: 'Leaf' },
  { id: 'flame', label: 'Flame' },
  { id: 'star', label: 'Star' },
  { id: 'wave', label: 'Wave' },
] as const

export type RuneId = (typeof RUNES)[number]['id']

export const RUNE_COUNT = RUNES.length

/** Runes in order of place, counted from the left. */
export type Arrangement = RuneId[]

/** Places are zero-based here and spoken as "first" to "fifth". */
export type Clue =
  | { kind: 'at'; rune: RuneId; place: number }
  | { kind: 'notAt'; rune: RuneId; place: number }
  | { kind: 'before'; rune: RuneId; other: RuneId }
  | { kind: 'beside'; rune: RuneId; other: RuneId }
  | { kind: 'apart'; rune: RuneId; other: RuneId }

export interface Lock {
  solution: Arrangement
  clues: Clue[]
  /** Where the runes start: never the solution, and never more than one rune already in place. */
  start: Arrangement
}

/** The most clues a lock may carry. A lock that needs more is thrown away and drawn again. */
const MAX_CLUES = 6
/** At most one clue may simply hand over a rune's place, or the lock stops being a puzzle. */
const MAX_GIVEAWAYS = 1
const ATTEMPTS = 200

const RUNE_IDS: RuneId[] = RUNES.map((rune) => rune.id)
const ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth']

export function runeLabel(id: RuneId): string {
  return RUNES.find((rune) => rune.id === id)!.label
}

export function holds(clue: Clue, arrangement: Arrangement): boolean {
  switch (clue.kind) {
    case 'at':
      return arrangement[clue.place] === clue.rune
    case 'notAt':
      return arrangement[clue.place] !== clue.rune
    case 'before':
      return arrangement.indexOf(clue.rune) < arrangement.indexOf(clue.other)
    case 'beside':
      return Math.abs(arrangement.indexOf(clue.rune) - arrangement.indexOf(clue.other)) === 1
    case 'apart':
      return Math.abs(arrangement.indexOf(clue.rune) - arrangement.indexOf(clue.other)) > 1
  }
}

export function describeClue(clue: Clue): string {
  switch (clue.kind) {
    case 'at':
      return `The ${runeLabel(clue.rune)} rune sits in the ${ORDINALS[clue.place]} place.`
    case 'notAt':
      return `The ${runeLabel(clue.rune)} rune does not sit in the ${ORDINALS[clue.place]} place.`
    case 'before':
      return `The ${runeLabel(clue.rune)} rune comes somewhere before the ${runeLabel(clue.other)} rune.`
    case 'beside':
      return `The ${runeLabel(clue.rune)} and ${runeLabel(clue.other)} runes sit side by side.`
    case 'apart':
      return `The ${runeLabel(clue.rune)} and ${runeLabel(clue.other)} runes are not side by side.`
  }
}

/** How many runes are in the place the lock wants. */
export function inPlace(arrangement: Arrangement, solution: Arrangement): number {
  return arrangement.filter((rune, place) => solution[place] === rune).length
}

function permutations(items: RuneId[]): Arrangement[] {
  if (items.length <= 1) return [items]
  return items.flatMap((item, index) =>
    permutations([...items.slice(0, index), ...items.slice(index + 1)]).map((rest) => [item, ...rest]),
  )
}

const ALL_ARRANGEMENTS = permutations(RUNE_IDS)

/** Every clue that is true of the solution. */
function trueClues(solution: Arrangement): Clue[] {
  const candidates: Clue[] = []
  for (const rune of RUNE_IDS) {
    for (let place = 0; place < RUNE_COUNT; place++) {
      candidates.push({ kind: 'at', rune, place }, { kind: 'notAt', rune, place })
    }
    for (const other of RUNE_IDS) {
      if (other === rune) continue
      candidates.push({ kind: 'before', rune, other })
      // Symmetric clues are listed once.
      if (RUNE_IDS.indexOf(rune) < RUNE_IDS.indexOf(other)) {
        candidates.push({ kind: 'beside', rune, other }, { kind: 'apart', rune, other })
      }
    }
  }
  return candidates.filter((clue) => holds(clue, solution))
}

function survivors(clues: Clue[]): Arrangement[] {
  return ALL_ARRANGEMENTS.filter((arrangement) => clues.every((clue) => holds(clue, arrangement)))
}

/** Whether these clues leave exactly one arrangement standing. */
export function isUnique(clues: Clue[]): boolean {
  return survivors(clues).length === 1
}

function drawClues(solution: Arrangement, rng: () => number): Clue[] {
  const chosen: Clue[] = []
  let remaining = ALL_ARRANGEMENTS
  let giveaways = 0
  for (const clue of shuffle(trueClues(solution), rng)) {
    if (remaining.length === 1) break
    if (clue.kind === 'at' && giveaways >= MAX_GIVEAWAYS) continue
    const next = remaining.filter((arrangement) => holds(clue, arrangement))
    // A clue that rules nothing out is noise.
    if (next.length === remaining.length) continue
    chosen.push(clue)
    remaining = next
    if (clue.kind === 'at') giveaways++
  }
  // Drop any clue the others have made unnecessary.
  for (const clue of [...chosen]) {
    const without = chosen.filter((other) => other !== clue)
    if (isUnique(without)) chosen.splice(chosen.indexOf(clue), 1)
  }
  return chosen
}

/** Draws a lock whose clues are all true and leave exactly one arrangement that satisfies them. */
export function createLock(rng: () => number): Lock {
  const solution = shuffle(RUNE_IDS, rng)
  let clues = drawClues(solution, rng)
  for (let attempt = 1; attempt < ATTEMPTS && clues.length > MAX_CLUES; attempt++) {
    clues = drawClues(solution, rng)
  }

  let start = shuffle(RUNE_IDS, rng)
  while (inPlace(start, solution) > 1) start = shuffle(RUNE_IDS, rng)
  return { solution, clues: shuffle(clues, rng), start }
}
