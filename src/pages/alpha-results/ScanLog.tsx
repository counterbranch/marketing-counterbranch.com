import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { MONO_FONT, MUTED } from '../../components/DiffVersusRun.tsx'
import { useArrivalPhase } from '../../hooks/useArrivalPhase.ts'
import { links } from '../../links.ts'
import { caretBlink, caretBlinkCycles, motionDuration } from '../../motion.ts'
import { pageColumn, rhythm } from '../../rhythm.ts'
import LogOutput from './LogOutput.tsx'
import type { Block } from './content.ts'
import { LOG_COLUMNS, LOG_GAP, LOG_PAD, logPlayMs } from './logLayout.ts'

/** Height of the terminal's title bar. */
const TITLE_BAR_HEIGHT = 38

/** Close, minimise and zoom: the system's own colours, as on the site's other windows. */
const TRAFFIC_LIGHTS = ['#FF5F57', '#FEBC2E', '#28C840'] as const

/** Share of a block that must be on screen before its output arrives. */
const THRESHOLD = 0.25

/**
 * The tape's ground and ink, as the site's terminal windows set them: ink
 * with white text in the light scheme, the raised surface in the dark one.
 */
function useTape() {
  const theme = useTheme()
  const palette = theme.vars.palette
  return {
    /**
     * Ground and ink, for a surface that is the tape, plus that surface's own
     * dark-scheme styles: applyStyles returns the same selector key each time,
     * so a second dark block spread after this one would replace it.
     */
    ground: (dark: object = {}) => ({
      backgroundColor: palette.hero.plate,
      color: palette.hero.plateInk,
      ...theme.applyStyles('dark', {
        backgroundColor: palette.background.paper,
        color: palette.text.primary,
        ...dark,
      }),
    }),
    /** Ink only, for what lies on the tape drawn behind it. */
    ink: {
      color: palette.hero.plateInk,
      ...theme.applyStyles('dark', { color: palette.text.primary }),
    },
  }
}

const monoSx = {
  fontFamily: MONO_FONT,
  fontSize: { xs: '0.8125rem', md: '0.875rem', xl: '0.9375rem' },
  lineHeight: 1.75,
} as const

/**
 * The terminal's title bar: the window controls and the block being read.
 * Decoration; each block's heading names the block too.
 */
