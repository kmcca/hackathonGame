import type { ProximityBand } from '../game/geo'

/** Mark's lines after the intro. Kept short so the player can keep playing. */
export const mark = {
  identifyStart(name: string, replay: boolean): string {
    return replay
      ? `Another book has swallowed you, ${name}! Same trick, new tale. Which story is this?`
      : `Look about you, ${name}. Whose map is this? Name the story and the page will start to loosen.`
  },

  identifyWrong(attempt: number): string {
    const lines = [
      'Not that tale. Look again, or ask me for a clue.',
      'A fine guess, but the map says otherwise.',
      'Closer to the shelf, perhaps, but still not the right book.',
    ]
    return lines[(attempt - 1) % lines.length]
  },

  identifyFallback(name: string): string {
    return `Three misses, ${name}. Let me pull three books off the shelf. One of them is holding you.`
  },

  identifyLabelled: 'Here, I will lend you the labelled map. Read it and think.',

  identifySolved(story: string): string {
    return `Yes! ${story}. Now we know which book holds you.`
  },

  findStart(target: string): string {
    return `The way out lies at ${target}. Tap places on the map and I will tell you how far you are, and in which direction.`
  },

  findResult(band: ProximityBand, target: string): string {
    switch (band) {
      case 'found':
        return `There it is: ${target}! The way out opens.`
      case 'veryClose':
        return 'So close the ink is still wet.'
      case 'close':
        return 'Warm. Keep going.'
      case 'far':
        return 'A long road from there.'
      case 'veryFar':
        return 'The wrong end of the book entirely.'
    }
  },

  findPulse: 'My lantern flickers over one of these places. Follow the glow.',

  triviaStart: 'The key is forged from what you know. Answer true and each piece will form.',

  triviaWrong(hint: string): string {
    return `Not quite. ${hint}`
  },

  triviaRight: 'A fine fragment. Hold it fast.',

  triviaLast: 'The last fragment! The key is whole.',

  bindingStart(name: string): string {
    return `Five pieces, ${name}. Fit each into its place, then speak the spell and hold your nerve until the words are done.`
  },

  ending(name: string): string {
    return `The page turns, ${name}. The creatures are still loose, and Hackathon 28 is where they will be lured home. Until then, well read.`
  },
}

export const SPELL_LINES = [
  'Page and parchment, ink and thread,',
  'hear the name that {name} said.',
  'Key of story, bow and bit,',
  'turn the lock and open it.',
]
