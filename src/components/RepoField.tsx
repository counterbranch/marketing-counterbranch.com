import { useId } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { MONO_FONT } from './DiffVersusRun.tsx'
import { field } from '../alphaResults.ts'
import { useArrivalPhase } from '../hooks/useArrivalPhase.ts'
import { glyphIn, nodeIn, play, sweepAcross, wipeIn } from '../motion.ts'

/**
 * The alpha campaign as one field: a square per repository, 10,000 in all.
 * Before the scan every square is faint; the scan sweeps across and fills
 * the repositories where discovery found access decisions (about half),
 * marks the few whose scan did not finish, and rings the handful where a bug
 * was confirmed by hand.
 *
 * The shares are measured. Where each square sits is illustrative, drawn from
 * a fixed seed so the server and the browser draw the same field.
 *
 * Ten thousand squares as elements, or as one path, would weigh more than the
 * rest of the page. So the faint squares are one tiled pattern, and the filled
 * ones are three tiled patterns of different sizes laid over each other: 13,
 * 17 and 19 squares across, so no repeat shows inside the field. The seed and
 * density are chosen so the three together fill 51% of the field in both
 * layouts. Only the unfinished and confirmed squares are drawn one by one.
 */

/** Share of the figure that must be on screen before the scan plays. */
const THRESHOLD = 0.35

/** Square pitch and size, in viewBox units. */
const PITCH = 10
const CELL = 7.5

/** Room around the field for the rings on its outer squares. */
const MARGIN = 16

/** The filled patterns' periods, in squares. Pairwise coprime. */
const PERIODS = [13, 17, 19] as const
const SEED = 291
const DENSITY = 0.212

/** When the scan's parts arrive, in ms. */
const TIMING = { scan: 100, scanMs: 1300, unfinished: 1300, confirmed: 1450, confirmedStep: 70, done: 2200 }

