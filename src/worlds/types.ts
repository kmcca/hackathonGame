export type WorldId = 'westeros' | 'middleEarth' | 'oz'

/** A tappable place. x and y are fractions (0-1) of the map image width and height. */
export interface Pin {
  id: string
  name: string
  x: number
  y: number
}

export type Difficulty = 'easy' | 'moderate' | 'hard'

export interface TriviaQuestion {
  id: string
  difficulty: Difficulty
  prompt: string
  options: string[]
  /** Index into options. */
  answer: number
  /** Shown after a wrong answer. */
  hint: string
}

export interface World {
  id: WorldId
  /** The book or franchise the world comes from, for example "The Lord of the Rings". */
  story: string
  /** The world itself, for example "Middle-earth". */
  name: string
  /** Extra names the player may type. Matched after normalising, with a small typo tolerance. */
  aliases: string[]
  maps: {
    unlabelled: string
    labelled: string
    /** Pixel size of the map images; only the ratio is used. */
    width: number
    height: number
  }
  /** How many in-world leagues the full width of the map spans. */
  leaguesAcross: number
  pins: Pin[]
  /** Id of the pin where the way out lies. */
  targetId: string
  /** Three clues about the world, vaguest first. The last is a near-giveaway. */
  worldClues: [string, string, string]
  /** Three clues about where the target sits on the map, vaguest first. */
  locationClues: [string, string, string]
  /**
   * More questions than are asked, so replays vary. Each game asks one easy,
   * two moderate and two hard questions, in that order.
   */
  trivia: TriviaQuestion[]
}
