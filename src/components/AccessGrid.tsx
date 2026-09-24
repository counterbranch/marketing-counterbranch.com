import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import type { SxProps, Theme } from '@mui/material/styles'
import type { CSSProperties, ReactNode } from 'react'
import { MONO_FONT } from './DiffVersusRun.tsx'
import { displayFont } from '../theme.ts'
import type { BandPalette } from '../theme.ts'
import { useArrivalPhase } from '../hooks/useArrivalPhase.ts'
import {
  drawLine,
  glyphIn,
  lineIn,
  nodeIn,
  play,
  stampIn,
  sweepAcross,
  wipeIn,
  type RunPhase,
} from '../motion.ts'

/**
 * The access grid: the page's running example drawn as data. All 128
 * prepared checks are squares, one per check, in rows from the most
 * privileged role down to viewer: allowed checks are filled cyan, denied
 * ones are open outlines, so what is allowed steps down from the top left.
 * The one check that changed is filled pink and ringed. A callout leads
 * from it to the two decisions, DENY on main and ALLOW on pr-142, and the
 * verdict.
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

/**
 * viewer → read private-document: denied on main, allowed on pr-142. In the
 * grid's last column, so the callout leads straight out of the grid.
 */
const CHANGED = { row: 6, col: 15 }

const allowedOnMain = (row: number, col: number) => MAIN_ALLOWS[row].includes(col)
const isChanged = (row: number, col: number) => row === CHANGED.row && col === CHANGED.col

const CELLS = Array.from({ length: COLS * ROWS }, (_, i) => ({
  col: Math.floor(i / ROWS),
  row: i % ROWS,
}))

/** Stroke of an open square, a ring and the callout's lines. */
const STROKE = 3

/** Parts left out on phones, where the figure is too small to read them. */
const PHONE_HIDDEN = { display: { xs: 'none', sm: 'inline' } } as const

/** A label in the terminal's face, sized per breakpoint in viewBox units. */
function Mono({
  x,
  y,
  fill,
  size,
  anchor = 'start',
  bold = false,
  sx,
  children,
}: {
  x: number
  y: number
  fill: string
  size: Record<string, number>
  anchor?: 'start' | 'end'
  bold?: boolean
  /** Further styles, such as hiding the label at a breakpoint. */
  sx?: SxProps<Theme>
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
      sx={[{ fontFamily: MONO_FONT, fontSize: size, ...(bold && { fontWeight: 700 }) }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {children}
    </Box>
  )
}

/** A decision word in the display face, sized per breakpoint in viewBox units. */
function Word({
  x,
  y,
  fill,
  size,
  anchor = 'start',
  spacing = '0.07em',
  children,
}: {
  x: number
  y: number
  fill: string
  size: Record<string, number>
  anchor?: 'start' | 'middle'
  /** Letter-spacing, wider for a word set small on a plate. */
  spacing?: string
  children: string
}) {
  return (
    <Box
      component="text"
      data-part="label"
      x={x}
      y={y}
      textAnchor={anchor}
      fill={fill}
      sx={{ fontFamily: displayFont, fontWeight: 700, fontSize: size, letterSpacing: spacing }}
    >
      {children}
    </Box>
  )
}

/**
 * A decision's mark: a filled square with a cross (denied) or a tick
 * (allowed) in the square's own ink, centred on (x, y).
 */
function Badge({
  x,
  y,
  size,
  fill,
  ink,
  allowed,
}: {
  x: number
  y: number
  size: number
  fill: string
  ink: string
  allowed: boolean
}) {
  const r = size * 0.22
  return (
    <Box component="g" data-part="badge" style={{ transform: 'none' }}>
      <rect x={x - size / 2} y={y - size / 2} width={size} height={size} fill={fill} />
      <path
        d={
          allowed
            ? `M${x - r} ${y}l${r * 0.75} ${r * 0.75}L${x + r} ${y - r * 0.75}`
            : `M${x - r} ${y - r}L${x + r} ${y + r}M${x + r} ${y - r}L${x - r} ${y + r}`
        }
        fill="none"
        stroke={ink}
        strokeWidth={STROKE}
      />
    </Box>
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
  maxWidth: number | Record<string, number | string>
  playMs: number
  /** The figure's styles per phase: what is hidden while armed, what plays. */
  motion: (phase: RunPhase) => object
  children: ReactNode
}) {
  const { ref, phase } = useArrivalPhase<HTMLElement>(THRESHOLD, playMs)
  return (
    // A plain box: the svg below carries the figure's name.
    <Box ref={ref} sx={{ width: '100%', maxWidth }}>
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
          // Parts that scale do so about their own box.
          '& [data-part]': { transformBox: 'fill-box', transformOrigin: 'center' },
          ...motion(phase),
          [REDUCED_MOTION]: {
            '& [data-part]': {
              animation: 'none !important',
              opacity: 1,
              clipPath: 'none',
              transform: 'none',
            },
            // The run's scan line only exists while the run plays.
            '& [data-scan]': { display: 'none' },
          },
        }}
      >
        {/* The label names the whole figure; its own text is not read again. */}
        <g aria-hidden="true">{children}</g>
      </Box>
    </Box>
  )
}


