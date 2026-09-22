import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import Section from './Section.tsx'
import { motionDuration, motionEasing, stampIn, wipeDown } from '../motion.ts'
import { displayFont } from '../theme.ts'

/**
 * idle: the finished comparison, no animation. What the server renders and
 *   what every run settles back to.
 * armed: the verdicts and the report hidden, ready to play. Only ever set
 *   while the panel is off screen, so nobody sees it hide.
 * playing: the verdicts stamp in, then the report opens.
 */
type Phase = 'idle' | 'armed' | 'playing'

/** Share of the panel that must be on screen before the first run plays. */
const START_THRESHOLD = 0.35

/** When each part of a run starts, in ms. */
const BEFORE_DELAY = 120
const AFTER_DELAY = 380
const REPORT_DELAY = 700

/** Just after the report finishes opening (700 + 420). */
const RUN_MS = 1150

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'

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
 * The same permission check run against both versions of the authorization
 * logic, as one bordered panel: the check, the two decisions, the report.
 * The one control swaps the pull request for its fix and plays the result
 * again; nothing else moves.
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

  const announcement =
    runKey > 0 && phase === 'idle' ? (fixed ? FIXED_ANNOUNCEMENT : REGRESSION_ANNOUNCEMENT) : ''
  const rule = `1px solid ${palette.divider}`
  const muted = { color: palette.text.secondary }

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
            <Button
              variant="outlined"
              color="inherit"
              onClick={toggle}
              sx={{
                minHeight: 44,
                color: palette.text.primary,
                borderColor: palette.divider,
                transition: theme.transitions.create(['transform', 'background-color', 'border-color'], {
                  duration: motionDuration.fast,
                  easing: motionEasing.decel,
                }),
                '&:hover': { borderColor: palette.text.primary },
                [REDUCED_MOTION]: {
                  transition: theme.transitions.create(['background-color', 'border-color'], {
                    duration: motionDuration.fast,
                    easing: motionEasing.decel,
                  }),
                },
              }}
            >
              <Swap first="Show the fix" second="Show the regression" showSecond={fixed} align="center" />
            </Button>
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