/** A small seeded generator (mulberry32), so every render draws the same field. */
function seeded(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Each filled pattern's squares, as positions inside its own tile. */
const TILES = (() => {
  const random = seeded(SEED)
  return PERIODS.map((period) => {
    const cells: { col: number; row: number }[] = []
    for (let i = 0; i < period * period; i += 1) {
      if (random() < DENSITY) cells.push({ col: i % period, row: Math.floor(i / period) })
    }
    return { period, cells, lookup: new Set(cells.map(({ col, row }) => row * period + col)) }
  })
})()

/** Whether the patterns fill the square at (col, row). */
const hasSites = (col: number, row: number) =>
  TILES.some(({ period, lookup }) => lookup.has((row % period) * period + (col % period)))

interface Layout {
  cols: number
  rows: number
  unfinished: { col: number; row: number }[]
  confirmed: { col: number; row: number }[]
}

/**
 * Where the individually drawn squares go in a field of this shape: the
 * unfinished ones anywhere, the confirmed ones on filled squares, one in each
 * of nine regions so they spread across the field, clear of its edges.
 */
function layout(cols: number, rows: number, seed: number): Layout {
  const random = seeded(seed)
  const pick = (from: number, span: number) => from + Math.floor(random() * span)
  const confirmed: Layout['confirmed'] = []
  for (let region = 0; region < field.confirmed; region += 1) {
    const regionCol = region % 3
    const regionRow = Math.floor(region / 3)
    const width = Math.floor(cols / 3)
    const height = Math.floor(rows / 3)
    for (;;) {
      const col = pick(regionCol * width + 2, width - 4)
      const row = pick(regionRow * height + 2, height - 4)
      if (hasSites(col, row)) {
        confirmed.push({ col, row })
        break
      }
    }
  }
  const taken = new Set(confirmed.map(({ col, row }) => row * cols + col))
  const unfinished: Layout['unfinished'] = []
  const count = Math.round(cols * rows * field.unfinished)
  while (unfinished.length < count) {
    const col = pick(0, cols)
    const row = pick(0, rows)
    const key = row * cols + col
    if (taken.has(key)) continue
    taken.add(key)
    unfinished.push({ col, row })
  }
  return { cols, rows, unfinished, confirmed }
}

/** A wide field for tablets and up; a square one for phones, where a wide one would be specks. */
const WIDE = layout(200, 50, 7)
const SQUARE = layout(100, 100, 11)

const at = (n: number) => MARGIN + n * PITCH
/** Squares placed in the field, as one path. */
const squares = (cells: { col: number; row: number }[]) =>
  cells.map(({ col, row }) => `M${at(col)} ${at(row)}h${CELL}v${CELL}h${-CELL}z`).join('')

/** A filled pattern's squares, placed inside its own tile. */
const tilePath = (cells: { col: number; row: number }[]) =>
  cells.map(({ col, row }) => `M${col * PITCH} ${row * PITCH}h${CELL}v${CELL}h${-CELL}z`).join('')

function Field({ shape, idBase, label }: { shape: Layout; idBase: string; label: string }) {
  const palette = useTheme().vars.palette
  const band = palette.bands.navy
  const width = shape.cols * PITCH
  const height = shape.rows * PITCH
  const faintId = `${idBase}-faint`
  // A confirmed square is one repository, drawn larger than the rest and
  // ringed so it can be found at this density.
  const mark = CELL * 1.6
  const ring = CELL * 3.4

  return (
    <Box
      component="svg"
      viewBox={`0 0 ${width + MARGIN * 2} ${height + MARGIN * 2}`}
      role="img"
      aria-label={label}
      sx={{ display: 'block', width: '100%', height: 'auto' }}
    >
      <g aria-hidden="true">
        <defs>
          <pattern id={faintId} width={PITCH} height={PITCH} patternUnits="userSpaceOnUse" x={MARGIN} y={MARGIN}>
            <rect width={CELL} height={CELL} fill={band.line} />
          </pattern>
          {TILES.map(({ period, cells }) => (
            <pattern
              key={period}
              id={`${idBase}-sites-${period}`}
              width={period * PITCH}
              height={period * PITCH}
              patternUnits="userSpaceOnUse"
              x={MARGIN}
              y={MARGIN}
            >
              <path d={tilePath(cells)} fill={palette.primary.main} />
            </pattern>
          ))}
        </defs>

        {/* Every repository, before the scan. */}
        <rect x={MARGIN} y={MARGIN} width={width} height={height} fill={`url(#${faintId})`} />

        {/* The scan: repositories with access decisions fill as it passes. */}
        <Box component="g" data-part="scanned">
          {TILES.map(({ period }) => (
            <rect
              key={period}
              x={MARGIN}
              y={MARGIN}
              width={width}
              height={height}
              fill={`url(#${idBase}-sites-${period})`}
            />
          ))}
        </Box>
        <Box
          component="rect"
          data-scan
          x={MARGIN}
          y={MARGIN - 6}
          width={3}
          height={height + 12}
          fill={palette.primary.main}
          style={{ '--sweep': `${width - 3}px` } as CSSProperties}
          sx={{ opacity: 0 }}
        />

        {/* Scans that did not finish: the warning hue, over whatever was there. */}
        <Box
          component="path"
          data-part="unfinished"
          d={squares(shape.unfinished)}
          fill={palette.warning.main}
        />

        {/* Repositories with a bug confirmed by hand: pink, ringed in the plate's ink. */}
        {shape.confirmed.map(({ col, row }, index) => {
          const cx = at(col) + CELL / 2
          const cy = at(row) + CELL / 2
          return (
            <Box
              key={`${col}-${row}`}
              component="g"
              data-part="confirmed"
              style={{ '--d': `${TIMING.confirmed + index * TIMING.confirmedStep}ms` } as CSSProperties}
            >
              <rect x={cx - mark / 2} y={cy - mark / 2} width={mark} height={mark} fill={palette.secondary.main} />
              <rect
                x={cx - ring / 2}
                y={cy - ring / 2}
                width={ring}
                height={ring}
                fill="none"
                stroke={band.ink}
                strokeWidth={3}
              />
            </Box>
          )
        })}
      </g>
    </Box>
  )
}

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'

/** A legend entry: its mark, drawn as the field draws it, and its words. */
function Key({ mark, children }: { mark: ReactNode; children: ReactNode }) {
  return (
    <Box component="li" sx={{ display: 'flex', alignItems: 'baseline', columnGap: 1.25, minWidth: 0 }}>
      <Box component="span" aria-hidden sx={{ flexShrink: 0, alignSelf: 'center', display: 'inline-flex' }}>
        {mark}
      </Box>
      <Box component="span">{children}</Box>
    </Box>
  )
}

function Swatch({ fill, ring }: { fill: string; ring?: string }) {
  return (
    <Box
      component="span"
      sx={{
        width: 12,
        height: 12,
        backgroundColor: fill,
        ...(ring && { outline: `2px solid ${ring}`, outlineOffset: 3, mx: '5px' }),
      }}
    />
  )
}

/**
 * The field on a navy plate, with its legend. The legend is the figure's
 * text: it names every mark and its share, so the figure reads without the
 * picture.
 */
export default function RepoField({
  bare = false,
}: {
  /** Drawn straight onto a dark surface that is already there, such as a terminal, with no plate of its own. */
  bare?: boolean
} = {}) {
  const palette = useTheme().vars.palette
  const band = palette.bands.navy
  // Pattern ids go into url(#…) references, so only plain characters.
  const idBase = `field${useId().replace(/[^\w-]/g, '')}`
  const { ref, phase } = useArrivalPhase<HTMLElement>(THRESHOLD, TIMING.done + 60)
  const label = `10,000 squares, one per open-source repository scanned. About half are filled: discovery found access decisions in them. Fewer than 1 in 100 are marked as scans that did not finish. ${field.confirmed} are pink and ringed: the projects where a bug was confirmed by hand.`

  return (
    <Box
      ref={ref}
      component="figure"
      sx={{
        m: 0,
        ...(!bare && { p: { xs: 2, sm: 3, xl: 4 }, backgroundColor: band.background, color: band.ink }),
        // Every part scales about its own box. What arrives during the scan
        // is hidden while armed (one rule, so nothing later replaces it),
        // then played in order.
        '& [data-part]': {
          transformBox: 'fill-box',
          transformOrigin: 'center',
          ...(phase === 'armed' && { opacity: 0 }),
        },
        ...(phase === 'playing' && {
          '& [data-part="scanned"]': { animation: play(wipeIn, TIMING.scanMs, TIMING.scan, 'linear') },
          '& [data-scan]': { animation: play(sweepAcross, TIMING.scanMs, TIMING.scan, 'linear') },
          '& [data-part="unfinished"]': { animation: play(glyphIn, 200, TIMING.unfinished) },
          '& [data-part="confirmed"]': { animation: play(nodeIn, 220, 'var(--d)') },
        }),
        [REDUCED_MOTION]: {
          '& [data-part]': { animation: 'none !important', opacity: 1, clipPath: 'none', transform: 'none' },
          '& [data-scan]': { display: 'none' },
        },
      }}
    >
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Field shape={SQUARE} idBase={`${idBase}-square`} label={label} />
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Field shape={WIDE} idBase={`${idBase}-wide`} label={label} />
      </Box>

      <Box
        component="figcaption"
        sx={{
          mt: { xs: 2.5, md: 3 },
          fontFamily: MONO_FONT,
          fontSize: { xs: '0.8125rem', md: '0.875rem', xl: '0.9375rem' },
          lineHeight: 1.6,
        }}
      >
        <Box
          component="ul"
          role="list"
          sx={{
            listStyle: 'none',
            m: 0,
            p: 0,
            display: 'grid',
            // On a plate of its own the legend runs in one line from lg; drawn
            // bare in a narrower column, one entry to a line.
            gridTemplateColumns: bare
              ? 'minmax(0, 1fr)'
              : { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, auto)' },
            justifyContent: { lg: 'start' },
            columnGap: { sm: 4, lg: 6 },
            rowGap: 1,
          }}
        >
          <Key mark={<Swatch fill={palette.primary.main} />}>
            access decisions found <Box component="span" sx={{ color: band.inkMuted }}>· about half</Box>
          </Key>
          <Key mark={<Swatch fill={band.line} />}>none found</Key>
          <Key mark={<Swatch fill={palette.warning.main} />}>
            scan didn’t finish <Box component="span" sx={{ color: band.inkMuted }}>· under 1%</Box>
          </Key>
          <Key mark={<Swatch fill={palette.secondary.main} ring={band.ink} />}>
            bug confirmed by hand <Box component="span" sx={{ color: band.inkMuted }}>· {field.confirmed} projects</Box>
          </Key>
        </Box>
        <Box component="p" sx={{ m: 0, mt: 1.5, color: band.inkMuted }}>
          Each square is one repository, 10,000 in all. The shares are measured; where each square sits
          is illustrative.
        </Box>
      </Box>
    </Box>
  )
}
