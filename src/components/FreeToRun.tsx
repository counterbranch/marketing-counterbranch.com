import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import Section from './Section.tsx'
import { MONO_FONT } from './DiffVersusRun.tsx'
import { pageColumn, rhythm } from '../rhythm.ts'

/** Glyph geometry, in viewBox units: a small grid of decisions, as on the rest of the page. */
const CELL = 16
const PITCH = 22
const RING = 3

/** Where access is decided in the glyphs' small codebase: x marks a decision found. */
const FOUND = ['x.xx.x', '.x..xx', 'xx.x..', '.x.xx.']

/** The decisions a team chose to guard. */
const CHOSEN = [
  { col: 0, row: 0 },
  { col: 4, row: 1 },
  { col: 3, row: 3 },
]

const isFound = (col: number, row: number) => FOUND[row][col] === 'x'
const isChosen = (col: number, row: number) => CHOSEN.some((cell) => cell.col === col && cell.row === row)

const COLS = FOUND[0].length
const ROWS = FOUND.length
const WIDTH = (COLS - 1) * PITCH + CELL + RING * 2
const HEIGHT = (ROWS - 1) * PITCH + CELL + RING * 2

/** The guarded decision that changes on the pull request, in the compare glyph. */
const CHANGED = { col: 4, row: 1 }

/**
 * One stage's picture of the same small codebase. Map: the decisions found,
 * filled. Choose: the ones chosen for checks, filled and ringed; the rest of
 * what was found stays outlined. Compare: the checked decisions, with the one
 * that changed on the pull request in pink, ringed, as on the rest of the page.
 */
function Glyph({ stage }: { stage: 'map' | 'choose' | 'compare' }) {
  const palette = useTheme().vars.palette
  const band = palette.bands.navy
  const cyan = palette.primary.main
  const cells = []
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const x = RING + col * PITCH
      const y = RING + row * PITCH
      const found = isFound(col, row)
      const chosen = isChosen(col, row)
      const changed = stage === 'compare' && col === CHANGED.col && row === CHANGED.row
      const filled = stage === 'map' ? found : chosen
      const ringed = (stage === 'choose' && chosen) || changed
      const outlined = stage === 'choose' && found && !chosen
      cells.push(
        <g key={`${col}-${row}`}>
          <rect
            x={x}
            y={y}
            width={CELL}
            height={CELL}
            fill={changed ? palette.secondary.main : filled ? cyan : band.line}
          />
          {outlined && (
            <rect x={x + 1} y={y + 1} width={CELL - 2} height={CELL - 2} fill="none" stroke={cyan} strokeWidth={2} />
          )}
          {ringed && (
            <rect
              x={x - RING}
              y={y - RING}
              width={CELL + RING * 2}
              height={CELL + RING * 2}
              fill="none"
              stroke={band.ink}
              strokeWidth={2}
            />
          )}
        </g>,
      )
    }
  }
  return (
    <Box
      component="svg"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      aria-hidden
      sx={{ display: 'block', width: { xs: 120, md: 140 }, height: 'auto' }}
    >
      {cells}
    </Box>
  )
}

interface Stage {
  key: 'map' | 'choose' | 'compare'
  name: string
  body: string
  /** Who calls a model at this stage, if anyone. */
  model: ReactNode
}

function StageItem({ stage }: { stage: Stage }) {
  const band = useTheme().vars.palette.bands.navy
  return (
    <Box
      component="li"
      sx={{
        minWidth: 0,
        pt: { xs: 3, md: 4 },
        borderTop: '1px solid',
        borderColor: band.line,
        display: 'grid',
        gridTemplateRows: 'auto auto 1fr auto',
        rowGap: 0,
      }}
    >
      <Glyph stage={stage.key} />
      <Typography variant="h4" component="h3" sx={{ mt: { xs: 3, md: 4 } }}>
        {stage.name}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          mt: rhythm.heading,
          maxWidth: '40ch',
          fontSize: { xl: '1.125rem' },
          color: band.inkMuted,
          textWrap: 'pretty',
        }}
      >
        {stage.body}
      </Typography>
      <Box
        component="p"
        sx={{
          m: 0,
          mt: 3,
          fontFamily: MONO_FONT,
          fontSize: { xs: '0.875rem', xl: '0.9375rem' },
          lineHeight: 1.6,
        }}
      >
        <Box component="span" sx={{ color: band.inkMuted }}>
          model calls{' '}
        </Box>
        <Box component="span" sx={{ fontWeight: 700 }}>
          {stage.model}
        </Box>
      </Box>
    </Box>
  )
}

const stages: Stage[] = [
  {
    key: 'map',
    name: 'Map.',
    body: 'Discovery maps where your code decides access, in the nine languages it reads. Under a minute for the largest repositories we timed, and the same code always gives the same map.',
    model: 'none',
  },
  {
    key: 'choose',
    name: 'Choose.',
    body: 'Your coding agent drafts checks for the decisions that matter, following our setup recipe. A check only counts once you approve it.',
    model: 'your agent, your key',
  },
  {
    key: 'compare',
    name: 'Compare.',
    body: 'On every pull request, Counterbranch runs those checks against main and the change, and reports what changed, what the app returned and what didn’t finish.',
    model: 'none',
  },
]

/**
 * Why the campaign could run at that scale, and what that means for a team:
 * the steps that run on every change never call a model. Judgment happens
 * once, while checks are drafted, in the team's own agent and on its key.
 */
export default function FreeToRun() {
  const band = useTheme().vars.palette.bands.navy

  return (
    <Section id="no-tokens" tone="navy">
      <Container maxWidth={false} sx={pageColumn}>
        <Box sx={{ mb: rhythm.intro }}>
          <Typography variant="h2" component="h2" sx={{ maxWidth: { xs: '14ch', md: '22ch' } }}>
            No tokens to map. No tokens to check.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mt: rhythm.heading,
              maxWidth: '52ch',
              fontSize: { md: '1.125rem', xl: '1.25rem' },
              color: band.inkMuted,
              textWrap: 'pretty',
            }}
          >
            Discovery and the comparison are deterministic: they never call a model, so a rerun costs no
            tokens and gives the same answer. The one step that needs judgment happens once, in your own
            agent, on your own key.
          </Typography>
        </Box>

        {/* A sequence, so an ordered list; the stage names carry the order. */}
        <Box
          component="ol"
          role="list"
          sx={{
            listStyle: 'none',
            m: 0,
            p: 0,
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(3, minmax(0, 1fr))' },
            columnGap: { md: 5, xl: 8 },
            rowGap: { xs: 6, md: 0 },
          }}
        >
          {stages.map((stage) => (
            <StageItem key={stage.key} stage={stage} />
          ))}
        </Box>
      </Container>
    </Section>
  )
}
