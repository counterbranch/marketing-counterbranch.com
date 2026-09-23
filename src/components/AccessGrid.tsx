import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import type { CSSProperties, ReactNode } from 'react'
import { MONO_FONT } from './DiffVersusRun.tsx'
import { displayFont } from '../theme.ts'
import { useArrivalPhase } from '../hooks/useArrivalPhase.ts'
import {
  drawLine,
  glyphIn,
  lineIn,
  motionEasing,
  nodeIn,
  slipIn,
  wipeIn,
  type RunPhase,
} from '../motion.ts'

/**
 * The access grid: the page's running example drawn as data. All 128
 * prepared checks are squares, one per check, in rows from the most
 * privileged role down to viewer, so what is allowed (cyan) steps down from
 * the top left and the rest is denied (ink). Every square is two halves, the
 * check's decision on main and on pr-142; where the two runs agree they fuse
 * into one square. The one check that changed is the only square that splits,
 * and a loupe beside the grid shows it slipped apart: DENY on main, ALLOW on
 * pr-142.
 *
 * Each figure draws once, the first time it is on screen, then settles. The
 * first render is the finished figure, so the prerendered page, visitors
 * without JavaScript and reduced motion all see it whole.
 */

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'

/** Share of a figure that must be on screen before it plays. */
const THRESHOLD = 0.45

const COLS = 16
const ROWS = 8

/**
 * The columns each row allows on main, most privileged row first: 41 allow
 * and 87 deny, as in the terminal run above. The shape is illustrative; the
 * counts are the example's.
 */
const MAIN_ALLOWS: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14],
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 11],
  [0, 1, 2, 3, 5, 8, 10],
  [0, 1, 3, 7],
  [0, 1, 4],
  [0, 3],
  [0],
  [],
]

/** viewer → read private-document: denied on main, allowed on pr-142. */
const CHANGED = { row: 6, col: 8 }

const allowedOnMain = (row: number, col: number) => MAIN_ALLOWS[row].includes(col)
const isChanged = (row: number, col: number) => row === CHANGED.row && col === CHANGED.col

const CELLS = Array.from({ length: COLS * ROWS }, (_, i) => ({
  col: Math.floor(i / ROWS),
  row: i % ROWS,
}))

/** A label in the terminal's face, sized per breakpoint in viewBox units. */
function Mono({
  x,
  y,
  fill,
  size,
  anchor = 'start',
  children,
}: {
  x: number
  y: number
  fill: string
  size: Record<string, number>
  anchor?: 'start' | 'end'
  children: ReactNode
}) {
  return (
    <Box
      component="text"
      data-part="label"
      x={x}
      y={y}
      textAnchor={anchor}
      fill={fill}
      sx={{ fontFamily: MONO_FONT, fontSize: size }}
    >
      {children}
    </Box>
  )
}

/** A decision word in the display face. */
function Word({
  x,
  y,
  fill,
  anchor = 'start',
  children,
}: {
  x: number
  y: number
  fill: string
  anchor?: 'start' | 'end'
  children: string
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fill={fill}
      style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 64, letterSpacing: '0.07em' }}
    >
      {children}
    </text>
  )
}

/** The figure that holds a graphic and watches for it coming into view. */
function Figure({
  label,
  viewBox,
  maxWidth,
  playMs,
  motion,
  children,
}: {
  label: string
  viewBox: string
  maxWidth: number | Record<string, number>
  playMs: number
  /** The figure's styles per phase: what is hidden while armed, what plays. */
  motion: (phase: RunPhase) => object
  children: ReactNode
}) {
  const { ref, phase } = useArrivalPhase<HTMLElement>(THRESHOLD, playMs)
  return (
    <Box ref={ref} component="figure" sx={{ m: 0, width: '100%', maxWidth }}>
      <Box
        component="svg"
        viewBox={viewBox}
        role="img"
        aria-label={label}
        sx={{
          display: 'block',
          width: '100%',
          height: 'auto',
          overflow: 'visible',
          // Parts that scale or slip do so about their own box.
          '& [data-part]': { transformBox: 'fill-box', transformOrigin: 'center' },
          ...motion(phase),
          [REDUCED_MOTION]: {
            '& [data-part]': {
              animation: 'none !important',
              opacity: 1,
              clipPath: 'none',
              transform: 'none',
            },
          },
        }}
      >
        {/* The label names the whole figure; its own text is not read again. */}
        <g aria-hidden="true">{children}</g>
      </Box>
    </Box>
  )
}

