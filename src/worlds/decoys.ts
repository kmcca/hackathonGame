/**
 * Stories that are not playable worlds. They appear in the autocomplete so the
 * suggestions never give away the answer. Each is shown as "Story (World)".
 */
export interface Decoy {
  story: string
  /** The world the story is set in. */
  name: string
  aliases: string[]
}

export const decoys: Decoy[] = [
  { story: "Alice's Adventures in Wonderland", name: 'Wonderland', aliases: ['alice in wonderland'] },
  { story: 'Peter Pan', name: 'Neverland', aliases: ['never land'] },
  { story: 'A Wizard of Earthsea', name: 'Earthsea', aliases: ['earthsea'] },
  { story: 'The Colour of Magic', name: 'Discworld', aliases: ['disc world', 'discworld'] },
  { story: 'Harry Potter', name: 'The Wizarding World', aliases: ['hogwarts', 'wizarding world'] },
  { story: "Le Morte d'Arthur", name: 'Camelot', aliases: ['king arthur'] },
  { story: 'The NeverEnding Story', name: 'Fantasia', aliases: ['fantasia', 'never ending story'] },
  { story: 'The Book of Three', name: 'Prydain', aliases: ['the chronicles of prydain', 'prydain'] },
  { story: "Gulliver's Travels", name: 'Lilliput', aliases: ['gullivers travels', 'lilliput'] },
  { story: 'Bridge to Terabithia', name: 'Terabithia', aliases: ['terabithia'] },
  { story: 'The Wheel of Time', name: 'The Wheel of Time', aliases: ['wheel of time', 'randland'] },
  { story: 'Redwall', name: 'Mossflower', aliases: ['redwall', 'mossflower'] },
  { story: 'The Wind in the Willows', name: 'The Riverbank', aliases: ['wind in the willows', 'toad hall'] },
  { story: 'Watership Down', name: 'Watership Down', aliases: ['watership down'] },
  { story: 'Robinson Crusoe', name: "Crusoe's Island", aliases: ['robinson crusoe', 'crusoe'] },
  {
    story: 'Percy Jackson & the Olympians',
    name: 'Camp Half-Blood',
    aliases: ['percy jackson', 'camp half blood', 'camp half-blood'],
  },
  { story: 'The Maze Runner', name: 'The Glade', aliases: ['maze runner', 'the glade'] },
  { story: 'Dune', name: 'Arrakis', aliases: ['dune', 'arrakis'] },
  { story: 'The Princess Bride', name: 'Florin', aliases: ['princess bride', 'florin'] },
  { story: 'The Jungle Book', name: 'The Seonee Jungle', aliases: ['jungle book', 'seonee'] },
]
