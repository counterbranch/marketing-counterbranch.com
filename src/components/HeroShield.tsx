import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import type { CSSProperties } from 'react'
import { MONO_FONT } from './DiffVersusRun.tsx'
import { displayFont } from '../theme.ts'
import { drawLine, glyphIn, heroSequence, motionEasing, nodeIn, stampIn, sweepAcross } from '../motion.ts'

/**
 * The hero's figure: the shield from the logo, built from access decisions.
 * Every square is one check: filled where it is allowed, open where it is
 * denied, so what is allowed steps down from the top left as it does in the
 * page's access grid. A run sweeps across it, one denied decision comes back
 * allowed, turns pink, and a callout carries it out through the shield's
 * open lower corner: the unintended access change, caught.
 *
 * Drawn in the hero's own ink, so it follows the scheme through CSS
 * variables: dark on the cyan flood, light on the dark hero. It draws itself
 * once as the page loads, after the headline, with CSS alone, so the
 * prerendered page plays it before any JavaScript arrives. With reduced
 * motion it is simply there. The example is illustrative, like the page's
 * others.
 */

const COLS = 11
const ROWS = 12
const PITCH = 40
const CELL = 30
const STROKE = 3

/**
 * The shield starts at the viewBox's left edge, so its first column sits on
 * the page grid; the callout needs room past its right edge.
 */
const SHIELD_WIDTH = (COLS - 1) * PITCH + CELL
const CALLOUT_ROOM = 220

/** The callout plate: out past the shield's tapered lower right. */
const PLATE = { width: 348, height: 80 }

/**
 * The shield's outline on the grid: square shoulders with their corners
 * taken off, straight sides, and a point, as in the logo. Returns the first
 * and last column of each row.
 */
function span(row: number): [number, number] | null {
  if (row === 0) return [1, COLS - 2]
  if (row <= 6) return [0, COLS - 1]
  const inset = row - 6
  const first = inset
  const last = COLS - 1 - inset
  return first <= last ? [first, last] : null
}

/** Allowed decisions step down from the top left: more privileged rows allow more. */
const allowed = (row: number, col: number) => col < COLS - row

/**
 * The one decision that changed: denied on main, allowed on the pull request.
 * The last square of its row, on the shield's tapering edge, so the callout
 * can leave it without crossing another.
 */
const CHANGED = { row: 8, col: 8 }

const CELLS = Array.from({ length: ROWS }, (_, row) => {
  const range = span(row)
  if (!range) return []
  const out: { row: number; col: number }[] = []
  for (let col = range[0]; col <= range[1]; col += 1) out.push({ row, col })
  return out
}).flat()

const CHECKS = CELLS.length

const x = (col: number) => col * PITCH
const y = (row: number) => row * PITCH

const PLATE_X = x(7) - 4
const PLATE_Y = y(10) - 4

const WIDTH = Math.max(SHIELD_WIDTH + CALLOUT_ROOM, PLATE_X + PLATE.width + STROKE)
const HEIGHT = Math.max((ROWS - 1) * PITCH + CELL, PLATE_Y + PLATE.height + STROKE)

/** The shield's part of the hero's entrance (heroSequence in motion.ts). */
const T = heroSequence

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'

const arrive = (frames: string, ms: number, delay: number, easing: string = motionEasing.decel) => ({
  animation: `${frames} ${ms}ms ${easing} ${delay}ms both`,
  [REDUCED_MOTION]: { animation: 'none' },
})

/** A row of squares as one path, filled or open. */
function rowPath(cells: { row: number; col: number }[], open: boolean) {
  return cells
    .map(({ row, col }) => {
      if (!open) return `M${x(col)} ${y(row)}h${CELL}v${CELL}h${-CELL}z`
      const inset = STROKE / 2
      const side = CELL - STROKE
      return `M${x(col) + inset} ${y(row) + inset}h${side}v${side}h${-side}z`
    })
    .join('')
}

