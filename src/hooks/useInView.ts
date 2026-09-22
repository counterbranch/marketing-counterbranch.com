import { useEffect, useRef, useState } from 'react'

interface UseInViewOptions {
  threshold?: number
  rootMargin?: string
}

/**
 * Tracks whether an element has scrolled into view, firing once.
 *
 * Starts `true`, so the prerendered HTML and the hydrating first render agree
 * and content is visible without JavaScript. After mount the observer's first
 * report decides: an element already in view simply stays shown, while one
 * below the fold is hidden, out of sight, and revealed the first time it
 * crosses the threshold. Without IntersectionObserver it stays visible.
 */
export function useInView<T extends HTMLElement>({
  threshold = 0.2,
  rootMargin = '0px 0px -10% 0px',
}: UseInViewOptions = {}) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        } else {
          setInView(false)
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return { ref, inView }
}
