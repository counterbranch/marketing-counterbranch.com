import { createContext, useContext } from 'react'

/** The pause control's size, in px: the smallest target WCAG 2.5.8 allows. */
export const REEL_CONTROL_SIZE = 24
/** Space between the reel's full stop and the control, in px. */
export const REEL_CONTROL_GAP = 6
/**
 * What a reel's line must leave free past its longest word, in px, so the
 * control fits beside it. The headings take it off the width their reel line
 * scales to.
 */
export const REEL_CONTROL_ROOM = REEL_CONTROL_SIZE + REEL_CONTROL_GAP

/** Where the reel's visible right edge is, reported by SlotWord. */
export interface ReelEdge {
  /** The reel's root, the positioned box the edge is measured from. */
  root: HTMLElement
  /** Distance from the root's left to the end of the suffix, in px. */
  edge: number
  /** The transition the suffix follows the window with, so the control matches it. */
  transition: string
}

export interface ReelFrameValue {
  /** Stopped by the visitor, until they play it again. */
  paused: boolean
  /** Held still while the pointer is on the control, so it never moves from under it. */
  held: boolean
  report: (edge: ReelEdge) => void
}

export const ReelFrameContext = createContext<ReelFrameValue | null>(null)

/** For SlotWord: the frame it sits in, if any. */
export function useReelFrame() {
  return useContext(ReelFrameContext)
}