export default function HeroShield() {
  const theme = useTheme()
  const hero = theme.vars.palette.hero
  const ink = hero.ink
  const pink = theme.vars.palette.secondary.main
  const pinkInk = theme.vars.palette.secondary.contrastText

  const cx = x(CHANGED.col)
  const cy = y(CHANGED.row)
  const ring = CELL * 0.2
  // The callout leaves the changed square to the right, turns down into the
  // room the shield's point leaves, and ends on a plate that hangs past the
  // shield's edge.
  const leaderY = cy + CELL / 2
  const leaderX = cx + CELL + ring + STROKE / 2
  const plate = { x: PLATE_X, y: PLATE_Y, ...PLATE }
  const drop = leaderX + 28

  return (
    <Box
      component="svg"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={`A shield made of ${CHECKS} access checks: allowed ones filled, denied ones open. After a run of the pull request, one denied check, viewer read, comes back allowed. It turns pink and is called out as an access change.`}
      sx={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible' }}
    >
      <g aria-hidden="true">
        {/* main's decisions, a row at a time from the top. */}
        {Array.from({ length: ROWS }, (_, row) => {
          const cells = CELLS.filter((c) => c.row === row && !(c.row === CHANGED.row && c.col === CHANGED.col))
          if (!cells.length) return null
          return (
            <Box key={row} component="g" sx={arrive(glyphIn, 200, T.shield + row * T.rowStep)}>
              <path d={rowPath(cells.filter((c) => allowed(c.row, c.col)), false)} fill={ink} />
              <path
                d={rowPath([...cells.filter((c) => !allowed(c.row, c.col))], true)}
                fill="none"
                stroke={ink}
                strokeWidth={STROKE}
              />
            </Box>
          )
        })}
        {/* The changed decision's square as it was on main: denied, open. */}
        <Box
          component="path"
          d={rowPath([CHANGED], true)}
          fill="none"
          stroke={ink}
          strokeWidth={STROKE}
          sx={arrive(glyphIn, 200, T.shield + CHANGED.row * T.rowStep)}
        />

        {/* The pull request's run, sweeping across. */}
        <Box
          component="rect"
          x={-8}
          y={-10}
          width={STROKE + 1}
          height={(ROWS - 1) * PITCH + CELL + 20}
          fill={ink}
          style={{ '--sweep': `${(COLS - 1) * PITCH + CELL + 16}px` } as CSSProperties}
          sx={{
            opacity: 0,
            animation: `${sweepAcross} ${T.scanMs}ms linear ${T.scan}ms both`,
            [REDUCED_MOTION]: { display: 'none' },
          }}
        />

        {/* The one that changed: filled pink, ringed in ink. */}
        <Box component="g" sx={{ transformBox: 'fill-box', transformOrigin: 'center', ...arrive(nodeIn, 240, T.flip) }}>
          <rect x={cx} y={cy} width={CELL} height={CELL} fill={pink} />
          <rect
            x={cx - ring}
            y={cy - ring}
            width={CELL + ring * 2}
            height={CELL + ring * 2}
            fill="none"
            stroke={ink}
            strokeWidth={STROKE}
          />
        </Box>

        {/* Out through the open corner to the callout. */}
        <Box
          component="path"
          d={`M${leaderX} ${leaderY}H${drop}V${plate.y}`}
          pathLength={1}
          fill="none"
          stroke={ink}
          strokeWidth={STROKE}
          sx={{ strokeDasharray: 1, strokeDashoffset: 0, ...arrive(drawLine, 220, T.leader) }}
        />
        <Box
          component="g"
          sx={{ transformBox: 'fill-box', transformOrigin: 'center top', ...arrive(stampIn, 260, T.plate) }}
        >
          <rect x={plate.x} y={plate.y} width={plate.width} height={plate.height} fill={pink} stroke={ink} strokeWidth={STROKE} />
          <text
            x={plate.x + 18}
            y={plate.y + 32}
            fill={pinkInk}
            style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 26, letterSpacing: '0.1em' } as CSSProperties}
          >
            ACCESS CHANGED
          </text>
          <text x={plate.x + 18} y={plate.y + 62} fill={pinkInk} style={{ fontFamily: MONO_FONT, fontSize: 18 } as CSSProperties}>
            viewer → read   DENY → ALLOW
          </text>
        </Box>

      </g>
    </Box>
  )
}
