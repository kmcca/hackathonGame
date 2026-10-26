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
  { story: 'The Chronicles of Narnia', name: 'Narnia', aliases: ['narnia'] },
  { story: "Alice's Adventures in Wonderland", name: 'Wonderland', aliases: ['alice in wonderland'] },
  { story: 'Peter Pan', name: 'Neverland', aliases: ['never land'] },
  { story: 'A Wizard of Earthsea', name: 'Earthsea', aliases: ['earthsea'] },
  { story: 'The Colour of Magic', name: 'Discworld', aliases: ['disc world', 'discworld'] },
  { story: 'Harry Potter', name: 'The Wizarding World', aliases: ['hogwarts', 'wizarding world'] },
  { story: "Le Morte d'Arthur", name: 'Camelot', aliases: ['king arthur'] },
  { story: 'The NeverEnding Story', name: 'Fantasia', aliases: ['fantasia', 'never ending story'] },
  { story: 'The Book of Three', name: 'Prydain', aliases: ['the chronicles of prydain', 'prydain'] },
  { story: "Gulliver's Travels", name: 'Lilliput', aliases: ['gullivers travels', 'lilliput'] },
  { story: 'Winnie-the-Pooh', name: 'The Hundred Acre Wood', aliases: ['hundred acre wood', 'winnie the pooh'] },
  { story: 'Bridge to Terabithia', name: 'Terabithia', aliases: ['terabithia'] },
]
