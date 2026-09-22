import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Tracks the visitor's reduced-motion preference, including changes made
 * while the page is open. Defaults to `true` where the preference cannot be
 * read, so motion is opt-in rather than forced on.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return true
    return window.matchMedia(QUERY).matches
  })

  useEffect(() => {
    if (!window.matchMedia) return
    const list = window.matchMedia(QUERY)
    const onChange = (event: MediaQueryListEvent) => setPrefersReduced(event.matches)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [])

  return prefersReduced
}
