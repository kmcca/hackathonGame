import bit from '../assets/key-bit.jpg'
import bow from '../assets/key-bow.jpg'
import collar from '../assets/key-collar.jpg'
import ward from '../assets/key-ward.jpg'
import shaft from '../assets/key-shaft.jpg'
import together from '../assets/key-together.jpg'
import type { FragmentId } from './icons'

/** Every piece is a slice of one picture, cut to the same height, so they line up when placed side by side. */
export const KEY_HEIGHT = 370

export const KEY_PIECES: Record<FragmentId, { src: string; width: number; alt: string }> = {
  bow: { src: bow, width: 370, alt: 'A round brass key handle with a small book engraved in the middle and a green jewel' },
  collar: { src: collar, width: 150, alt: 'A brass collar ring with a twisted rope pattern' },
  shaft: { src: shaft, width: 315, alt: 'A long brass key shaft engraved with faint script' },
  ward: { src: ward, width: 170, alt: 'A brass plate with a square hole in the middle' },
  bit: { src: bit, width: 235, alt: 'A brass key bit with notched teeth' },
}

export const KEY_TOGETHER = {
  src: together,
  width: 1240,
  alt: 'The five pieces joined into one glowing brass key',
}
