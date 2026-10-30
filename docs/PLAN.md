# Fairytale Map Trivia Game: Plan

## Context
A free, static, browser-based game for Hackathon 28, themed around "Page Break." It's a Worldle/Globle-style trivia and puzzle game wrapped in a fairytale story. A magical accident releases fairytale creatures from their books, and the player is pulled into a book in a creature's place. The wizard Mark, who can reach the player from outside the page, guides them to find the key that lets them escape. The player identifies the world they've landed in from an unlabeled map, finds the named location where the way out lies using distance and direction feedback, then answers trivia about that location to assemble the key and get home. A play-through should take 4-6 minutes. Deploy as a static site on Vercel or Netlify with no backend.

## Decisions (confirmed with user)
- **Stage 2 input:** tap unlabeled pins on the map. A tap reveals the place name, a compass arrow and a proximity label. Distances are never shown as numbers.
- **Worlds:** Westeros, Middle-earth, and Oz for v1.
- **Maps:** use the supplied map images in `map_images/`. Start the Identify the world stage with the matching unlabeled map; reserve its labeled counterpart for the final hint. Keep each world's map asset and pin positions together in its data module so assets can be replaced later.
- **Finale:** "The Binding" (see the Finale section below).

## Architecture
- Vite + React + TypeScript, built as a static site (`dist/`). No backend and no accounts. State lives in a small reducer-driven state machine: `intro -> identifyWorld -> findLocation -> trivia -> binding -> ending`.
- Everything content-related lives in data files, so the fairytale theme can be applied later without touching logic:
  - `src/worlds/<world>.ts` holds id, aliases (for answer matching), unlabeled and labeled map assets, pins (id, name, x/y in 0-1 map space), the target location, 3 world clues, 3 location clues, and a pool of 8 multiple-choice trivia questions tagged easy, moderate or hard (with a hint line each). The story title is stored alongside the world name, so answers read as "The Lord of the Rings (Middle-earth)".
  - `src/story/*.ts` holds narration and dialogue beats, each with a speaker, portrait key and text.
- Pure-function modules with unit tests (Vitest):
  - `scoring.ts`: 100 points per stage, with fixed, visible costs. Points never drop below a floor, so the player can always finish.
  - `geo.ts`: Euclidean distance on the map (converted to leagues internally to pick a band), 8-way compass bearing, and a proximity band (a text label, an arrow and a color, never color alone).
  - `match.ts`: normalize input (case, punctuation, "the"), check aliases and apply a small Levenshtein tolerance. Autocomplete runs over all worlds, including decoys.
- Result/share: build a text summary (for example, rank title + stage scores) and copy it to the clipboard with the Clipboard API. A rendered canvas card for "your page in the book" is a stretch goal.
- Dev tool: a hidden `/pin-tool` page where you click a map image and it prints pin coordinates as JSON. Needed because fantasy places have no real coordinates.
- Random world per play, with a "Read another tale" replay.

## Story premise
The player is a Veracoder who enters their name at the start. They are one of the huddle in the Veracafe, the lunch area of the office building (see `theme_info/theme_transcript.md` and `reference_images/veracafe.png`). A strange, glowing green beer is spilled on the bound books, and fairytale creatures burst out into the real world. Somehow, the player is pulled into a book in a creature's place. Mark, the wizard, treats this as an accident ("that wasn't supposed to happen") and cannot pull the player out directly, but he can speak to them from the edge of the page and guide them. The only way out is to find and assemble the key. Every stage serves that goal:

| Stage | In the story | The player's question |
|---|---|---|
| Identify the world | Landing in an unfamiliar land with no idea which book it is | "Which story am I in?" |
| Find the location | Searching the world for the place where the way out lies | "Where is the exit?" |
| Trivia | Earning key fragments by showing knowledge of that place | "Can I forge the key?" |
| The Binding | Assembling the key and speaking the spell | "Can I get out?" |

Mark's guidance is deliberately partial (escalating clues, never the answer), because he is helping from outside the book. The creatures' return to their stories is the real-life hackathon challenge, so it is outside this game. The game is about the player's own escape.