/** One part's entrance: `delay` in ms, or a CSS value such as a variable. */
const play = (frames: string, ms: number, delay: number | string) =>
  `${frames} ${ms}ms ${motionEasing.decel} ${typeof delay === 'number' ? `${delay}ms` : delay} both`

/** A per-element delay, read by a part's animation as `var(--d)`. */
const delayVar = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

// The access grid's geometry, in its 1200 x 560 viewBox.
const CELL = 38
const PITCH = 44
const GRID_X = 28
const GRID_Y = 100
const LOUPE = { x: 826, y: 100, size: 346 }
const LOUPE_GAP = 16
const LABEL = { xs: 38, sm: 28 }

const cellX = (col: number) => GRID_X + col * PITCH
const cellY = (row: number) => GRID_Y + row * PITCH
/** The top-left half of a cell: main's decision. */
const mainHalf = (x: number, y: number) => `M${x} ${y}h${CELL}L${x} ${y + CELL}z`
/** The bottom-right half of a cell: pr-142's decision. */
const headHalf = (x: number, y: number) => `M${x + CELL} ${y}v${CELL}H${x}z`

/**
 * Many cells as one path, so the grid costs a few elements rather than one
 * per check: `shape` draws a cell at its origin.
 */
const cellsPath = (
  cells: { col: number; row: number }[],
  shape: (x: number, y: number) => string,
  x: (col: number) => number,
  y: (row: number) => number,
) => cells.map(({ col, row }) => shape(x(col), y(row))).join('')

/** When the navy band's figure's parts arrive, in ms. */
const GRID_TIMING = {
  column: 15,
  head: 350,
  flip: 620,
  rays: 900,
  loupe: 1050,
  slip: 1300,
  labels: 1350,
  done: 1600,
}

/**
 * The navy band's figure: the 128 checks and the loupe on the one that
 * changed. It plays in the order the product works: main's decisions land a
 * column at a time, pr-142's run wipes across them, the one split square
 * turns pink as the wipe passes it, and the loupe draws out and slips apart.
 */
