import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import { motionDuration, motionEasing, reelDwell } from '../motion.ts'
import { useReelFrame } from './reelFrameContext.ts'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.ts'

/** Height of one reel row, in em. The window and every row share it, so one roll moves exactly one word. */
const ROW = 1.1
/** Window padding either side of a word, in em. */
const PAD = 0.28
/** Space between the window and the suffix, in em. */
const GAP = 0.04

const reduceMotion = '@media (prefers-reduced-motion: reduce)'

interface Metrics {
  /** Rendered width of each word, tracking balance included. */
  words: number[]
  /** Rendered width of the suffix, its gap included. */
  suffix: number
  /** Window padding, in px. */
  pad: number
}

interface SlotWordProps {
  words: readonly string[]
  /** Fill of the reel window. */
  plate: string
  /** Ink of the words inside it. */
  ink: string
  /** Punctuation that hugs the window, such as the sentence's full stop. */
  suffix?: string
  /**
   * Letter-spacing of the surrounding text. Tracking adds space after a
   * word's last letter, so the same amount goes before its first letter to
   * keep the window's padding optically even on both sides.
   */
  tracking?: string
  /** How long each word rests before the reel rolls on, in ms. */
  dwell?: number
  /**
   * How long the window takes to resize to the next word, in ms. Must not
   * exceed motionDuration.reel: a growing window has to be open before the
   * word lands, and a shrinking one closes in with a delay of reel minus
   * this.
   */
  windowMs?: number
  /**
   * The earliest the first roll may happen, in ms on the page's clock
   * (performance.now()). For a page whose entrance should finish before the
   * reel starts moving.
   */
  firstRollAt?: number
}

/**
 * One word that rolls vertically through `words`, like a slot-machine reel.
 *
 * The window is anchored at its left edge, in line with the sentence above.
 * Two states share one DOM. Before measurement (the prerendered HTML, and the
 * first client render that hydrates it) the window is ordinary inline layout
 * around the first word, so the page reads correctly before any script runs.
 * Once widths are measured, the window takes the width of the longest word
 * and only clip-path and transforms change from then on: the window's right
 * edge is clipped to the current word, the reel translates vertically, and
 * the suffix translates to follow that edge. Nothing about the line's layout
 * changes during a roll. Both states put every glyph in the same place, so
 * the hand-over is invisible.
 *
 * The reel holds every word plus a copy of the first. Rolling onto that copy
 * looks identical to rolling back to the start; once it lands, the reel snaps
 * to the real first word with transitions off, so the loop never rewinds.
 *
 * Purely visual and aria-hidden: the surrounding heading must carry an
 * accessible version of the sentence. It rests on the first word for visitors
 * who prefer reduced motion, and pauses while hovered, while scrolled out of
 * view and while the tab is hidden. Inside a ReelFrame it also stops while the
 * visitor has it paused or rests the pointer on its control, and reports its
 * right edge so the control can sit there.
 */
