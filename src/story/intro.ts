export type Speaker = 'narrator' | 'mark'

/** The picture shown behind a beat. Beats with no scene show text only. */
export type IntroScene = 'office' | 'dragon' | 'bookClosed' | 'book' | 'vortex' | 'fantasy' | 'fantasyKey'

export interface Beat {
  speaker: Speaker
  /** {name} is replaced with the player's name. */
  text: string
  scene?: IntroScene
}

/** The opening of the tale. The name screen comes first, then these beats in order. */
export const INTRO_BEATS: Beat[] = [
  {
    speaker: 'narrator',
    text: 'Ever since a glowing green beer soaked the storybooks in the Veracafe, the office had been overrun. Dragons dozed, fairies flitted, and a beanstalk bulged through the ceiling.',
    scene: 'office',
  },
  {
    speaker: 'narrator',
    text: '{name} had nothing to do with the beer. {name} had only a mug, a deadline and a plan to get some work done.',
    scene: 'office',
  },
  {
    speaker: 'narrator',
    text: 'But the dragon had draped itself across the water cooler and was hoarding every drop. "Excuse me," said {name}. The dragon snorted a smoky snort and tightened its grip.',
    scene: 'dragon',
  },
  {
    speaker: 'narrator',
    text: 'Nothing in the employee handbook covered this. {name} tiptoed past a troll, two fairies and a stapler mid-heist, and headed for the Veracafe tap instead.',
    scene: 'dragon',
  },
  {
    speaker: 'narrator',
    text: 'The Veracafe was empty, except for one book. It sat closed on a table, its cover alight with a ghastly green glow. "Is that the book that caused all this?" {name} whispered.',
    scene: 'bookClosed',
  },
  {
    speaker: 'narrator',
    text: 'The pages fluttered. The fire flickered. And {name}, who should have walked away, leaned in for a closer look.',
    scene: 'book',
  },
  {
    speaker: 'narrator',
    text: 'The grimoire gulped. A whirling green gale swept {name} up, sneakers and all, and sucked them straight into the page.',
    scene: 'vortex',
  },
  {
    speaker: 'mark',
    text: 'Well. That was not supposed to happen. Allow me to introduce myself: I am Mark, a wizard, and the keeper of this book.',
    scene: 'fantasy',
  },
  {
    speaker: 'mark',
    text: 'This story lost all of its characters, {name}. The book tried to pull them back, and I suppose it grabbed you by mistake.',
    scene: 'fantasy',
  },
  {
    speaker: 'mark',
    text: 'I cannot reach in to fetch you, but I can speak from the edge of the page. And I know how books work: every story hides a key.',
    scene: 'fantasyKey',
  },
  {
    speaker: 'mark',
    text: 'Find the key, forge it, and the book will let you go. Bring your wits, your creativity and whatever you know of the world you have landed in.',
    scene: 'fantasyKey',
  },
  {
    speaker: 'mark',
    text: 'First things first: which story are you standing in? Here, I will hand you a map of this land. Study it closely.',
    scene: 'fantasyKey',
  },
]

export function fillName(text: string, name: string): string {
  return text.replaceAll('{name}', name)
}