## Game flow and safety nets
1. **Intro:** the player enters their name (a required text field with a sensible default, kept in memory only). The story opens after the chaos has started: fairy-tale creatures (spilled from the books by a glowing green beer) have taken over the office. The player, an innocent bystander, is blocked from their work by a dragon hoarding the water cooler, walks to the Veracafe, finds the glowing Hackathon History book, and is sucked into it (five illustrated scenes in `src/assets/intro-*.jpg`, ending on the fantasy landscape where Mark speaks). Mark appears at the page's edge, addresses them by name, admits with a wry air that this wasn't supposed to happen, explains that they have taken a creature's place, and says that the key out can be found by using their creativity and knowledge of the world they're in. Dialogue is tap-to-complete and has a skip button.
2. **Identify the world:** the player has landed somewhere unfamiliar, shown by the supplied unlabeled map for Westeros, Middle-earth, or Oz. Input is a text field with autocomplete. Answers are story names with the world in parentheses, for example "The Lord of the Rings (Middle-earth)"; the story alone, the world alone and common shorthand are also accepted. Mark gives 3 clues in escalating order (each costs more), and the last clue is a near-giveaway. Use the matching labeled map as the final hint, framed as Mark showing them where they are. After 3 wrong guesses, offer a multiple-choice fallback (it scores lower but unblocks the player).
3. **Find the location:** Mark names the place where the way out lies (for example, Winterfell). Each world has three possible exits and each game picks one at random, so replays differ. The player taps pins to travel the world looking for it. Each tap shows the name, a compass arrow and a proximity label (Very far to Very close), plus the pin's color, with no numeric distance. Each wrong guess costs a little. After N guesses, a pin pulses as a last-resort hint.
4. **Trivia:** 5 multiple-choice questions about the story and its world, framed as "pieces of the key". Each game asks one easy question, then two moderate and two hard, drawn at random from the world's pool so replays differ. A wrong answer lowers the score and shows a hint. The player can retry, so they never hard-fail. Hints should help a non-fan narrow the options without giving the answer away.
5. **The Binding (finale):** each correct answer adds a key fragment. The finale is a non-trivia ritual: assemble the five-piece key (tap each fragment into place), then hold-to-recite the spell (a hold-to-confirm, not a tap). The book slams shut, the player is back in the Veracafe, and the final page of the book now has their name in the story. The result card is that page, with rank title, per-stage score and share button.

## Design direction
Apply the frontend-design process (tokens, review against the brief, build, critique) with the game-ui-design constraints.
- **Concept:** make the fairytale "Page Break" story the visual center: enchanted books, stories spilling into the real world, a player trapped inside a book, and Mark as the wizard who guides them out. Use the supplied images in `reference_images/` (`wizard.png`, `wizard_back.png`, `pack-break-theme.png`, and `veracafe.png` for the intro and ending setting) as references/assets. The Veracode brand guide is optional reference, not the game's visual identity.
- **Voice:** write all narration and dialogue in the alliterative fairytale style of `theme_info/theme_transcript.md` and `theme_info/origin_transcript.md` ("Once upon a time...", "gleaming grimoires glowed"). Keep it short and playful, and keep Mark warm and a little wry.
- **Brand accents:** keep Veracode secondary to the story. Small background details or recurring icon colors can nod to the company, but should not dominate the palette, layout, or recognizable fairytale imagery.
- **Palette and type:** choose deliberate colors and expressive, legible type during implementation, guided by the story and supplied art rather than defaulting to the brand guide or a generic fairytale palette. Give each world's map room to retain its own visual character.
- **Boldness in one place:** make the map reveal and the Binding finale the memorable moments. Keep surrounding UI clear and restrained.
- **Narrative presentation:** use the supplied wizard imagery for Mark (his likeness is in `reference_images/`), with concise dialogue and a few storybook illustrations. No character animation.
- **Game UI rules to honor** (from `.agents/skills/game-ui-design/references`):
  - Touch targets of at least 44-48px, with 8px gaps.
  - Text of at least 16px, with high-contrast panels or shadows behind text over the map.
  - Proximity and results use text and an arrow, not just color.
  - Pins are real `<button>`s that are reachable by keyboard. Focus is a visible ring, and arrow keys move focus between pins.
  - Consistent confirm/back placement on every screen.
  - Motion only to communicate. Animations are under 300ms (the finale is the exception), use ease-out, and respect `prefers-reduced-motion`.
  - Layout scales with `rem` and viewport units, with a text-size toggle. There are no hardcoded pixel layouts and no z-index above 500.

## Red flags to carry through the build
Copyright on franchise material (accepted by user), content authoring cost (roughly 12-15 pins per map, 6 clue sets, and ~8 trivia questions per world), dead-ends for non-fans, answer-matching false negatives, narration length, no anti-cheat (answers live client-side), mobile map gestures vs tap, and accessibility.

## Critical files to create
- `package.json`, `vite.config.ts`, `index.html`
- `src/main.tsx`, `src/App.tsx`, `src/game/state.ts`
- `src/game/scoring.ts`, `src/game/geo.ts`, `src/game/match.ts` (+ `*.test.ts`)
- `src/worlds/index.ts` and `src/worlds/{oz,westeros,middleEarth}.ts`, using the supplied maps from `map_images/`
- `src/story/`, `src/ui/` (Map, PinButton, ClueLadder, TriviaCard, DialogueBox, BindingScene, ResultCard), `src/styles/tokens.css`
- `src/dev/PinTool.tsx`
- `README.md` (overwrite the one-liner with run/deploy notes)

## Verification
- `npm run test` for scoring, geo and match unit tests (alias, fuzzy, floors, bearings across all 8 directions).
- `npm run build`, then serve `dist/` and play all three worlds end to end on desktop width and a 375px mobile viewport.
- Dead-end checks: fail every guess and every clue and still reach the ending. Answer trivia wrong repeatedly and still finish.
- Accessibility pass: complete the game with the keyboard only, check reduced-motion and text-size toggle, and check contrast of text over maps.
- Deploy a preview to Vercel or Netlify and confirm the share text copies correctly.

## Map assets
The user supplied labeled and unlabeled maps for Westeros, Middle-earth, and Oz in `map_images/`. Use the unlabeled image to begin world identification and reveal the labeled counterpart only as the final hint. The `/pin-tool` page can help generate pin coordinates for the location-finding stage.
