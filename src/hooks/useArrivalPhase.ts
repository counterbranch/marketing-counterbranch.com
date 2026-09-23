import { useEffect, useState } from 'react'
import { useInView } from './useInView.ts'
import type { RunPhase } from '../motion.ts'

/**
 * A one-time arrival for a part of the page, played the first time it comes
 * into view. The first render is the finished part (idle), so the
 * prerendered HTML and hydration agree and nothing moves without a reason.
 * Only once the observer has reported the part off screen is it hidden
 * (armed), and it plays when it comes into view. `playMs` later it settles
 * back to idle, dropping its animations, so a part hidden and shown again
 * by a breakpoint never replays. State is adjusted during render, React's
 * pattern for deriving from a previous value, so arming takes no extra frame.
 */
export function useArrivalPhase<T extends HTMLElement>(threshold: number, playMs: number) {
  const { ref, inView } = useInView<T>({ threshold })
  const [armed, setArmed] = useState(false)
  const [done, setDone] = useState(false)
  if (!inView && !armed) setArmed(true)
  const phase: RunPhase = !armed || done ? 'idle' : inView ? 'playing' : 'armed'

  useEffect(() => {
    if (phase !== 'playing') return
    const id = window.setTimeout(() => setDone(true), playMs)
    return () => window.clearTimeout(id)
  }, [phase, playMs])

  return { ref, phase }
}