export default function SlotWord({
  words,
  plate,
  ink,
  suffix = '',
  tracking = '0',
  dwell = reelDwell,
  windowMs = motionDuration.reelWindow,
  firstRollAt,
}: SlotWordProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const frame = useReelFrame()
  const rootRef = useRef<HTMLSpanElement>(null)
  const wordSizers = useRef<(HTMLSpanElement | null)[]>([])
  const suffixSizer = useRef<HTMLSpanElement>(null)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [index, setIndex] = useState(0)
  // Off until the first roll, so moving into the measured state is an
  // instant, invisible swap rather than a transition from inline layout.
  const [animated, setAnimated] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [onScreen, setOnScreen] = useState(true)
  const [tabVisible, setTabVisible] = useState(true)

  const count = words.length
  const reel = [...words, words[0]]
  const atLoopCopy = index >= count

  // Widths are measured rather than estimated because the headline's size is
  // fluid. The observer reports once on attach and again whenever a word's
  // rendered size changes: a resize, or the web font arriving.
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const nodes = wordSizers.current.slice(0, words.length)
    const observer = new ResizeObserver(() => {
      setMetrics({
        words: nodes.map((node) => node?.getBoundingClientRect().width ?? 0),
        suffix: suffixSizer.current?.getBoundingClientRect().width ?? 0,
        pad: PAD * parseFloat(getComputedStyle(root).fontSize),
      })
    })
    nodes.forEach((node) => node && observer.observe(node))
    if (suffixSizer.current) observer.observe(suffixSizer.current)
    return () => observer.disconnect()
  }, [words])

  useEffect(() => {
    const root = rootRef.current
    if (!root || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting))
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onChange = () => setTabVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  const measured = metrics !== null
  const running =
    measured &&
    count > 1 &&
    !prefersReducedMotion &&
    !hovered &&
    !frame?.paused &&
    !frame?.held &&
    onScreen &&
    tabVisible

  // Rest, then roll one word. The first roll also waits for `firstRollAt` on
  // the page's clock, so a page can finish its own entrance first; later
  // rolls, and a first roll after that point, wait the dwell alone.
  useEffect(() => {
    if (!running || atLoopCopy) return
    const wait =
      index === 0 && firstRollAt !== undefined ? Math.max(dwell, firstRollAt - performance.now()) : dwell
    const timer = window.setTimeout(() => {
      setAnimated(true)
      setIndex((current) => current + 1)
    }, wait)
    return () => window.clearTimeout(timer)
  }, [running, atLoopCopy, index, dwell, firstRollAt])

  // After rolling onto the copy of the first word, jump to the real one
  // without transitions. Timed rather than tied to `transitionend`, which a
  // browser can skip when the tab is backgrounded mid-roll.
  useEffect(() => {
    if (!atLoopCopy) return
    const timer = window.setTimeout(() => {
      setAnimated(false)
      setIndex(0)
    }, motionDuration.reel)
    return () => window.clearTimeout(timer)
  }, [atLoopCopy])

  const widest = measured ? Math.max(...metrics.words) + 2 * metrics.pad : 0
  const current = measured ? metrics.words[index % count] + 2 * metrics.pad : 0
  const previous = measured ? metrics.words[(index + count - 1) % count] + 2 * metrics.pad : 0
  // The window never clips an arriving word: when the next word is wider,
  // the window opens first and the word rolls into a space already made;
  // when it is narrower, the window waits for the word to land, then closes
  // in around it.
  const windowDelay = current >= previous ? 0 : motionDuration.reel - windowMs
  const roll = animated ? `transform ${motionDuration.reel}ms ${motionEasing.decel}` : 'none'
  const resize = (property: string) =>
    animated
      ? `${property} ${windowMs}ms ${motionEasing.decel} ${windowDelay}ms`
      : 'none'

  // The frame's control follows the suffix, the reel's visible right edge.
  const report = frame?.report
  const edge = measured ? current + metrics.suffix : 0
  const follow = resize('transform')
  useLayoutEffect(() => {
    const root = rootRef.current
    if (report && root && measured) report({ root, edge, transition: follow })
  }, [report, measured, edge, follow])

  return (
    <Box
      component="span"
      ref={rootRef}
      aria-hidden
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: 'relative',
        display: 'inline-block',
        height: `${ROW}em`,
        lineHeight: `${ROW}em`,
        whiteSpace: 'nowrap',
        ...(measured && { width: `${widest + metrics.suffix}px` }),
      }}
    >
      {/* Every word and the suffix at the live size, laid out but clipped to
          a zero-size box so they never paint or add overflow. */}
      <span
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          overflow: 'hidden',
          visibility: 'hidden',
        }}
      >
        {words.map((word, i) => (
          <span
            key={word}
            ref={(node) => {
              wordSizers.current[i] = node
            }}
            style={{ display: 'block', width: 'max-content', paddingLeft: tracking }}
          >
            {word}
          </span>
        ))}
        {suffix && (
          <span
            ref={suffixSizer}
            style={{ display: 'block', width: 'max-content', paddingLeft: `${GAP}em` }}
          >
            {suffix}
          </span>
        )}
      </span>

      <Box
        component="span"
        sx={[
          {
            display: 'inline-block',
            verticalAlign: 'top',
            height: `${ROW}em`,
            overflow: 'hidden',
            bgcolor: plate,
            color: ink,
          },
          measured
            ? {
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${widest}px`,
                clipPath: `inset(0 ${widest - current}px 0 0)`,
                transition: resize('clip-path'),
                [reduceMotion]: { transition: 'none' },
              }
            : { px: `${PAD}em` },
        ]}
      >
        <Box
          component="span"
          sx={[
            { display: 'block' },
            measured && {
              position: 'absolute',
              top: 0,
              left: `${metrics.pad}px`,
              transform: `translateY(${-index * ROW}em)`,
              transition: roll,
              [reduceMotion]: { transition: 'none' },
            },
          ]}
        >
          {reel.map((word, i) => (
            <Box
              key={`${word}-${i}`}
              component="span"
              sx={{
                display: measured || i === 0 ? 'block' : 'none',
                height: `${ROW}em`,
                textAlign: 'left',
                pl: tracking,
              }}
            >
              {word}
            </Box>
          ))}
        </Box>
      </Box>

      {suffix && (
        <Box
          component="span"
          sx={[
            { pl: `${GAP}em` },
            measured && {
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `translateX(${current}px)`,
              transition: resize('transform'),
              [reduceMotion]: { transition: 'none' },
            },
          ]}
        >
          {suffix}
        </Box>
      )}
    </Box>
  )
}
