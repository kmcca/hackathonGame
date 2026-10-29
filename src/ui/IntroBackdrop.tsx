import titleArt from '../../reference_images/pack-break-theme.png'

/** Where each green spark starts across the page, how big it is, and how long it takes to drift up. */
const SPARKS = [
  { left: 6, size: 0.35, seconds: 14, delay: 0, drift: 2 },
  { left: 14, size: 0.5, seconds: 18, delay: 5, drift: -3 },
  { left: 22, size: 0.3, seconds: 12, delay: 9, drift: 2.5 },
  { left: 31, size: 0.45, seconds: 16, delay: 2, drift: -2 },
  { left: 40, size: 0.3, seconds: 13, delay: 7, drift: 3 },
  { left: 48, size: 0.55, seconds: 19, delay: 11, drift: -2.5 },
  { left: 56, size: 0.35, seconds: 15, delay: 4, drift: 2 },
  { left: 64, size: 0.45, seconds: 17, delay: 8, drift: -3 },
  { left: 72, size: 0.3, seconds: 12, delay: 1, drift: 2.5 },
  { left: 80, size: 0.5, seconds: 18, delay: 6, drift: -2 },
  { left: 88, size: 0.35, seconds: 14, delay: 10, drift: 3 },
  { left: 95, size: 0.4, seconds: 16, delay: 3, drift: -2.5 },
]

/**
 * The intro sits inside the book's own light: a blurred, dimmed copy of the cover art fills the page,
 * the edges fall away to the dark binding, and green sparks drift up like the magic in the picture.
 * It is fixed behind the content, and App keeps one copy mounted from the title through the whole
 * story, so it does not restart between screens. The game stages do not use it.
 */
export function IntroBackdrop() {
  return (
    <div className="intro-backdrop" aria-hidden="true">
      <img className="intro-backdrop__glow" src={titleArt} alt="" />
      {SPARKS.map((spark, index) => (
        <span
          key={index}
          className="intro-backdrop__spark"
          style={{
            left: `${spark.left}%`,
            width: `${spark.size}rem`,
            height: `${spark.size}rem`,
            animationDuration: `${spark.seconds}s`,
            animationDelay: `${spark.delay}s`,
            ['--drift' as string]: `${spark.drift}rem`,
          }}
        />
      ))}
    </div>
  )
}
