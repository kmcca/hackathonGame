# Page Break: Breakout

A free, browser-based map-and-trivia game for Hackathon 28 ("Page Break"). A glowing green beer spills, the books burst open, and you are swallowed by one. Wizard Mark guides you from the edge of the page: name the story you landed in, find the place where the way out lies, answer questions to forge the key, then speak the spell. A play-through takes four to six minutes.

There is no backend and no account. Your name stays in the browser tab.

## Run it

```
npm install
npm run dev        # http://localhost:5173
npm run test       # unit tests for scoring, geo, matching and the game state machine
npm run build      # static site in dist/
npm run preview    # serve dist/ locally
```

## Deploy

`dist/` is a plain static site. On Netlify or Vercel, set the build command to `npm run build` and the output directory to `dist`. `public/_redirects` (Netlify) and `vercel.json` (Vercel) route every path to `index.html`, which the hidden `/pin-tool` page relies on. If you cannot add a redirect, `#pin-tool` also opens it.

## Where things live

| Path | What it holds |
|---|---|
| `src/worlds/*.ts` | One module per world: map images, pins, clues and trivia. `decoys.ts` lists stories that only appear in autocomplete. |
| `src/story/` | Intro beats and Mark's lines. Edit these to change the voice. |
| `src/audio/` | Voice playback. `voice.ts` maps each line id (see `docs/AUDIO_SCRIPT.md`) to a start and end time in a recording in `voice_audio/`. |
| `src/game/` | Pure logic with tests: `scoring`, `geo`, `match`, `state` (the reducer), `share`. |
| `src/ui/` | Components and the six screens. |
| `src/styles/` | Tokens, base, layout, components, and the two memorable moments. |
| `map_images/` | The supplied maps. Worlds import these directly. |
| `docs/` | `PLAN.md` (scope and decisions) and `DESIGN.md` (visual direction). |

## Adding or changing a world

1. Add a module in `src/worlds/` that satisfies the `World` type, and register it in `src/worlds/index.ts`.
2. Open `/pin-tool` (or `#pin-tool`), pick the world, click the map to place each pin, and paste the printed JSON into the module's `pins`. Fantasy places have no real coordinates, so this is how they are placed.
3. Provide three world clues, three location clues, and a pool of trivia questions tagged `easy`, `moderate` or `hard` (at least 2 easy, 2 moderate and 2 hard; eight is a good size). Each game asks one easy, two moderate and two hard, chosen at random. Set the `story` field to the book or franchise title, since players answer with "Story (World)".

To replace a map, swap the image in `map_images/` (keep the same file name, or update the import) and re-check the pins in the pin tool.

## Scoring

Each of three stages is worth 100 points. Costs are shown before you pay them, and no stage drops below 10 points, so everyone can finish.

| Stage | Costs |
|---|---|
| Which story | Wrong guess 10. Clues 10, 20 and 30. Labelled map 25. The multiple-choice shelf caps the stage at 40. |
| Where | Wrong place 5. No clues; the player gets a direction and a Close/Far label for each place. After 6 wrong places the target pulses. |
| The key | Five questions, easy to hard. Wrong answer 10. Retry as often as you like. |

The Binding is a ritual and is not scored.

## Accessibility

- Every control is at least 44px, and pins are real buttons. Arrow keys move between pins on the map.
- Proximity is shown with a word and a shape, and direction with an arrow and its spoken form. Colour is never the only signal.
- The settings menu has a text-size control and a reduce-motion switch. The operating system's reduced-motion setting is respected on first load.
- The spell can be spoken by holding the seal (pointer or Space) or, for anyone who cannot hold, by tapping it five times.
