import { keyframes } from '@mui/material/styles'
import type { SxProps, Theme } from '@mui/material/styles'

/**
 * Motion tokens. Single source of truth for durations, easing and stagger
 * used across the site so timing stays consistent and nothing is a magic
 * number scattered through components.
 */
export const motionDuration = {
  /** Immediate feedback: hover/press states. */
  fast: 150,
  /** Routine state change: scroll-in reveals. */
  base: 240,
  /** Deliberately authored focal entrance: hero stages. */
  entrance: 420,
  /** One roll of the headline's word reel. */
  reel: 460,
  /**
   * The reel window resizing to the next word. Shorter than the roll so a
   * growing window is at full width before the word lands, and a shrinking
   * one waits until the word has landed before closing in.
   */
  reelWindow: 240,
  /** One full breath of a live status marker: dim and back. */
  pulse: 1600,
  /**
   * A signal crossing a connector in a diagram and fading where it lands.
   * The crossing takes the first five sixths; see `signalTravel`.
   */
  signal: 720,
  /** The same over a shorter connector: crossing 500 ms, fading 100 ms. */
  signalShort: 600,
} as const

export const motionEasing = {
  /** Confident, natural deceleration for arrivals. */
  decel: 'cubic-bezier(0.16, 1, 0.3, 1)',
} as const

/** How long each word rests in the headline reel before it rolls, in ms. */
export const reelDwell = 2000

/** Delay between successive hero entrance stages, in ms. */
export const motionStagger = 80

const reduceMotion = '@media (prefers-reduced-motion: reduce)'

/**
 * Entrance from an already-visible state: content is on screen from the first
 * paint and settles into place, rather than appearing out of nothing. It also
 * keeps the hero headline eligible as the Largest Contentful Paint element,
 * which browsers skip when it is first painted at opacity 0.
 */
export const settleIn = keyframes`
  from {
    opacity: 0.35;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

/**
 * A status marker breathing while work is in progress. Starts and ends fully
 * on, so it rests at full strength whenever the animation is removed.
 */
export const statusPulse = keyframes`
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
`

/**
 * A verdict landing: from just under its size and unseen to its resting
 * state. Ends on the element's own styles, so removing the animation after it
 * finishes changes nothing on screen.
 */
export const stampIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`

/**
 * A band drawn open from its top edge down. Clips rather than moves, so the
 * band holds its place in the layout the whole time.
 */
export const wipeDown = keyframes`
  from {
    clip-path: inset(0 0 100% 0);
  }
  to {
    clip-path: inset(0);
  }
`

/**
 * A signal travelling the element's `offset-path`: it appears at the start,
 * crosses in the first five sixths of the run, then fades out at the far
 * end. It starts and ends unseen, so with `both` fill it is hidden before its
 * delay and after it lands.
 */
export const signalTravel = keyframes`
  0% {
    offset-distance: 0%;
    opacity: 0;
  }
  4% {
    opacity: 1;
  }
  83.333% {
    offset-distance: 100%;
    opacity: 1;
  }
  100% {
    offset-distance: 100%;
    opacity: 0;
  }
`

/**
 * Staged entrance for hero content. `index` selects the stagger delay
 * (headline = 0, description = 1, buttons = 2, footnote = 3).
 * Animates opacity + transform only.
 */
export function heroStageSx(index: number): SxProps<Theme> {
  const delay = index * motionStagger
  return {
    animation: `${settleIn} ${motionDuration.entrance}ms ${motionEasing.decel} ${delay}ms both`,
    [reduceMotion]: {
      animation: 'none',
      opacity: 1,
    },
  }
}

/**
 * Scroll-triggered reveal, driven by the `useInView` hook. Fires once and
 * animates opacity + transform only.
 */
export function revealSx(inView: boolean): SxProps<Theme> {
  return {
    opacity: inView ? 1 : 0,
    transform: inView ? 'none' : 'translateY(16px)',
    transition: `opacity ${motionDuration.base}ms ${motionEasing.decel}, transform ${motionDuration.base}ms ${motionEasing.decel}`,
    [reduceMotion]: {
      transition: 'opacity 1ms linear',
      transform: 'none',
    },
  }
}
