import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import Section from './Section.tsx'
import { motionDuration, motionEasing, signalTravel, stampIn, wipeDown } from '../motion.ts'
import { displayFont } from '../theme.ts'

/**
 * idle: the finished comparison, no animation. What the server renders and
 *   what every run settles back to.
 * armed: the connectors undrawn and the verdicts and the report hidden,
 *   ready to play. Only ever set while the panel is off screen, so nobody
 *   sees it hide.
 * playing: the check runs through both versions: the connectors draw, a
 *   signal crosses each, the verdicts stamp in, both results run on into the
 *   report, then the report opens.
 */
type Phase = 'idle' | 'armed' | 'playing'

/** Share of the panel that must be on screen before the first run plays. */
const START_THRESHOLD = 0.35

/** When each part of a run starts, in ms. */
const CHECK_DRAW_DELAY = 0
const CHECK_SIGNAL_DELAY = 240
const BEFORE_DELAY = 820
const AFTER_DELAY = 980
const REPORT_DRAW_DELAY = 1100
const REPORT_SIGNAL_DELAY = 1300
const REPORT_DELAY = 1800

/** Just after the report finishes opening (1800 + 420). */
const RUN_MS = 2300

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'
const SUPPORTS_OFFSET_PATH = '@supports (offset-path: path("M0 0 L1 1"))'

/**
 * The two connector rows. Each viewBox is 100 wide and exactly as tall as its
 * row in pixels, so the row stretches only sideways: the paths meet the
 * column centres (25 and 75) at any width, and vertical lengths stay true
 * pixels, which is what keeps the signal square.
 */
const CHECK_ROW = {
  height: 56,
  paths: ['M50 0 C50 28 25 28 25 56', 'M50 0 C50 28 75 28 75 56'],
} as const
const REPORT_ROW = {
  height: 48,
  paths: ['M25 0 C25 24 50 24 50 48', 'M75 0 C75 24 50 24 50 48'],
} as const

/** Side of the signal square, in px. */
const SIGNAL_SIZE = 6

const REGRESSION_ANNOUNCEMENT =
  'Access changed from deny to allow. A viewer gained access to a private document.'
const FIXED_ANNOUNCEMENT = 'Both versions deny access. Expected access restored.'

const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const

/** The panel's inner gutter, shared so every row starts on the same edge. */
const gutter = { xs: 2, sm: 3 }

/**
 * Two versions of one line stacked in a single grid cell. The cell keeps the
 * size of the larger, so switching never moves anything around it. The hidden
 * version is `visibility: hidden` and aria-hidden, so only the shown one is
 * read.
 */
function Swap({
  first,
  second,
  showSecond,
  align = 'start',
}: {
  first: ReactNode
  second: ReactNode
  showSecond: boolean
  align?: 'start' | 'center'
}) {
  const cell = { gridArea: '1 / 1', justifySelf: align }
  return (
    <Box component="span" sx={{ display: 'grid' }}>
      <Box
        component="span"
        aria-hidden={showSecond || undefined}
        sx={{ ...cell, visibility: showSecond ? 'hidden' : 'visible' }}
      >
        {first}
      </Box>
      <Box
        component="span"
        aria-hidden={!showSecond || undefined}
        sx={{ ...cell, visibility: showSecond ? 'visible' : 'hidden' }}
      >
        {second}
      </Box>
    </Box>
  )
}

/**
 * A decision, stamped. Deny is set in ink; allow in brand pink, the one place
 * the section uses colour to say something went wrong.
 */
function Verdict({ allows, phase, delay }: { allows: boolean; phase: Phase; delay: number }) {
  const palette = useTheme().vars.palette
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        px: 2,
        py: 0.75,
        fontFamily: displayFont,
        fontWeight: 700,
        fontSize: '1.25rem',
        lineHeight: 1.2,
        letterSpacing: '0.08em',
        backgroundColor: allows ? palette.secondary.main : palette.text.primary,
        color: allows ? palette.secondary.contrastText : palette.background.default,
        ...(phase === 'armed' && { opacity: 0, transform: 'scale(0.9)' }),
        ...(phase === 'playing' && {
          animation: `${stampIn} ${motionDuration.base}ms ${motionEasing.decel} ${delay}ms both`,
        }),
        [REDUCED_MOTION]: { animation: 'none', opacity: 1, transform: 'none' },
      }}
    >
      {allows ? 'ALLOW' : 'DENY'}
    </Box>
  )
}

