# Page Break: Design Notes

Process: frontend-design (plan, review, build, critique) constrained by the game-ui-design references.

## Tokens

| Name | Value | Use |
|---|---|---|
| Bottle Green | `#12261E` | The dark "inside the book" ground |
| Deep Spine | `#0B1713` | Panels sitting on the ground (Mark's strip, HUD) |
| Vellum | `#EADFC0` | Pages: cards, map frame, result card |
| Parchment Shade | `#D9C99C` | Borders and quiet fills on pages |
| Ink | `#2B2015` | Text on vellum (about 12:1) |
| Lamplight | `#F2EAD3` | Text on dark (about 14:1) |
| Gilt | `#D9A93F` | Edges, focus rings, primary buttons |
| Brew Green | `#8DF05C` | Magic only: glow, key fragments, spell, pulse |
| Madder | `#B8452D` | Wrong answers, always paired with an icon and words |

Type: **Grenze Gotisch** for titles, the rank and the wordmark; **Alegreya** for narration, controls and UI. Base size is 1.125rem, scaled by the text-size toggle (100%, 125%, 150%).

## Review of the first plan

The first draft was a near-black ground with one acid-green accent and a cream page, which is the common default. Changes:

- The ground is bottle green, not black, with a gilt edge, so it reads as a cloth-bound book.
- Brew Green is reserved for magic. Everything else uses gilt, so the green stays meaningful.
- Wrong answers use Madder plus a cross icon and the word "Not quite", never colour alone.
- No eyebrow labels, no numbered markers except where the content is a real sequence (the five key fragments).

## Layout

```
Mobile                        Desktop (>= 64rem)
+--------------------+        +-----------------------------------+
| HUD: key   score ⚙ |        | HUD: key        score   settings  |
+--------------------+        +----------------------+------------+
| Stage title        |        | Map page             | Mark, clues|
| [ map page ]       |        |                      | guesses    |
| clues / guesses    |        |                      |            |
+--------------------+        +----------------------+------------+
| Mark strip         |        | Mark strip                        |
| [Back]    [Confirm]|        | [Back]                   [Confirm]|
+--------------------+        +-----------------------------------+
```

Content is left-aligned. The Binding and ending centre their content because they are ceremonies.

## The two bold moments

1. **Map reveal:** the unlabelled map is revealed from a green glow that spreads out from the centre (about 480ms, an allowed exception to the 300ms rule). It is replaced by a fade under reduced motion.
2. **The Binding:** the key assembles, the spell is held, the book slams shut and the café fades in.

## Game UI rules honoured

- Touch targets are at least 2.75rem with 0.5rem gaps. Pins are real buttons and arrow keys move focus between them.
- Text is at least 1rem. Text over the map sits on dark panels.
- Proximity uses a word and a shape, plus the compass arrow and its spoken form.
- Motion is under 300ms except the two moments above. It is turned off by the OS setting or the in-game toggle.
- z-index scale: dropdown 100, modal 200, tooltip 300, notification 400. Nothing is above 500.