/** A per-element delay, read by a part's animation as `var(--d)`. */
const delayVar = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

/** A filled square at its origin. */
const solid = (cell: number) => (x: number, y: number) => `M${x} ${y}h${cell}v${cell}h${-cell}z`
/** An open square's outline, drawn on the stroke's centre line. */
const openSquare = (cell: number) => (x: number, y: number) => {
  const inset = STROKE / 2
  const side = cell - STROKE
  return `M${x + inset} ${y + inset}h${side}v${side}h${-side}z`
}

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

/**
 * The one check that changed, drawn over its open square: filled pink, the
 * page's colour for a decision that changed, and ringed in the band's ink so
 * it is found first. The two decisions themselves live in the callout.
 */
function ChangedCell({
  x,
  y,
  cell,
  band,
  pink,
}: {
  x: number
  y: number
  cell: number
  band: BandPalette
  pink: string
}) {
  const gap = cell * 0.16
  return (
    <Box component="g" data-part="flip">
      <path d={solid(cell)(x, y)} fill={pink} />
      <rect
        x={x - gap}
        y={y - gap}
        width={cell + gap * 2}
        height={cell + gap * 2}
        fill="none"
        stroke={band.ink}
        strokeWidth={STROKE}
      />
    </Box>
  )
}

// The access grid's geometry, in its 1200 x 560 viewBox.
const CELL = 38
const PITCH = 44
const GRID_X = 28
const GRID_Y = 100
const GRID_WIDTH = (COLS - 1) * PITCH + CELL
const GRID_HEIGHT = (ROWS - 1) * PITCH + CELL
const LABEL = { xs: 34, sm: 24 }
const WORD = { xs: 56, sm: 44 }
const PLATE_WORD = { xs: 28 }

/**
 * The figure's frame: the grid's left edge, the label cap-tops, the right
 * edge the counter label sits on, and just under the plate. The viewBox is
 * cut to it, so the figure has no dead margin against its column.
 */
const FRAME = { left: GRID_X, top: 32, right: 1190, bottom: 550 }

const cellX = (col: number) => GRID_X + col * PITCH
const cellY = (row: number) => GRID_Y + row * PITCH

/**
 * The callout, to the right of the grid: a leader from the changed square
 * to a node, and from the node an elbow up to main's decision and one down
 * to pr-142's. The check's name sits over the rows and the verdict under.
 */
const CALLOUT = {
  node: 800,
  nodeSize: 12,
  rowGap: 70,
  badge: 34,
  badgeX: 849,
  /** The callout's one left edge: the badges', the check name's and the plate's. */
  left: 832,
  textX: 882,
  wordX: 1016,
  /** The frame's right edge, which the plate runs to. */
  right: FRAME.right,
  plate: { width: FRAME.right - 832, height: 44 },
}

/** When the navy band's figure's parts arrive, in ms. */
const GRID_TIMING = {
  column: 15,
  scan: 400,
  scanMs: 650,
  flip: 1040,
  leader: 1140,
  node: 1320,
  branches: 1350,
  badges: 1600,
  labels: 1650,
  plate: 1800,
  done: 2050,
}

/**
 * The navy band's figure: the 128 checks and the callout on the one that
 * changed. It plays in the order the product works: main's decisions land a
 * column at a time, pr-142's run scans across them, the one check that
 * changed fills pink and is ringed, and the callout draws out to its
 * decisions.
 */
