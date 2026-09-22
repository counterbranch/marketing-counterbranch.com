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
  reel: 560,
} as const

export const motionEasing = {
  /** Confident, natural deceleration for arrivals. */
  decel: 'cubic-bezier(0.16, 1, 0.3, 1)',
  /**
   * A small overshoot and settle, like a reel clicking into place. The
   * overshoot shows a sliver of the next word for a moment, which is the
   * slot-machine read; it is kept small enough not to feel like a bounce.
   */
  reelSettle: 'cubic-bezier(0.3, 1.3, 0.5, 1)',
} as const

/** How long each word rests in the headline reel before it rolls, in ms. */
export const reelDwell = 2400

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
