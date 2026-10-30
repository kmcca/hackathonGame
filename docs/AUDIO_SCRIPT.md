# Audio script: Page Break: Breakout

Every line the game speaks, in play order. Each has a stable ID you can use as the audio file name (for example `INTRO-03.mp3`).

**Voices:** the _Narrator_ is a storybook voice (warm, unhurried, a little playful; the intro leans on alliteration). _Mark_ is a wizard who guides the player from the edge of the page: warm, a little wry, quick and short. The _spell_ is a four-line verse, spoken solemnly.

**Totals:** 79 lines (generated from the game source, so the wording matches exactly).

**Player name:** 13 lines contain `{name}`, which the game replaces with whatever the player types. A recording cannot say a name it has never heard, so each of those lines has a **Name-free** version directly beneath it. Record the name-free version. The narrator beats switch to "you" (the game currently says the player's name in the third person), and the spell's second line becomes "hear the words that now are said", which keeps the rhyme with "thread".

**Not included:** buttons, headings, question prompts and answer options, and score text. These are on-screen text, not spoken. Tell me if you want any of them voiced.

**Note:** "Not quite." lines (HINT-*) are the wrong-answer line in full: the words "Not quite." followed by that question's hint.

## 1. Intro (storybook narrator and Mark)

**INTRO-01** · Narrator · _scene: office_
> Ever since a glowing green beer soaked the storybooks in the Veracafe, the office had been overrun. Dragons dozed, fairies flitted, and a beanstalk bulged through the ceiling.

**INTRO-02** · Narrator · _scene: office_
> {name} had nothing to do with the beer. {name} had only a mug, a deadline and a plan to get some work done.
>
> **Name-free:** You had nothing to do with the beer. You had only a mug, a deadline and a plan to get some work done.

**INTRO-03** · Narrator · _scene: dragon_
> But the dragon had draped itself across the water cooler and was hoarding every drop. "Excuse me," said {name}. The dragon snorted a smoky snort and tightened its grip.
>
> **Name-free:** But the dragon had draped itself across the water cooler and was hoarding every drop. "Excuse me," you said. The dragon snorted a smoky snort and tightened its grip.

**INTRO-04** · Narrator · _scene: dragon_
> Nothing in the employee handbook covered this. {name} tiptoed past a troll, two fairies and a stapler mid-heist, and headed for the Veracafe tap instead.
>
> **Name-free:** Nothing in the employee handbook covered this. You tiptoed past a troll, two fairies and a stapler mid-heist, and headed for the Veracafe tap instead.

**INTRO-05** · Narrator · _scene: bookClosed_
> The Veracafe was empty, except for one book. It sat closed on a table, its cover alight with a ghastly green glow. "Is that the book that caused all this?" {name} whispered.
>
> **Name-free:** The Veracafe was empty, except for one book. It sat closed on a table, its cover alight with a ghastly green glow. "Is that the book that caused all this?" you whispered.

**INTRO-06** · Narrator · _scene: book_
> The pages fluttered. The fire flickered. And {name}, who should have walked away, leaned in for a closer look.
>
> **Name-free:** The pages fluttered. The fire flickered. And you, who should have walked away, leaned in for a closer look.

**INTRO-07** · Narrator · _scene: vortex_
> The grimoire gulped. A whirling green gale swept {name} up, sneakers and all, and sucked them straight into the page.
>
> **Name-free:** The grimoire gulped. A whirling green gale swept you up, sneakers and all, and sucked you straight into the page.

**INTRO-08** · Mark · _scene: fantasy_
> Well. That was not supposed to happen. Allow me to introduce myself: I am Mark, a wizard, and the keeper of this book.

**INTRO-09** · Mark · _scene: fantasy_
> This story lost all of its characters, {name}. The book tried to pull them back, and I suppose it grabbed you by mistake.
>
> **Name-free:** This story lost all of its characters. The book tried to pull them back, and I suppose it grabbed you by mistake.

**INTRO-10** · Mark · _scene: fantasy_
> I cannot reach in to fetch you, but I can speak from the edge of the page. And I know how books work: every story hides a key.

**INTRO-11** · Mark · _scene: fantasy_
> Find the key, forge it, and the book will let you go. Bring your wits, your creativity and whatever you know of the world you have landed in.

**INTRO-12** · Mark · _scene: fantasy_
> First things first: which story are you standing in? Here, I will hand you a map of this land. Study it closely.


## 2. Which story are you standing in? (Mark)

**STORY-01** · Mark · _first play_
> Look about you, {name}. Whose map is this? Name the story and the page will start to loosen.
>
> **Name-free:** Look about you. Whose map is this? Name the story and the page will start to loosen.

**STORY-02** · Mark · _replay_
> Another book has swallowed you, {name}! Same trick, new tale. Which story is this?
>
> **Name-free:** Another book has swallowed you! Same trick, new tale. Which story is this?

**STORY-03** · Mark · _wrong guess 1_
> Not that tale. Look again, or ask me for a clue.

**STORY-04** · Mark · _wrong guess 2_
> A fine guess, but the map says otherwise.

**STORY-05** · Mark · _third wrong guess_
> Three misses, {name}. Let me pull three books off the shelf. One of them is holding you.
>
> **Name-free:** Three misses. Let me pull three books off the shelf. One of them is holding you.

**STORY-06** · Mark · _labelled map offered_
> Here, I will lend you the labelled map. Read it and think.

**STORY-07** · Mark · _wrong pick from the shelf_
> Not that one. Look at the map again.

**STORY-08** · Mark · _correct: Westeros_
> Yes! A Song of Ice and Fire (Westeros). Now we know which book holds you.

**STORY-09** · Mark · _correct: Middle-earth_
> Yes! The Lord of the Rings (Middle-earth). Now we know which book holds you.

**STORY-010** · Mark · _correct: Oz_
> Yes! The Wizard of Oz (Oz). Now we know which book holds you.

**CLUE-WESTEROS-1** · Mark · _Westeros, clue 1_
> The seasons here last for years, and no almanac has ever predicted the next one correctly.

**CLUE-WESTEROS-2** · Mark · _Westeros, clue 2_
> Seven kingdoms, one iron seat, and a wall of ice that keeps old horrors at bay. Mind the direwolves.

**CLUE-WESTEROS-3** · Mark · _Westeros, clue 3_
> There is a Mother of Dragons, a Hand of the King, and a very long winter that is always coming.

**CLUE-MIDDLEEARTH-1** · Mark · _Middle-earth, clue 1_
> A small trinket of gold was lost here long ago, and it has caused no end of trouble for everyone who carries it.

**CLUE-MIDDLEEARTH-2** · Mark · _Middle-earth, clue 2_
> A wizard in grey, a dark tower topped with an eye, and a long walk to a mountain of fire.

**CLUE-MIDDLEEARTH-3** · Mark · _Middle-earth, clue 3_
> Frodo, Gandalf and Aragorn all walk these lands, where the One Ring was forged.

**CLUE-OZ-1** · Mark · _Oz, clue 1_
> Visitors here almost always arrive by accident, and spend the whole story trying to get home.

**CLUE-OZ-2** · Mark · _Oz, clue 2_
> A scarecrow, a tin woodman and a cowardly lion all walk a road paved in gold.

**CLUE-OZ-3** · Mark · _Oz, clue 3_
> Follow the yellow brick road to see the Wizard. There is no place like home.


## 3. Where does the way out lie? (Mark)

**WHERE-01** · Mark · _stage start · text only, not voiced (names the place)_
> The way out lies at {place}. Tap places on the map and I will tell you how far you are, and in which direction.

**WHERE-02** · Mark · _result: veryClose_
> So close the ink is still wet.

**WHERE-03** · Mark · _result: close_
> Warm. Keep going.

**WHERE-04** · Mark · _result: far_
> A long road from there.

**WHERE-05** · Mark · _result: veryFar_
> The wrong end of the book entirely.

**WHERE-06** · Mark · _after six wrong places_
> My lantern flickers over one of these places. Follow the glow.

**WHERE-07** · Mark · _found: Winterfell_
> There it is: Winterfell! The way out opens.

**WHERE-08** · Mark · _found: Mount Doom_
> There it is: Mount Doom! The way out opens.

**WHERE-09** · Mark · _found: Emerald City_
> There it is: Emerald City! The way out opens.


## 4. Forge the key: trivia (Mark)

**TRIVIA-01** · Mark · _first piece only_
> The key is forged from what you know. Answer true and each piece will form.

**TRIVIA-02 to TRIVIA-05** · Mark · _right answer, pieces 1 to 4 · text only, not voiced_
> 1. The first piece forms. Keep it close.
> 2. Another piece, bright as brass.
> 3. Three down, and the key grows heavy in your hand.
> 4. Four pieces. One more and the lock will listen.

**TRIVIA-03** · Mark · _right answer, piece 5_
> The last fragment! The key is whole.

**HINT-WESTEROS-01** · Mark · _wrong answer, Westeros, easy_
> Not quite. Think of the season that haunts the North.

**HINT-WESTEROS-02** · Mark · _wrong answer, Westeros, easy_
> Not quite. It howls in the Wolfswood.

**HINT-WESTEROS-03** · Mark · _wrong answer, Westeros, moderate_
> Not quite. Pale as snow, and just as silent.

**HINT-WESTEROS-04** · Mark · _wrong answer, Westeros, moderate_
> Not quite. Their sigil is a crowned stag.

**HINT-WESTEROS-05** · Mark · _wrong answer, Westeros, moderate_
> Not quite. It shares its name with what covers the Wall.

**HINT-WESTEROS-06** · Mark · _wrong answer, Westeros, hard_
> Not quite. It stands on the Iron Islands.

**HINT-WESTEROS-07** · Mark · _wrong answer, Westeros, hard_
> Not quite. He is the seventh face, and the one nobody wants to meet.

**HINT-WESTEROS-08** · Mark · _wrong answer, Westeros, hard_
> Not quite. Their words are "Our Blades Are Sharp".

**HINT-MIDDLEEARTH-01** · Mark · _wrong answer, Middle-earth, easy_
> Not quite. One to rule them all.

**HINT-MIDDLEEARTH-02** · Mark · _wrong answer, Middle-earth, easy_
> Not quite. A hobbit from the Shire, helped by his loyal gardener Sam.

**HINT-MIDDLEEARTH-03** · Mark · _wrong answer, Middle-earth, moderate_
> Not quite. The goblins called it Beater.

**HINT-MIDDLEEARTH-04** · Mark · _wrong answer, Middle-earth, moderate_
> Not quite. His tower is called Orthanc.

**HINT-MIDDLEEARTH-05** · Mark · _wrong answer, Middle-earth, moderate_
> Not quite. He is master of Rivendell.

**HINT-MIDDLEEARTH-06** · Mark · _wrong answer, Middle-earth, hard_
> Not quite. Isildur used it to cut the Ring from Sauron's hand.

**HINT-MIDDLEEARTH-07** · Mark · _wrong answer, Middle-earth, hard_
> Not quite. He lost one son to the Ring's pull and trusted the other too little.

**HINT-MIDDLEEARTH-08** · Mark · _wrong answer, Middle-earth, hard_
> Not quite. He was the master of Sauron, and his crown held the Silmarils.

**HINT-OZ-01** · Mark · _wrong answer, Oz, easy_
> Not quite. You follow it, follow it, follow it.

**HINT-OZ-02** · Mark · _wrong answer, Oz, easy_
> Not quite. A great grey wind came out of Kansas.

**HINT-OZ-03** · Mark · _wrong answer, Oz, moderate_
> Not quite. He roars, but only for show.

**HINT-OZ-04** · Mark · _wrong answer, Oz, moderate_
> Not quite. A bucket in the right hands.

**HINT-OZ-05** · Mark · _wrong answer, Oz, moderate_
> Not quite. Her palace lies in Quadling Country.

**HINT-OZ-06** · Mark · _wrong answer, Oz, hard_
> Not quite. The film changed them to suit its new colour film.

**HINT-OZ-07** · Mark · _wrong answer, Oz, hard_
> Not quite. He arrived by balloon from the Midwest, and the answer is in Nebraska.

**HINT-OZ-08** · Mark · _wrong answer, Oz, hard_
> Not quite. His name described his trade.


## 5. Bind the key (Mark)

**BIND-01** · Mark · _stage start_
> Five pieces, {name}. Fit each into its place, then speak the spell and hold your nerve until the words are done.
>
> **Name-free:** Five pieces. Fit each into its place, then speak the spell and hold your nerve until the words are done.

**BIND-02** · Mark · _all five pieces placed_
> The key is whole, and it is warm to the touch. Now speak the spell.

**BIND-03** · Mark · _after the spell_
> The book is closing. Hold on to your hat.

**BIND-04** · Mark · _instruction, hold mode_
> Press and hold the seal until the spell is spoken.

**BIND-05** · Mark · _released early_
> Too soon. Hold the seal for the whole spell.

**BIND-06** · Mark · _while holding_
> Keep holding…

**BIND-07** · Mark · _hold complete_
> The spell is spoken.

**SPELL-01** · The spell (spoken aloud, as the seal is held) · _reads as one verse, four lines_
> Page and parchment, ink and thread,

**SPELL-02** · The spell (spoken aloud, as the seal is held) · _reads as one verse, four lines_
> hear the name that {name} said.
>
> **Name-free:** hear the words that now are said.

**SPELL-03** · The spell (spoken aloud, as the seal is held) · _reads as one verse, four lines_
> Key of story, bow and bit,

**SPELL-04** · The spell (spoken aloud, as the seal is held) · _reads as one verse, four lines_
> turn the lock and open it.


## 6. Ending (Mark)

**END-01** · Mark · _back in the Veracafe_
> The page turns, {name}. The creatures are still loose, and Hackathon 28 is where they will be lured home. Until then, well read.
>
> **Name-free:** The page turns. The creatures are still loose, and Hackathon 28 is where they will be lured home. Until then, well read.