function TitleBar({ tab, sx }: { tab: string; sx?: object }) {
  const theme = useTheme()
  return (
    <Box
      aria-hidden
      sx={[
        {
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          columnGap: 1.5,
          height: TITLE_BAR_HEIGHT,
          px: '14px',
          // Opaque, so output scrolling under it never shows through.
          backgroundImage:
            'linear-gradient(color-mix(in srgb, currentColor 8%, transparent), color-mix(in srgb, currentColor 8%, transparent))',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box sx={{ display: 'flex', gap: '8px' }}>
        {TRAFFIC_LIGHTS.map((light) => (
          <Box key={light} sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: light }} />
        ))}
      </Box>
      <Box
        component="span"
        sx={{ fontFamily: MONO_FONT, fontSize: '0.75rem', lineHeight: 1, whiteSpace: 'nowrap', color: MUTED }}
      >
        alpha-log — discover —{' '}
        <Box
          component="span"
          key={tab}
          sx={{
            color: 'inherit',
            fontWeight: 700,
            animation: `${caretBlink} ${motionDuration.base}ms steps(2, jump-none) 1 reverse both`,
            [theme.breakpoints.down('lg')]: { animation: 'none' },
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        >
          {tab}
        </Box>
      </Box>
    </Box>
  )
}

/**
 * One block of the log: its question and answer, the output that backs them,
 * then why it matters and what it isn't. In reading order in the document;
 * from lg the output sits on the tape to the left and the notes beside it.
 */
function LogBlock({ block, index }: { block: Block; index: number }) {
  const theme = useTheme()
  const palette = theme.vars.palette
  const tape = useTape()
  const { ref, phase } = useArrivalPhase<HTMLElement>(THRESHOLD, logPlayMs(block.log))
  const first = index === 0

  return (
    <Box
      ref={ref}
      component="section"
      id={block.id}
      aria-labelledby={`${block.id}-question`}
      data-tab={block.tab}
      sx={{
        scrollMarginTop: { xs: 24, lg: TITLE_BAR_HEIGHT + 24 },
        py: { xs: 6, md: 8, lg: first ? 6 : 9 },
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr)',
        rowGap: { xs: 4, md: 5 },
        [theme.breakpoints.up('lg')]: {
          gridColumn: '1 / -1',
          gridRow: index + 2,
          gridTemplateColumns: 'subgrid',
          gridTemplateRows: 'auto 1fr',
          rowGap: 0,
        },
        // Below lg each block is ruled off from the one before.
        ...(!first && { [theme.breakpoints.down('lg')]: { borderTop: '1px solid', borderColor: palette.divider } }),
      }}
    >
      {/* The question and its answer. From lg a leader runs from the tape to
          the question, so each block of output reads as the answer to it. */}
      <Box
        sx={{
          position: 'relative',
          minWidth: 0,
          [theme.breakpoints.up('lg')]: {
            gridColumn: 2,
            gridRow: 1,
            // Level with the middle of the question's first line.
            '--leader-y': 'calc(min(2.75rem, 1.15rem + 1.6vw) * 0.51)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 'var(--leader-y)',
              right: '100%',
              width: theme.spacing(LOG_GAP.lg),
              borderTop: '1px solid',
              borderColor: palette.text.primary,
              opacity: 0.45,
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 'calc(var(--leader-y) - 3px)',
              right: '100%',
              width: 7,
              height: 7,
              mr: `calc(${theme.spacing(LOG_GAP.lg)} - 7px)`,
              backgroundColor: palette.text.primary,
            },
          },
          [theme.breakpoints.up('xl')]: {
            '&::before': { width: theme.spacing(LOG_GAP.xl) },
            '&::after': { mr: `calc(${theme.spacing(LOG_GAP.xl)} - 7px)` },
          },
        }}
      >
        <Typography
          id={`${block.id}-question`}
          variant="h2"
          sx={{ fontSize: 'clamp(1.75rem, 1.15rem + 1.6vw, 2.75rem)', lineHeight: 1.02 }}
        >
          {block.question}
        </Typography>
        <Typography
          sx={{
            mt: rhythm.heading,
            maxWidth: { xs: '46ch', lg: '58ch' },
            fontSize: { xs: '1.0625rem', md: '1.125rem', xl: '1.25rem' },
            lineHeight: 1.55,
            color: palette.text.primary,
            textWrap: 'pretty',
          }}
        >
          {block.answer}
        </Typography>
      </Box>

      {/* The output. Below lg it is its own panel; from lg it lies on the
          tape, which is drawn once behind every block. */}
      <Box
        sx={{
          minWidth: 0,
          ...monoSx,
          px: LOG_PAD,
          py: { xs: 2.5, md: 3 },
          [theme.breakpoints.down('lg')]: { borderRadius: '10px', overflow: 'hidden', ...tape.ground() },
          // From lg the output stays in view beside its notes, under the
          // title bar, until its block has scrolled past.
          [theme.breakpoints.up('lg')]: {
            gridColumn: 1,
            gridRow: '1 / span 2',
            alignSelf: 'start',
            position: 'sticky',
            top: TITLE_BAR_HEIGHT + 24,
            py: 0,
            ...tape.ink,
          },
        }}
      >
        {/* Below lg each block is its own window of the same run. */}
        <TitleBar
          tab={block.tab}
          sx={{
            mx: { xs: '-16px', md: '-24px' },
            mt: { xs: -2.5, md: -3 },
            mb: { xs: 2, md: 2.5 },
            [theme.breakpoints.up('lg')]: { display: 'none' },
          }}
        />
        <LogOutput parts={block.log} phase={phase} />
      </Box>

      {/* Why it matters, and what it isn't. */}
      <Box sx={{ minWidth: 0, [theme.breakpoints.up('lg')]: { gridColumn: 2, gridRow: 2, mt: 4 } }}>
        <Typography
          sx={{
            maxWidth: { xs: '46ch', lg: '58ch' },
            fontSize: { xs: '1rem', xl: '1.125rem' },
            fontWeight: 600,
            lineHeight: 1.85,
            textWrap: 'pretty',
          }}
        >
          {/* Set on an ink plate like the landing page's takeaways: a
              highlighter over the line that says why the result matters.
              Each wrapped line gets its own plate. */}
          <Box
            component="span"
            sx={{
              px: '0.4em',
              py: '0.15em',
              backgroundColor: palette.text.primary,
              color: palette.background.default,
              boxDecorationBreak: 'clone',
              WebkitBoxDecorationBreak: 'clone',
            }}
          >
            <Box component="strong" sx={{ fontWeight: 800 }}>
              Why it matters.
            </Box>{' '}
            {block.why}
          </Box>
        </Typography>
        {block.isnt && (
          <Typography
            sx={{
              mt: 2.5,
              maxWidth: { xs: '46ch', lg: '58ch' },
              fontSize: { xs: '1rem', xl: '1.125rem' },
              color: palette.text.secondary,
              textWrap: 'pretty',
            }}
          >
            <Box component="strong" sx={{ color: palette.text.primary }}>
              What it isn’t.
            </Box>{' '}
            {block.isnt}
          </Typography>
        )}
        {block.actions && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: { xs: 4, md: 5 } }}>
            <Button
              variant="contained"
              size="large"
              component="a"
              href={links.getStarted}
              sx={{ minHeight: 48, width: { xs: '100%', sm: 'auto' } }}
            >
              Get started free
            </Button>
            <Button
              variant="outlined"
              size="large"
              component="a"
              href={links.howItWorks}
              sx={{ minHeight: 48, width: { xs: '100%', sm: 'auto' } }}
            >
              See how it works
            </Button>
          </Stack>
        )}
      </Box>
    </Box>
  )
}