export function AccessGrid() {
  const palette = useTheme().vars.palette
  const band = palette.bands.navy
  const cyan = palette.primary.main
  const pink = palette.secondary.main
  const ink = palette.flood.ink
  const decision = (allowed: boolean) => (allowed ? cyan : ink)

  const cx = cellX(CHANGED.col)
  const cy = cellY(CHANGED.row)
  const { x: lx, y: ly, size: ls } = LOUPE
  const t = GRID_TIMING

  const motion = (phase: RunPhase) => ({
    ...(phase === 'armed' && { '& [data-part]': { opacity: 0 } }),
    ...(phase === 'playing' && {
      '& [data-part="main"]': { animation: play(glyphIn, 160, 'var(--d)') },
      '& [data-part="head"]': { animation: play(wipeIn, 600, t.head) },
      '& [data-part="flip"]': { animation: play(nodeIn, 180, t.flip) },
      '& [data-part="rays"]': { animation: play(drawLine, 300, t.rays) },
      '& [data-part="loupe"]': { animation: play(wipeIn, 350, t.loupe) },
      '& [data-part="slip"]': { animation: play(slipIn, 200, t.slip) },
      '& [data-part="label"]': { animation: play(lineIn, 150, t.labels) },
    }),
  })

  return (
    <Figure
      label="All 128 prepared permission checks drawn as a grid, each square made of its decision on main and on pr-142. Where both versions agree the halves fuse into one square. The one check that changed, viewer read private-document, splits apart: denied on main, allowed on pr-142."
      viewBox="0 0 1200 560"
      maxWidth={{ xs: 720, xl: 900 }}
      playMs={t.done + 60}
      motion={motion}
    >
      {/* The loupe's rays, under the grid, so among the squares they show
          only in the gutters. */}
      <Box
        component="path"
        data-part="rays"
        d={`M${cx + CELL} ${cy}L${lx} ${ly}M${cx + CELL} ${cy + CELL}L${lx} ${ly + ls}`}
        pathLength={1}
        stroke={pink}
        strokeWidth={3}
        fill="none"
        sx={{ strokeDasharray: 1 }}
      />

      {/* main's run: the top-left half of every check, a column at a time. */}
      {Array.from({ length: COLS }, (_, col) => {
        const column = CELLS.filter((cell) => cell.col === col)
        return (
          <Box key={col} component="g" data-part="main" style={delayVar(col * t.column)}>
            {[true, false].map((allowed) => (
              <path
                key={String(allowed)}
                d={cellsPath(
                  column.filter(({ row }) => allowedOnMain(row, col) === allowed),
                  mainHalf,
                  cellX,
                  cellY,
                )}
                fill={decision(allowed)}
              />
            ))}
          </Box>
        )
      })}

      {/* pr-142's run: the bottom-right halves, the same as main's except the
          one that changed, which is drawn on its own. */}
      <Box component="g" data-part="head">
        {[true, false].map((allowed) => (
          <path
            key={String(allowed)}
            d={cellsPath(
              CELLS.filter(
                ({ col, row }) => !isChanged(row, col) && allowedOnMain(row, col) === allowed,
              ),
              headHalf,
              cellX,
              cellY,
            )}
            fill={decision(allowed)}
          />
        ))}
      </Box>
      <Box component="path" data-part="flip" d={headHalf(cx, cy)} fill={pink} />

      {/* The loupe: the changed check, slipped apart along its diagonal. */}
      <Box component="g" data-part="loupe">
        <path d={`M${lx} ${ly}h${ls - LOUPE_GAP}L${lx} ${ly + ls - LOUPE_GAP}z`} fill={ink} />
        <Box component="g" data-part="slip">
          <path d={`M${lx + ls} ${ly + LOUPE_GAP}V${ly + ls}H${lx + LOUPE_GAP}z`} fill={pink} />
        </Box>
        <Mono x={lx + 26} y={ly + 64} fill={band.inkMuted} size={LABEL}>
          main
        </Mono>
        <Word x={lx + 24} y={ly + 132} fill={band.ink}>
          DENY
        </Word>
        <Mono x={lx + ls - 26} y={ly + ls - 92} fill={ink} size={LABEL} anchor="end">
          pr-142
        </Mono>
        <Word x={lx + ls - 24} y={ly + ls - 24} fill={palette.secondary.contrastText} anchor="end">
          ALLOW
        </Word>
      </Box>

      <Mono x={GRID_X} y={64} fill={band.inkMuted} size={LABEL}>
        128 prepared checks
      </Mono>
      <Mono x={lx + ls} y={64} fill={palette.secondary.light} size={LABEL} anchor="end">
        1 changed
      </Mono>
      <Mono x={GRID_X} y={512} fill={band.ink} size={LABEL}>
        viewer → read private-document
      </Mono>
      <Mono x={lx + ls} y={512} fill={palette.secondary.light} size={LABEL} anchor="end">
        VIOLATION
      </Mono>
    </Figure>
  )
}

// The closing band's grid, in its own viewBox.
const RUN_CELL = 26
const RUN_PITCH = 32
const RUN_X = 24
const RUN_Y = 56
const RUN_LABEL = { xs: 20, md: 22, lg: 18 }
const RUN_WIDTH = RUN_X * 2 + (COLS - 1) * RUN_PITCH + RUN_CELL
const RUN_HEIGHT = RUN_Y + (ROWS - 1) * RUN_PITCH + RUN_CELL + 58

/** When the closing band's figure's parts arrive, in ms. */
const RUN_TIMING = { sweep: 150, sweepMs: 900, flip: 950, labels: 1150, done: 1310 }

/**
 * The closing band's figure: your next PR's 128 checks, open squares until
 * the run sweeps across them. Denied checks fill with ink, allowed ones stay
 * open with an ink edge, and the one that changed lands in the deeper pink,
 * which holds its contrast on the cyan. Drawn in
 * the flood's ink, so it reads on the cyan in both schemes.
 */