/**
 * What a signal carries. The check and a DENY travel in the brand cyan
 * family; an ALLOW travels in pink, like its stamp.
 */
type SignalTone = 'check' | 'allow'

interface Connector {
  /** The path in the row's viewBox. */
  d: string
  tone: SignalTone
}

/**
 * A row of two connectors, drawn in with the same top-down wipe as the
 * report (every path here runs downward, so the wipe follows the line), each
 * with a square signal travelling it on `offset-path`. It restates what the
 * text already says, so it is hidden from assistive technology.
 *
 * The viewBox stretches sideways, so the lines keep their weight with a
 * non-scaling stroke, and the signal is a stroke too: a 6-unit vertical line
 * (6 px, since the row is not stretched vertically) stroked 6 px wide. A
 * `<rect>` would stretch into a bar. The draw is a clip rather than a
 * dash-offset: with a non-scaling stroke, browsers measure `pathLength` in
 * the stretched user units but lay dashes out in screen pixels, so a dashed
 * line would stop short of the columns.
 */
function Connectors({
  height,
  connectors,
  phase,
  drawDelay,
  signalDelay,
  signalDuration,
}: {
  height: number
  connectors: readonly Connector[]
  phase: Phase
  drawDelay: number
  signalDelay: number
  signalDuration: number
}) {
  const theme = useTheme()
  const palette = theme.vars.palette
  const toneSx = {
    check: {
      stroke: palette.primary.dark,
      ...theme.applyStyles('dark', { stroke: palette.primary.main }),
    },
    allow: { stroke: palette.secondary.main },
  }
  return (
    <Box
      component="svg"
      aria-hidden
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      sx={{
        display: 'block',
        width: '100%',
        height,
        ...(phase === 'armed' && { clipPath: 'inset(0 0 100% 0)' }),
        ...(phase === 'playing' && {
          animation: `${wipeDown} ${motionDuration.entrance}ms ${motionEasing.decel} ${drawDelay}ms both`,
        }),
        [REDUCED_MOTION]: { animation: 'none', clipPath: 'none' },
      }}
    >
      {connectors.map(({ d }) => (
        <Box
          key={d}
          component="path"
          d={d}
          fill="none"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          sx={{ stroke: palette.text.secondary }}
        />
      ))}
      {/* Hidden unless a run is playing in a browser that can move it
          along a path. */}
      {connectors.map(({ d, tone }) => (
        <Box
          key={`signal ${d}`}
          component="line"
          x1={0}
          y1={-SIGNAL_SIZE / 2}
          x2={0}
          y2={SIGNAL_SIZE / 2}
          strokeWidth={SIGNAL_SIZE}
          vectorEffect="non-scaling-stroke"
          sx={{
            display: 'none',
            ...toneSx[tone],
            ...(phase === 'playing' && {
              [SUPPORTS_OFFSET_PATH]: {
                display: 'inline',
                offsetPath: `path("${d}")`,
                offsetRotate: '0deg',
                animation: `${signalTravel} ${signalDuration}ms ${motionEasing.decel} ${signalDelay}ms both`,
              },
            }),
            [REDUCED_MOTION]: { display: 'none', animation: 'none' },
          }}
        />
      ))}
    </Box>
  )
}

/**
 * The same permission check run against both versions of the authorization
 * logic, as one bordered panel: the check, the two decisions, the report,
 * joined by connectors the check visibly runs along. "Show the fix" swaps the
 * pull request for its fix and plays the result; "Replay flow" plays it again
 * unchanged. Nothing else moves.
 *
 * The first render is the finished comparison, so the prerendered HTML and
 * visitors without JavaScript see the whole picture. Motion is CSS keyframes
 * restarted by remounting (`key={runKey}`); React only changes phase at the
 * start and end of a run.
 */