export function AccessGrid() {
  const palette = useTheme().vars.palette
  const band = palette.bands.navy
  const cyan = palette.primary.main
  const pink = palette.secondary.main
  const t = GRID_TIMING
  const c = CALLOUT

  const cx = cellX(CHANGED.col)
  const cy = cellY(CHANGED.row) + CELL / 2
  // The ring's stroke is centred on its path, so its outer edge is half a
  // stroke beyond it.
  const ringEdge = cx + CELL + CELL * 0.16 + STROKE / 2
  const topY = cy - c.rowGap
  const bottomY = cy + c.rowGap
  const plateY = bottomY + c.badge / 2 + 30

  const motion = (phase: RunPhase) => ({
    ...(phase === 'armed' && { '& [data-part]': { opacity: 0 } }),
    ...(phase === 'playing' && {
      '& [data-part="main"]': { animation: play(glyphIn, 160, 'var(--d)') },
      // The scan crosses the grid at one speed, so the flip lands as it passes.
      '& [data-scan]': { animation: play(sweepAcross, t.scanMs, t.scan, 'linear') },
      '& [data-part="flip"]': { animation: play(nodeIn, 200, t.flip) },
      '& [data-part="leader"]': { animation: play(drawLine, 220, t.leader) },
      '& [data-part="node"]': { animation: play(nodeIn, 160, t.node) },
      '& [data-part="branch"]': { animation: play(drawLine, 280, t.branches) },
      '& [data-part="badge"]': { animation: play(nodeIn, 200, t.badges) },
      '& [data-part="label"]': { animation: play(lineIn, 160, t.labels) },
      '& [data-part="plate"]': { animation: play(stampIn, 220, t.plate) },
    }),
  })

  return (
    <Figure
      label="All 128 prepared permission checks drawn as a grid: allowed checks filled, denied ones open. The one check that changed, viewer read private-document, is filled pink and ringed, and a callout leads from it to its two decisions: denied on main, allowed on pr-142. Verdict: violation."
      viewBox={`${FRAME.left} ${FRAME.top} ${FRAME.right - FRAME.left} ${FRAME.bottom - FRAME.top}`}
      maxWidth={{ xs: 720, lg: 'none' }}
      playMs={t.done + 60}
      motion={motion}
    >
      {/* main's run: a column at a time, allowed checks filled, denied open. */}
      {Array.from({ length: COLS }, (_, col) => {
        const column = CELLS.filter((cell) => cell.col === col)
        return (
          <Box key={col} component="g" data-part="main" style={delayVar(col * t.column)}>
            <path
              d={cellsPath(column.filter(({ row }) => allowedOnMain(row, col)), solid(CELL), cellX, cellY)}
              fill={cyan}
            />
            <path
              d={cellsPath(column.filter(({ row }) => !allowedOnMain(row, col)), openSquare(CELL), cellX, cellY)}
              fill="none"
              stroke={band.line}
              strokeWidth={STROKE}
            />
          </Box>
        )
      })}

      {/* pr-142's run: a scan line across the grid, then the one check that
          changed fills pink where it passed. */}
      <Box
        component="rect"
        data-scan
        x={GRID_X}
        y={GRID_Y - 8}
        width={STROKE}
        height={GRID_HEIGHT + 16}
        fill={cyan}
        style={{ '--sweep': `${GRID_WIDTH - STROKE}px` } as CSSProperties}
        sx={{ opacity: 0 }}
      />
      <ChangedCell x={cx} y={cellY(CHANGED.row)} cell={CELL} band={band} pink={pink} />

      {/* The callout. */}
      <Box
        component="path"
        data-part="leader"
        d={`M${ringEdge} ${cy}H${c.node}`}
        pathLength={1}
        stroke={band.ink}
        strokeWidth={STROKE}
        fill="none"
        sx={{ strokeDasharray: 1 }}
      />
      <Box
        component="rect"
        data-part="node"
        x={c.node - c.nodeSize / 2}
        y={cy - c.nodeSize / 2}
        width={c.nodeSize}
        height={c.nodeSize}
        fill={band.ink}
      />
      {[topY, bottomY].map((rowY) => (
        <Box
          key={rowY}
          component="path"
          data-part="branch"
          d={`M${c.node} ${cy}V${rowY}H${c.badgeX - c.badge / 2}`}
          pathLength={1}
          stroke={band.ink}
          strokeWidth={STROKE}
          strokeLinejoin="miter"
          fill="none"
          sx={{ strokeDasharray: 1 }}
        />
      ))}
      <Badge x={c.badgeX} y={topY} size={c.badge} fill={pink} ink={palette.secondary.contrastText} allowed={false} />
      <Badge x={c.badgeX} y={bottomY} size={c.badge} fill={cyan} ink={palette.primary.contrastText} allowed />
      <Mono x={c.textX} y={topY + 8} fill={band.inkMuted} size={LABEL}>
        main
      </Mono>
      <Word x={c.wordX} y={topY + 16} fill={pink} size={WORD}>
        DENY
      </Word>
      <Mono x={c.textX} y={bottomY + 8} fill={band.inkMuted} size={LABEL}>
        pr-142
      </Mono>
      <Word x={c.wordX} y={bottomY + 16} fill={cyan} size={WORD}>
        ALLOW
      </Word>
      {/* The check's name and the verdict are left out on phones, where
          Counterbranch's comment in the exhibit beneath carries both. */}
      <Mono x={c.left} y={topY - c.badge / 2 - 58} fill={band.ink} size={LABEL} bold sx={PHONE_HIDDEN}>
        viewer → read
      </Mono>
      <Mono x={c.left} y={topY - c.badge / 2 - 26} fill={band.ink} size={LABEL} bold sx={PHONE_HIDDEN}>
        private-document
      </Mono>
      <Box component="g" data-part="plate" sx={PHONE_HIDDEN}>
        <rect x={c.left} y={plateY} width={c.plate.width} height={c.plate.height} fill={pink} />
        <Word
          x={c.left + c.plate.width / 2}
          y={plateY + c.plate.height / 2 + 9}
          fill={palette.secondary.contrastText}
          size={PLATE_WORD}
          anchor="middle"
          spacing="0.1em"
        >
          VIOLATION
        </Word>
      </Box>

      <Mono x={GRID_X} y={64} fill={band.inkMuted} size={LABEL}>
        128 prepared checks
      </Mono>
      <Mono x={c.right} y={64} fill={palette.secondary.light} size={LABEL} anchor="end">
        1 changed
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
const RUN_TIMING = { sweep: 150, sweepMs: 900, flip: 1060, labels: 1230, done: 1400 }

/**
 * The closing band's figure: your next PR's 128 checks, open squares until
 * the run sweeps across them and fills the allowed ones, and the one that
 * changed fills pink and is ringed. Drawn with the navy band's inks: the
 * closing band sets it on a navy plate.
 */
export function RunGrid() {
  const palette = useTheme().vars.palette
  const band = palette.bands.navy
  const cyan = palette.primary.main
  const pink = palette.secondary.main
  const t = RUN_TIMING

  const motion = (phase: RunPhase) => ({
    ...(phase === 'armed' && { '& [data-part]': { opacity: 0 } }),
    ...(phase === 'playing' && {
      '& [data-part="run"]': { animation: play(wipeIn, t.sweepMs, t.sweep, 'linear') },
      '& [data-part="flip"]': { animation: play(nodeIn, 220, t.flip) },
      '& [data-part="label"]': { animation: play(lineIn, 160, t.labels) },
    }),
  })

  const runX = (col: number) => RUN_X + col * RUN_PITCH
  const runY = (row: number) => RUN_Y + row * RUN_PITCH
  const unchanged = CELLS.filter(({ col, row }) => !isChanged(row, col))

  return (
    <Figure
      label="Your next PR's 128 prepared checks, run against main: the run fills in the allowed ones, and the one decision that changed is filled pink and ringed."
      viewBox={`0 0 ${RUN_WIDTH} ${RUN_HEIGHT}`}
      maxWidth={{ xs: 520, xl: 640 }}
      playMs={t.done + 60}
      motion={motion}
    >
      <Mono x={RUN_X} y={34} fill={band.inkMuted} size={RUN_LABEL}>
        your next PR
      </Mono>
      {/* Before the run: every check an open square. */}
      <path
        d={cellsPath(CELLS, openSquare(RUN_CELL), runX, runY)}
        fill="none"
        stroke={band.line}
        strokeWidth={STROKE}
      />
      {/* The run, swept across: allowed checks fill. */}
      <Box component="g" data-part="run">
        <path
          d={cellsPath(
            unchanged.filter(({ col, row }) => allowedOnMain(row, col)),
            solid(RUN_CELL),
            runX,
            runY,
          )}
          fill={cyan}
        />
      </Box>
      <ChangedCell x={runX(CHANGED.col)} y={runY(CHANGED.row)} cell={RUN_CELL} band={band} pink={pink} />
      <Mono x={RUN_X} y={RUN_HEIGHT - 12} fill={band.inkMuted} size={RUN_LABEL}>
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