export function RunGrid() {
  const palette = useTheme().vars.palette
  const flood = palette.flood
  const t = RUN_TIMING

  const motion = (phase: RunPhase) => ({
    ...(phase === 'armed' && { '& [data-part]': { opacity: 0 } }),
    ...(phase === 'playing' && {
      '& [data-part="run"]': { animation: play(wipeIn, t.sweepMs, t.sweep) },
      '& [data-part="flip"]': { animation: play(nodeIn, 220, t.flip) },
      '& [data-part="label"]': { animation: play(lineIn, 160, t.labels) },
    }),
  })

  const at = (col: number, row: number, inset = 0) => ({
    x: RUN_X + col * RUN_PITCH + inset,
    y: RUN_Y + row * RUN_PITCH + inset,
    width: RUN_CELL - inset * 2,
    height: RUN_CELL - inset * 2,
  })
  const runX = (col: number) => RUN_X + col * RUN_PITCH
  const runY = (row: number) => RUN_Y + row * RUN_PITCH
  // An open square's outline, drawn on the stroke's centre line.
  const outline = (x: number, y: number) =>
    `M${x + 1} ${y + 1}h${RUN_CELL - 2}v${RUN_CELL - 2}h${2 - RUN_CELL}z`
  const solid = (x: number, y: number) => `M${x} ${y}h${RUN_CELL}v${RUN_CELL}h${-RUN_CELL}z`
  const unchanged = CELLS.filter(({ col, row }) => !isChanged(row, col))

  return (
    <Figure
      label="Your next PR's 128 prepared checks, run against main: the run fills them in, and the one decision that changed is marked in pink."
      viewBox={`0 0 ${RUN_WIDTH} ${RUN_HEIGHT}`}
      maxWidth={{ xs: 520, xl: 640 }}
      playMs={t.done + 60}
      motion={motion}
    >
      <Mono x={RUN_X} y={34} fill={flood.ink} size={RUN_LABEL}>
        your next PR
      </Mono>
      {/* Before the run: every check an open square. */}
      <path d={cellsPath(CELLS, outline, runX, runY)} fill="none" stroke={flood.line} strokeWidth={2} />
      {/* The run, swept across: denied checks solid, allowed ones edged. */}
      <Box component="g" data-part="run">
        <path
          d={cellsPath(
            unchanged.filter(({ col, row }) => !allowedOnMain(row, col)),
            solid,
            runX,
            runY,
          )}
          fill={flood.ink}
        />
        <path
          d={cellsPath(
            unchanged.filter(({ col, row }) => allowedOnMain(row, col)),
            outline,
            runX,
            runY,
          )}
          fill="none"
          stroke={flood.ink}
          strokeWidth={2}
        />
      </Box>
      <Box
        component="rect"
        data-part="flip"
        {...at(CHANGED.col, CHANGED.row, -3)}
        // The deeper pink: 4:1 on the cyan, where full-strength pink is 2.5:1.
        fill={palette.secondary.dark}
        stroke={flood.ink}
        strokeWidth={3}
      />
      <Mono x={RUN_X} y={RUN_HEIGHT - 12} fill={flood.inkMuted} size={RUN_LABEL}>
        128 checks, 1 changed
      </Mono>
    </Figure>
  )
}

/**
 * A run picker option's icon: its outcome as a 3 x 3 grid of checks in the
 * option's current colour, told apart by shape rather than shade so every
 * mark keeps the colour's full contrast. Changed: open squares with the one
 * that changed filled. Unchanged: all nine filled. Incomplete: all filled
 * but one left open. The cells pop in as the option is chosen (see
 * RunPicker).
 */
export function OutcomeGlyph({ outcome }: { outcome: 'changed' | 'unchanged' | 'incomplete' }) {
  const size = 5
  const pitch = 7.5
  return (
    <Box
      component="svg"
      data-glyph
      aria-hidden
      viewBox="0 0 20 20"
      sx={{ display: 'block', width: 20, height: 20, flexShrink: 0 }}
    >
      {Array.from({ length: 9 }, (_, i) => {
        const x = (i % 3) * pitch
        const y = Math.floor(i / 3) * pitch
        const special = i === 5
        const open = outcome === 'changed' ? !special : outcome === 'incomplete' && special
        return (
          <Box
            key={i}
            component="rect"
            data-cell
            x={open ? x + 0.75 : x}
            y={open ? y + 0.75 : y}
            width={open ? size - 1.5 : size}
            height={open ? size - 1.5 : size}
            fill={open ? 'none' : 'currentColor'}
            stroke={open ? 'currentColor' : 'none'}
            strokeWidth={open ? 1.5 : 0}
            style={delayVar(i * 25)}
          />
        )
      })}
    </Box>
  )
}
