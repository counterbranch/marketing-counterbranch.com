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
  /** A command typed out at a terminal prompt, a character per step. */
  typing: 900,
  /** One on-and-off cycle of a resting terminal cursor. */
  blink: 1100,
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
 * A typed line revealed from its left edge. Run with `steps()` timing so it
 * advances a character at a time instead of wiping smoothly. Clips rather
 * than moves, so the line holds its place in the layout the whole time.
 */
export const typeOn = keyframes`
  from {
    clip-path: inset(0 100% 0 0);
  }
  to {
    clip-path: inset(0);
  }
`

/**
 * A caret keeping pace with `typeOn`. It rides a track laid exactly over the
 * typed line, so crossing the track's full width follows the reveal's edge.
 * Run with the same duration and steps.
 */
export const caretTravel = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100%);
  }
`

/**
 * Takes a caret away once its line is entered. Run with `forwards` fill, so
 * it stays in place until its delay and is gone after.
 */
export const caretOut = keyframes`
  to {
    opacity: 0;
  }
`

/**
 * A resting terminal cursor. Run with `steps(2, jump-none)` so each end holds
 * for half the cycle: on, then off. Without `both` fill, the cursor rests on
 * when the last cycle ends.
 */
export const caretBlink = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`

/**
 * A line of output arriving from just below. Ends on the element's own
 * styles, so removing the animation after it finishes changes nothing.
 */
export const lineIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

/**
 * A mark appearing in place within a line that is already showing, so the
 * text around it never moves.
 */
export const glyphIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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
    transform: scale(0.94);
  }
  to {
    opacity: 1;
    transform: scale(1);
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
