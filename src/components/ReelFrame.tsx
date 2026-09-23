import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import PauseRoundedIcon from '@mui/icons-material/PauseRounded'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import { motionDuration, motionEasing } from '../motion.ts'
import { REEL_CONTROL_GAP, REEL_CONTROL_SIZE, ReelFrameContext } from './reelFrameContext.ts'
import type { ReelEdge, ReelFrameValue } from './reelFrameContext.ts'

/**
 * Gives the SlotWord reel inside it a pause control, which WCAG 2.2.2 asks of
 * anything that moves on its own for more than five seconds.
 *
 * The control sits at the reel's top right, just past its full stop, and
 * follows the window's edge as it resizes, so it stays attached to the reel
 * it stops. The frame is a size container: a heading scales its reel line to
 * the frame's width less REEL_CONTROL_ROOM, so the control always has room. It is kept quiet at rest (still 3:1 against the band) and comes
 * up to full ink on hover and focus. It lives outside the heading and outside
 * the reel's aria-hidden subtree, so it has its own name and never becomes
 * part of the heading's. Hidden under reduced motion, where the reel is
 * already still.
 */
export default function ReelFrame({
  children,
  sx,
}: {
  children: ReactNode
  /** For the frame itself, such as an entrance the control should share. */
  sx?: SxProps<Theme>
}) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const [held, setHeld] = useState(false)
  const [reel, setReel] = useState<ReelEdge | null>(null)
  const [box, setBox] = useState<{ x: number; y: number; width: number } | null>(null)

  // Where the reel's root sits in the frame. Measured, not assumed: it moves
  // when the heading rewraps, the web font lands or the page resizes. Layout
  // offsets rather than client rects, so an entrance still transforming the
  // heading can't skew the result.
  const root = reel?.root
  useLayoutEffect(() => {
    const frame = frameRef.current
    if (!frame || !root) return
    const measure = () => {
      let x = 0
      let y = 0
      let node: Element | null = root
      while (node instanceof HTMLElement && node !== frame) {
        x += node.offsetLeft
        y += node.offsetTop
        node = node.offsetParent
      }
      if (node === frame) setBox({ x, y, width: frame.clientWidth })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    observer.observe(root)
    return () => observer.disconnect()
  }, [root])

  const value = useMemo<ReelFrameValue>(() => ({ paused, held, report: setReel }), [paused, held])
  // Past the full stop. The headings leave room for it; the clamp is a
  // backstop so the control can never widen the page.
  const shift =
    reel && box ? Math.min(reel.edge + REEL_CONTROL_GAP, box.width - box.x - REEL_CONTROL_SIZE) : 0
  const fade = `opacity ${motionDuration.fast}ms ${motionEasing.decel}`

  return (
    <ReelFrameContext.Provider value={value}>
      {/* Full width even in a flex column, so the control has the line's
          room past the reel, not only the heading's. */}
      <Box
        ref={frameRef}
        sx={[
          { position: 'relative', alignSelf: 'stretch', containerType: 'inline-size' },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {children}
        {reel && box && (
          <ButtonBase
            aria-label="Pause the rotating words"
            aria-pressed={paused}
            onClick={() => setPaused((current) => !current)}
            onPointerEnter={(event) => event.pointerType === 'mouse' && setHeld(true)}
            onPointerLeave={() => setHeld(false)}
            sx={{
              position: 'absolute',
              top: box.y,
              left: box.x,
              width: REEL_CONTROL_SIZE,
              height: REEL_CONTROL_SIZE,
              transform: `translateX(${shift}px)`,
              transition: reel.transition === 'none' ? fade : `${reel.transition}, ${fade}`,
              borderRadius: '50%',
              border: '1px solid currentColor',
              color: 'inherit',
              opacity: 0.55,
              '&:hover, &.Mui-focusVisible': { opacity: 1 },
              '&.Mui-focusVisible': { outline: '2px solid currentColor', outlineOffset: 2 },
              '@media (prefers-reduced-motion: reduce)': { display: 'none' },
            }}
          >
            {paused ? (
              <PlayArrowRoundedIcon aria-hidden sx={{ fontSize: 16 }} />
            ) : (
              <PauseRoundedIcon aria-hidden sx={{ fontSize: 16 }} />
            )}
          </ButtonBase>
        )}
      </Box>
    </ReelFrameContext.Provider>
  )
}