export default function AccessComparison() {
  const theme = useTheme()
  const palette = theme.vars.palette
  const panel = useRef<HTMLDivElement | null>(null)
  const played = useRef(false)
  const [fixed, setFixed] = useState(false)
  const [runKey, setRunKey] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')

  const play = useCallback(() => {
    played.current = true
    setPhase('playing')
    setRunKey((key) => key + 1)
  }, [])

  // Plays once, the first time the panel is properly on screen. If it starts
  // off screen it is armed there, so the run later starts from nothing instead
  // of visibly hiding the finished picture first. Without the observer it
  // simply stays finished.
  useEffect(() => {
    const node = panel.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    let firstReport = true
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        const isFirst = firstReport
        firstReport = false
        if (played.current) {
          observer.disconnect()
        } else if (entry.isIntersecting && entry.intersectionRatio >= START_THRESHOLD) {
          observer.disconnect()
          play()
        } else if (isFirst) {
          setPhase('armed')
        }
      },
      { threshold: START_THRESHOLD },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [play])

  // Settles each run back to idle once its last animation has finished. A new
  // run (or unmounting) clears the pending one.
  useEffect(() => {
    if (phase !== 'playing') return
    const id = window.setTimeout(() => setPhase('idle'), RUN_MS)
    return () => window.clearTimeout(id)
  }, [phase, runKey])

  const toggle = () => {
    setFixed((current) => !current)
    play()
  }

  const replay = () => play()

  const announcement =
    runKey > 0 && phase === 'idle' ? (fixed ? FIXED_ANNOUNCEMENT : REGRESSION_ANNOUNCEMENT) : ''
  const rule = `1px solid ${palette.divider}`
  const muted = { color: palette.text.secondary }

  // The After result carries ALLOW into the report until the fix is shown.
  const checkConnectors: Connector[] = CHECK_ROW.paths.map((d) => ({ d, tone: 'check' }))
  const reportConnectors: Connector[] = [
    { d: REPORT_ROW.paths[0], tone: 'check' },
    { d: REPORT_ROW.paths[1], tone: fixed ? 'check' : 'allow' },
  ]

  // Both actions are outlined in the section's own ink rather than a brand
  // colour, so neither reads as the page's primary action.
  const outlinedButtonSx = {
    minHeight: 44,
    color: palette.text.primary,
    borderColor: palette.divider,
    transition: theme.transitions.create(['transform', 'background-color', 'border-color'], {
      duration: motionDuration.fast,
      easing: motionEasing.decel,
    }),
    '&:hover': { borderColor: palette.text.primary },
  }
  const reducedButtonTransition = theme.transitions.create(['background-color', 'border-color'], {
    duration: motionDuration.fast,
    easing: motionEasing.decel,
  })

  return (
    <Section id="how-it-works">
      <Container maxWidth="lg">
        {/* Intro, comparison, action, in reading order. On phones they stack
            in that order, so the action sits under the panel it changes. From
            md the panel spans both rows beside the text, and the second row
            takes any spare height so the action stays under the intro. */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateAreas: { xs: '"intro" "compare" "aside"', md: '"intro compare" "aside compare"' },
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 400px) minmax(0, 1fr)' },
            gridTemplateRows: { md: 'auto 1fr' },
            columnGap: 8,
            rowGap: 4,
            alignItems: 'start',
          }}
        >
          <Box sx={{ gridArea: 'intro' }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{ fontSize: 'clamp(2rem, 1.4rem + 2.6vw, 3.5rem)' }}
            >
              See what access changed.
            </Typography>
            <Typography
              variant="body1"
              sx={{ mt: 2.5, maxWidth: '40ch', ...muted, textWrap: 'pretty' }}
            >
              Run the same permission check against both versions of your authorization logic.
            </Typography>
          </Box>

          <Box
            ref={panel}
            role="group"
            aria-label="Before and after comparison"
            sx={{
              gridArea: 'compare',
              minWidth: 0,
              border: rule,
              backgroundColor: palette.background.paper,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                columnGap: 3,
                rowGap: 0.5,
                px: gutter,
                py: 2,
                borderBottom: rule,
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Viewer → read private document
              </Typography>
              <Typography variant="body2" sx={muted}>
                Expected: DENY
              </Typography>
            </Box>

            <Connectors
              key={`check ${runKey}`}
              height={CHECK_ROW.height}
              connectors={checkConnectors}
              phase={phase}
              drawDelay={CHECK_DRAW_DELAY}
              signalDelay={CHECK_SIGNAL_DELAY}
              signalDuration={motionDuration.signal}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
              <Box sx={{ px: gutter, py: 3 }}>
                <Typography variant="body2" sx={muted}>
                  Before · main
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  Original policy
                </Typography>
                <Box sx={{ mt: 2.5 }}>
                  <Verdict key={runKey} allows={false} phase={phase} delay={BEFORE_DELAY} />
                </Box>
              </Box>
              <Box sx={{ px: gutter, py: 3, borderLeft: rule }}>
                <Typography variant="body2" sx={muted}>
                  <Swap first="After · your PR" second="After · PR + fix" showSecond={fixed} />
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  <Swap first="Changed policy" second="Fixed policy" showSecond={fixed} />
                </Typography>
                <Box sx={{ mt: 2.5 }}>
                  <Verdict key={runKey} allows={!fixed} phase={phase} delay={AFTER_DELAY} />
                </Box>
              </Box>
            </Box>

            <Typography variant="body2" sx={{ px: gutter, py: 1.5, borderTop: rule, ...muted }}>
              Same users, same test data. Only the policy changes.
            </Typography>

            <Connectors
              key={`report ${runKey}`}
              height={REPORT_ROW.height}
              connectors={reportConnectors}
              phase={phase}
              drawDelay={REPORT_DRAW_DELAY}
              signalDelay={REPORT_SIGNAL_DELAY}
              signalDuration={motionDuration.signalShort}
            />

            {/* The report uses the hero's tokens: a cyan flood with dark ink
                in the light scheme, near-black under a cyan rule in the dark
                one, where the flood alone would sink into the panel. */}
            <Box
              key={runKey}
              sx={{
                px: gutter,
                py: 3,
                backgroundColor: palette.hero.background,
                color: palette.hero.ink,
                ...theme.applyStyles('dark', { borderTop: `1.5px solid ${palette.primary.main}` }),
                ...(phase === 'armed' && { clipPath: 'inset(0 0 100% 0)' }),
                ...(phase === 'playing' && {
                  animation: `${wipeDown} ${motionDuration.entrance}ms ${motionEasing.decel} ${REPORT_DELAY}ms both`,
                }),
                [REDUCED_MOTION]: { animation: 'none', clipPath: 'none' },
              }}
            >
              <Typography
                sx={{
                  fontFamily: displayFont,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  lineHeight: 1.5,
                  letterSpacing: '0.14em',
                  color: palette.hero.inkMuted,
                }}
              >
                COUNTERBRANCH REPORT
              </Typography>
              <Typography
                sx={{
                  mt: 1,
                  fontFamily: displayFont,
                  fontWeight: 700,
                  fontSize: 'clamp(1.5rem, 1.2rem + 1vw, 2rem)',
                  lineHeight: 1.1,
                  letterSpacing: '0.06em',
                  color: palette.hero.ink,
                }}
              >
                {fixed ? 'DENY → DENY' : 'DENY → ALLOW'}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1.5, fontWeight: 600, color: palette.hero.ink }}>
                <Swap
                  first="Viewer gained access to a private document."
                  second="The private document stays private."
                  showSecond={fixed}
                />
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: palette.hero.inkMuted }}>
                <Swap
                  first="Unexpected access · Expected: DENY"
                  second="Expected access restored"
                  showSecond={fixed}
                />
              </Typography>
            </Box>
          </Box>

          <Box sx={{ gridArea: 'aside' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={toggle}
                sx={{ ...outlinedButtonSx, [REDUCED_MOTION]: { transition: reducedButtonTransition } }}
              >
                <Swap first="Show the fix" second="Show the regression" showSecond={fixed} align="center" />
              </Button>
              {/* Replaying does nothing visible without motion, so the
                  control goes with it. */}
              <Button
                variant="outlined"
                color="inherit"
                onClick={replay}
                sx={{ ...outlinedButtonSx, [REDUCED_MOTION]: { display: 'none' } }}
              >
                Replay flow
              </Button>
            </Box>
            <Typography
              variant="body2"
              sx={{ mt: 2, maxWidth: '40ch', ...muted, textWrap: 'pretty' }}
            >
              Illustrative prepared test case. The comparison covers the cases you run.
            </Typography>
            <Box aria-live="polite" sx={visuallyHidden}>
              {announcement}
            </Box>
          </Box>
        </Box>
      </Container>
    </Section>
  )
}
