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
 * report decides: an element already partly in view simply stays shown (it is
 * never hidden while someone can see it), while one below the fold is hidden,
 * out of sight, and revealed once `threshold` of it is on screen.
 *
 * An element too tall to ever show that share is revealed once its visible
 * part fills `threshold` of the viewport instead. The observer only reports
 * when a ratio it was given is crossed, so the ratio it watches is worked out
 * from the element's height and the observed viewport's (the root bounds the
 * observer reports, margin applied), and worked out again when either
 * changes. Without IntersectionObserver it stays visible.
 */
export function useInView<T extends HTMLElement>({
  threshold = 0.2,
  rootMargin = '0px 0px -10% 0px',
}: UseInViewOptions = {}) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const current = ref.current
    if (!current || typeof IntersectionObserver === 'undefined') return
    const node: HTMLElement = current

    let observer: IntersectionObserver | null = null
    let resizeObserver: ResizeObserver | null = null
    let share = threshold
    // The observed viewport's height, margin applied, once the observer has
    // reported it; the window's height until then.
    let rootHeight = 0
    let firstReport = true
    let done = false

    // The share of the element that must be on screen: `threshold`, or less
    // for an element taller than the viewport can show that share of.
    const shareFor = () => {
      const height = node.getBoundingClientRect().height
      const viewport = rootHeight || window.innerHeight
      if (height <= 0 || viewport <= 0) return threshold
      return Math.min(threshold, (viewport * threshold) / height)
    }

    const stop = () => {
      done = true
      observer?.disconnect()
      resizeObserver?.disconnect()
      window.removeEventListener('resize', watch)
    }

    function watch() {
      if (done) return
      observer?.disconnect()
      share = shareFor()
      const current = new IntersectionObserver(
        (entries, source) => {
          // A replaced observer can still deliver reports it queued before
          // it was disconnected; only the current one decides.
          if (done || source !== observer) return
          // A batch can hold several reports for the element; read them in
          // order and stop at the first that shows enough of it.
          for (const entry of entries) {
            const isFirst = firstReport
            firstReport = false
            if (entry.isIntersecting && (isFirst || entry.intersectionRatio >= share - 1e-6)) {
              setInView(true)
              stop()
              return
            }
            if (!entry.isIntersecting) setInView(false)
          }
          // Now the observed viewport's real height is known, watch the share
          // it implies if the window's height gave a different one.
          const measured = entries[entries.length - 1]?.rootBounds?.height ?? 0
          if (measured > 0 && measured !== rootHeight) {
            rootHeight = measured
            if (Math.abs(shareFor() - share) > 1e-3) watch()
          }
        },
        { threshold: [0, share], rootMargin },
      )
      observer = current
      current.observe(node)
    }

    // Reports once on attach, which starts the watch, and again whenever the
    // element's size changes (a resize, the web font arriving).
    if (typeof ResizeObserver === 'undefined') {
      watch()
    } else {
      resizeObserver = new ResizeObserver(watch)
      resizeObserver.observe(node)
    }
    window.addEventListener('resize', watch)

    return stop
  }, [threshold, rootMargin])

  return { ref, inView }
}