/**
 * Which block is being read: the last one whose top has passed a line a
 * third of the way down the screen. Starts on the first, which is what the
 * server renders.
 */
function useReading(blocks: Block[]) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [tab, setTab] = useState(blocks[0].tab)

  useEffect(() => {
    const container = containerRef.current
    if (!container || typeof IntersectionObserver === 'undefined') return
    const sections = Array.from(container.querySelectorAll<HTMLElement>('section[data-tab]'))
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setTab((entry.target as HTMLElement).dataset.tab ?? blocks[0].tab)
        }
      },
      // A thin band a third of the way down: a block is being read while it
      // crosses it.
      { rootMargin: '-33% 0px -66% 0px' },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [blocks])

  return { containerRef, tab }
}

/**
 * The alpha campaign as one annotated terminal run. From lg a single tape
 * runs the length of the page on the left, under a title bar that stays in
 * view and names the block being read; each block's notes sit to its right,
 * joined to it by a leader. Below lg each block is question, output, then
 * notes, in document order.
 */
export default function ScanLog({ blocks }: { blocks: Block[] }) {
  const theme = useTheme()
  const tape = useTape()
  const { containerRef, tab } = useReading(blocks)
  const lg = theme.breakpoints.up('lg')

  return (
    <Box component="div" sx={{ bgcolor: 'background.default', py: rhythm.section, [lg]: { pt: 0 } }}>
      <Container maxWidth={false} sx={pageColumn}>
        <Box
          ref={containerRef}
          sx={{
            [lg]: {
              // The tape starts inside the header band, so its title bar is
              // in the first screen, under the headline's column.
              position: 'relative',
              mt: -6,
              display: 'grid',
              gridTemplateColumns: LOG_COLUMNS,
              gridTemplateRows: `repeat(${blocks.length + 2}, auto)`,
              columnGap: LOG_GAP.lg,
            },
            [theme.breakpoints.up('xl')]: { columnGap: LOG_GAP.xl },
          }}
        >
          {/* The tape: drawn once behind every block, from lg. */}
          <Box
            aria-hidden
            sx={{
              display: 'none',
              [lg]: {
                display: 'block',
                gridColumn: 1,
                gridRow: '1 / -1',
                borderRadius: '10px',
                boxShadow: `0 40px 80px -48px color-mix(in srgb, ${theme.vars.palette.hero.plate} 70%, transparent)`,
                ...tape.ground({
                  border: '1px solid',
                  borderColor: theme.vars.palette.divider,
                  boxShadow: 'none',
                }),
              },
            }}
          />

          {/* The title bar stays in view down the tape and names the block
              being read. */}
          <TitleBar
            tab={tab}
            sx={{
              display: 'none',
              [lg]: {
                display: 'grid',
                gridColumn: 1,
                gridRow: 1,
                alignSelf: 'start',
                position: 'sticky',
                top: 0,
                zIndex: 1,
                borderRadius: '10px 10px 0 0',
                ...tape.ground({ borderBottom: '1px solid', borderColor: theme.vars.palette.divider }),
              },
            }}
          />

          {blocks.map((block, index) => (
            <LogBlock key={block.id} block={block} index={index} />
          ))}

          {/* The end of the run: the prompt waits, as a terminal does. */}
          <Box
            aria-hidden
            sx={{
              display: 'none',
              [lg]: {
                display: 'block',
                gridColumn: 1,
                gridRow: blocks.length + 2,
                ...monoSx,
                px: LOG_PAD,
                pt: 2,
                pb: 5,
                ...tape.ink,
              },
            }}
          >
            <Box component="span" sx={{ color: MUTED }}>
              # end of log
            </Box>
            <Box component="br" />
            <Box component="span" sx={{ color: MUTED }}>
              ${' '}
            </Box>
            <Box
              component="span"
              sx={{
                // A few blinks, then it rests on (WCAG 2.2.2).
                animation: `${caretBlink} ${motionDuration.blink}ms steps(2, jump-none) ${caretBlinkCycles}`,
                '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
              }}
            >
              ▮
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
