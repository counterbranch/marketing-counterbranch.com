import { useCallback, useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import Section from './Section.tsx'
import { motionDuration, motionEasing, statusPulse } from '../motion.ts'
import { displayFont } from '../theme.ts'

const FLOW_MS = 6500

/** Share of the diagram that must be on screen before the first run starts. */
const START_THRESHOLD = 0.3

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'

/**
 * The diagram column is a size container. Below this width it shows the tall
 * compact drawing, whose type stays legible; above it, the wide one. Measured
 * on the column itself, so the swap follows the space the diagram gets beside
 * the text rather than the viewport. Without container query support the
 * compact drawing shows everywhere, which reads at any width.
 */
const WIDE_DIAGRAM = '@container access-diagram (min-width: 640px)'

/** Verdicts, labels and the report headline are set in the display face. */
const displayLabel = {
  fontFamily: displayFont,
  fontWeight: 700,
  letterSpacing: '0.08em',
} as const

/** The small caps line that names the flow's current phase. */
const statusSx = {
  fontFamily: displayFont,
  fontWeight: 600,
  fontSize: '0.8125rem',
  lineHeight: 1.7,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  textWrap: 'balance',
  color: 'text.secondary',
} as const

const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const

function clamp(value: number) {
  return Math.max(0, Math.min(1, value))
}

function smooth(value: number) {
  const t = clamp(value)
  return t * t * (3 - 2 * t)
}

function cubic(
  start: [number, number],
  controlA: [number, number],
  controlB: [number, number],
  end: [number, number],
  fraction: number,
) {
  const t = smooth(fraction)
  const u = 1 - t
  return {
    x: u ** 3 * start[0] + 3 * u ** 2 * t * controlA[0] + 3 * u * t ** 2 * controlB[0] + t ** 3 * end[0],
    y: u ** 3 * start[1] + 3 * u ** 2 * t * controlA[1] + 3 * u * t ** 2 * controlB[1] + t ** 3 * end[1],
  }
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * A button label that keeps the width of its longest option, so the control
 * does not change size as the flow toggles it between states. The inactive
 * labels are `visibility: hidden`, which also keeps them out of the
 * accessible name.
 */
function StableLabel({ labels, active }: { labels: readonly string[]; active: number }) {
  return (
    <Box component="span" sx={{ display: 'inline-grid' }}>
      {labels.map((label, index) => (
        <Box
          component="span"
          key={label}
          sx={{
            gridArea: '1 / 1',
            justifySelf: 'center',
            visibility: index === active ? 'visible' : 'hidden',
          }}
        >
          {label}
        </Box>
      ))}
    </Box>
  )
}

/**
 * The square in front of the status line. Cyan while the flow runs, breathing
 * to show it is live; it settles on pink for the regression and stays cyan,
 * at rest, for the fix. Centred on the cap height, since the line is set in
 * capitals. Decorative: the words beside it carry the state.
 */
function StatusMarker({ tone, pulsing }: { tone: 'primary' | 'secondary'; pulsing: boolean }) {
  return (
    <Box
      component="span"
      aria-hidden
      sx={(theme) => ({
        display: 'inline-block',
        width: 10,
        height: 10,
        mr: '10px',
        borderRadius: 0,
        verticalAlign: 'calc(0.5cap - 5px)',
        transition: `background-color ${motionDuration.base}ms ${motionEasing.decel}`,
        ...(tone === 'secondary'
          ? { backgroundColor: theme.vars.palette.secondary.main }
          : {
              backgroundColor: theme.vars.palette.primary.dark,
              ...theme.applyStyles('dark', { backgroundColor: theme.vars.palette.primary.main }),
            }),
        ...(pulsing && {
          animation: `${statusPulse} ${motionDuration.pulse}ms ${motionEasing.decel} infinite`,
        }),
        [REDUCED_MOTION]: { animation: 'none', transition: 'none' },
      })}
    />
  )
}

interface LayerProps {
  x: number
  y: number
  width: number
  label: string
  active?: 'before' | 'after'
  lift: number
  compact: boolean
  colors: {
    face: string
    top: string
    side: string
    line: string
    primary: string
    primaryInk: string
    secondary: string
    secondaryInk: string
    ink: string
  }
}

function Layer({ x, y, width, label, active, lift, compact, colors }: LayerProps) {
  const left = x - width / 2
  const bevel = compact ? 9 : 11
  const face = active === 'before' ? colors.primary : active === 'after' ? colors.secondary : colors.face
  const ink = active === 'before' ? colors.primaryInk : active === 'after' ? colors.secondaryInk : colors.ink

  return (
    <g transform={`translate(0 ${-lift})`}>
      <path
        d={`M ${left} ${y + 8} L ${left + bevel} ${y} H ${left + width} L ${left + width - bevel} ${y + 8} Z`}
        fill={colors.top}
        stroke={colors.line}
      />
      <path
        d={`M ${left + width - bevel} ${y + 8} L ${left + width} ${y} V ${y + 27} L ${left + width - bevel} ${y + 35} Z`}
        fill={colors.side}
        stroke={colors.line}
      />
      <path
        className="access-recolor"
        d={`M ${left} ${y + 8} H ${left + width - bevel} V ${y + 35} H ${left} Z`}
        style={{ fill: face }}
        stroke={colors.line}
      />
      <text
        className="access-recolor"
        x={x - bevel / 2}
        y={y + 26}
        textAnchor="middle"
        fontSize={compact ? 13 : 14}
        fontWeight={600}
        style={{ fill: ink }}
      >
        {label}
      </text>
    </g>
  )
}

interface DiagramProps {
  compact: boolean
  fixed: boolean
  progress: number
}

function ComparisonDiagram({ compact, fixed, progress }: DiagramProps) {
  const theme = useTheme()
  const variant = compact ? 'mobile' : 'desktop'
  const width = compact ? 320 : 680
  const middle = width / 2
  const before = width * 0.25
  const after = width * 0.75
  const layerWidth = compact ? 132 : 210
  const reportX = compact ? 8 : 55
  const reportWidth = width - reportX * 2
  const reportHeight = compact ? 167 : 138
  const height = 397 + reportHeight + 9
  const ink = theme.vars.palette.text.primary
  const muted = theme.vars.palette.text.secondary
  const line = theme.vars.palette.divider
  const primary = theme.vars.palette.primary.main
  const secondary = theme.vars.palette.secondary.main
  const primaryInk = theme.vars.palette.primary.contrastText
  const secondaryInk = theme.vars.palette.secondary.contrastText
  const denyInk = theme.vars.palette.background.default
  const reportFill = theme.vars.palette.hero.background
  const reportInk = theme.vars.palette.hero.ink
  const reportMuted = theme.vars.palette.hero.inkMuted
  const badgeSize = compact ? 13 : 12
  const colors = {
    face: theme.vars.palette.background.paper,
    top: theme.vars.palette.action.hover,
    side: theme.vars.palette.action.selected,
    line,
    primary,
    primaryInk,
    secondary,
    secondaryInk,
    ink,
  }

  const inputFraction = (progress - 0.03) / 0.19
  const outputFraction = (progress - 0.43) / 0.25
  const reportFraction = smooth((progress - 0.79) / 0.17)
  const beforeInput = cubic([middle, 71], [middle, 90], [before, 82], [before, 105], inputFraction)
  const afterInput = cubic([middle, 71], [middle, 90], [after, 82], [after, 105], inputFraction)
  const beforeOutput = cubic([before, 274], [before, 311], [middle - 60, 330], [middle - 39, 330], outputFraction)
  const afterOutput = cubic([after, 274], [after, 311], [middle + 60, 330], [middle + 39, 330], outputFraction)
  const bump = progress > 0.68 && progress < 0.79 ? Math.sin((progress - 0.68) / 0.11 * Math.PI) * 0.05 : 0
  const description = fixed
    ? 'The same permission check runs in the original and corrected test environments. Both deny access to the private document. The report confirms expected access is restored.'
    : 'The same permission check runs in the original and proposed test environments. The original denies access; the proposal allows it. The report identifies unexpected access to a private document.'

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-labelledby={`access-flow-title-${variant} access-flow-desc-${variant}`}
      style={{ display: 'block', overflow: 'visible', fontFamily: theme.typography.fontFamily }}
    >
      <title id={`access-flow-title-${variant}`}>Before and after access comparison</title>
      <desc id={`access-flow-desc-${variant}`}>{description}</desc>

      <text x={middle} y={16} textAnchor="middle" fontSize={compact ? 13 : 12} fill={muted}>
        Same permission check
      </text>
      <rect x={compact ? 4 : middle - 162} y={28} width={compact ? width - 8 : 324} height={44} fill={colors.face} stroke={line} />
      <text x={middle} y={46} textAnchor="middle" fontSize={compact ? 13 : 14} fontWeight={600} fill={ink}>
        {compact ? 'Viewer → read' : 'Viewer → read private document'}
      </text>
      <text x={middle} y={63} textAnchor="middle" fontSize={compact ? 12.5 : 12} fill={muted}>
        {compact ? 'Private document · Expected: DENY' : 'Expected: DENY'}
      </text>

      <path d={`M ${middle} 72 C ${middle} 90 ${before} 82 ${before} 105`} fill="none" stroke={line} strokeWidth={1.5} />
      <path d={`M ${middle} 72 C ${middle} 90 ${after} 82 ${after} 105`} fill="none" stroke={line} strokeWidth={1.5} />
      {progress >= 0.03 && progress <= 0.22 && (
        <>
          <circle className="access-token" cx={beforeInput.x} cy={beforeInput.y} r={4} />
          <circle className="access-token" cx={afterInput.x} cy={afterInput.y} r={4} />
        </>
      )}

      <text x={before} y={123} textAnchor="middle" fontSize={compact ? 13 : 14} fontWeight={600} fill={ink}>
        {compact ? 'Before' : 'Before · main'}
      </text>
      <text x={after} y={123} textAnchor="middle" fontSize={compact ? 13 : 14} fontWeight={600} fill={ink}>
        {compact ? 'After' : fixed ? 'After · PR + fix' : 'After · your PR'}
      </text>

      {[before, after].map((center, index) => {
        const allows = index === 1 && !fixed
        return (
          <g key={index}>
            {[207, 173, 139].map((y, layerIndex) => {
              const local = clamp((progress - (0.23 + layerIndex * 0.045)) / 0.13)
              const lift = Math.sin(local * Math.PI) * 5
              return (
                <Layer
                  key={y}
                  x={center}
                  y={y}
                  width={layerWidth}
                  label={layerIndex === 0 ? 'Test data' : layerIndex === 1 ? 'Users + roles' : index === 0 ? 'Original logic' : fixed ? 'Fixed logic' : 'Changed logic'}
                  active={layerIndex === 2 ? index === 0 || fixed ? 'before' : 'after' : undefined}
                  lift={lift}
                  compact={compact}
                  colors={colors}
                />
              )
            })}
            <g className="access-badge" style={{ opacity: progress >= 0.39 ? 1 : 0.18 }}>
              <rect
                className="access-recolor"
                x={center - 36}
                y={253}
                width={72}
                height={24}
                style={{ fill: allows ? secondary : ink }}
              />
              <text
                className="access-recolor"
                x={center}
                y={270}
                textAnchor="middle"
                fontSize={badgeSize}
                {...displayLabel}
                style={{ fill: allows ? secondaryInk : denyInk }}
              >
                {allows ? 'ALLOW' : 'DENY'}
              </text>
            </g>
          </g>
        )
      })}

      <path d={`M ${before} 274 C ${before} 311 ${middle - 60} 330 ${middle - 39} 330`} fill="none" stroke={line} strokeWidth={1.5} />
      <path d={`M ${after} 274 C ${after} 311 ${middle + 60} 330 ${middle + 39} 330`} fill="none" stroke={line} strokeWidth={1.5} />
      {progress >= 0.43 && progress <= 0.68 && [beforeOutput, afterOutput].map((point, index) => {
        const allows = index === 1 && !fixed
        return (
          <g key={index} transform={`translate(${point.x} ${point.y})`}>
            <rect x={-34} y={-13} width={68} height={26} fill={allows ? secondary : ink} />
            <text x={0} y={5} textAnchor="middle" fontSize={badgeSize} {...displayLabel} fill={allows ? secondaryInk : denyInk}>
              {allows ? 'ALLOW' : 'DENY'}
            </text>
          </g>
        )
      })}

      <g transform={`translate(${middle} 331) scale(${1 + bump}) translate(${-middle} -331)`}>
        <rect x={middle - 39} y={305} width={78} height={52} fill={colors.face} stroke={line} />
        {/* Delta, drawn rather than typed: the glyph would pull in a whole
            extra font subset for one character. */}
        <path
          d={`M ${middle} 312 L ${middle + 9} 328 H ${middle - 9} Z`}
          fill="none"
          stroke={ink}
          strokeWidth={1.75}
          strokeLinejoin="miter"
        />
        <text x={middle} y={345} textAnchor="middle" fontSize={compact ? 13 : 12} {...displayLabel} fill={muted}>
          COMPARE
        </text>
      </g>
      <path d={`M ${middle} 357 V 397`} fill="none" stroke={line} strokeWidth={1.5} />
      {progress >= 0.72 && progress <= 0.83 && (
        <circle className="access-token" cx={middle} cy={357 + smooth((progress - 0.72) / 0.11) * 40} r={4} />
      )}

      <defs>
        <clipPath id={`access-report-clip-${variant}`}>
          <rect x={reportX - 1} y={396} width={reportWidth + 2} height={(reportHeight + 2) * reportFraction} />
        </clipPath>
      </defs>
      <g clipPath={`url(#access-report-clip-${variant})`}>
        <rect x={reportX} y={397} width={reportWidth} height={reportHeight} fill={reportFill} stroke={primary} strokeWidth={1.5} />
        <text x={reportX + 20} y={423} fontSize={compact ? 13 : 12} {...displayLabel} fill={reportMuted}>
          COUNTERBRANCH REPORT
        </text>
        <text x={reportX + 20} y={454} fontSize={compact ? 22 : 24} {...displayLabel} fill={reportInk}>
          {fixed ? 'DENY → DENY' : 'DENY → ALLOW'}
        </text>
        {compact ? (
          <text x={reportX + 20} y={483} fontSize={16} fontWeight={600} fill={reportInk}>
            <tspan x={reportX + 20}>{fixed ? 'The private document' : 'Viewer gained access to'}</tspan>
            <tspan x={reportX + 20} dy={22}>{fixed ? 'stays private.' : 'a private document.'}</tspan>
          </text>
        ) : (
          <text x={reportX + 20} y={483} fontSize={17} fontWeight={600} fill={reportInk}>
            {fixed ? 'The private document stays private.' : 'Viewer gained access to a private document.'}
          </text>
        )}
        <text x={reportX + 20} y={compact ? 532 : 512} fontSize={compact ? 13 : 12} fill={reportMuted}>
          {fixed ? 'Expected access restored' : 'Unexpected access · Expected: DENY'}
        </text>
      </g>
    </svg>
  )
}

/**
 * The same permission check run against both versions of the authorization
 * logic, animated once when the diagram scrolls into view. Joins the hero's
 * flush-left grid: the text column on the left edge, the diagram beside it.
 *
 * The first render is the finished picture (progress 1), so the prerendered
 * HTML and visitors without JavaScript see the complete comparison.
 */
export default function AccessComparison() {
  const host = useRef<HTMLDivElement | null>(null)
  const frame = useRef<number | null>(null)
  const lastTime = useRef<number | null>(null)
  const progressValue = useRef(1)
  const running = useRef(false)
  const startedOnce = useRef(false)
  const [progress, setProgress] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [fixed, setFixed] = useState(false)

  const stop = useCallback(() => {
    running.current = false
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = null
    lastTime.current = null
    setPlaying(false)
  }, [])

  const tick = useCallback(function advance(now: number) {
    if (!running.current) return
    if (lastTime.current !== null) {
      const next = Math.min(1, progressValue.current + (now - lastTime.current) / FLOW_MS)
      progressValue.current = next
      setProgress(next)
      if (next === 1) {
        running.current = false
        setPlaying(false)
        frame.current = null
        return
      }
    }
    lastTime.current = now
    frame.current = requestAnimationFrame(advance)
  }, [])

  const run = useCallback((restart: boolean) => {
    stop()
    startedOnce.current = true
    if (prefersReducedMotion()) {
      progressValue.current = 1
      setProgress(1)
      return
    }
    if (restart) {
      progressValue.current = 0
      setProgress(0)
    }
    running.current = true
    setPlaying(true)
    frame.current = requestAnimationFrame(tick)
  }, [stop, tick])

  // Plays once, the first time the diagram is properly on screen. If it starts
  // off screen, it is rewound to the beginning while nobody can see it, so the
  // run later starts from nothing instead of visibly resetting the finished
  // picture. With reduced motion it simply stays finished.
  useEffect(() => {
    const node = host.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    let firstReport = true
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const isFirst = firstReport
      firstReport = false
      if (startedOnce.current || prefersReducedMotion()) {
        observer.disconnect()
        return
      }
      if (entry.isIntersecting && entry.intersectionRatio >= START_THRESHOLD) {
        observer.disconnect()
        run(true)
      } else if (isFirst) {
        progressValue.current = 0
        setProgress(0)
      }
    }, { threshold: START_THRESHOLD })
    observer.observe(node)
    return () => observer.disconnect()
  }, [run])

  useEffect(() => {
    const onVisibility = () => { if (document.hidden && running.current) stop() }
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMotion = () => {
      if (!media.matches) return
      stop()
      progressValue.current = 1
      setProgress(1)
    }
    document.addEventListener('visibilitychange', onVisibility)
    media.addEventListener('change', onMotion)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      media.removeEventListener('change', onMotion)
      stop()
    }
  }, [stop])

  const finished = progress >= 0.98
  const phase = progress < 0.2 ? 'Running the same check' : progress < 0.42 ? 'Executing both versions' : progress < 0.7 ? 'Comparing decisions' : !finished ? 'Preparing the report' : fixed ? 'Expected access restored' : 'Unexpected access found'
  const replayLabel = playing ? 1 : progress > 0 && progress < 1 ? 2 : 0

  return (
    <Section id="how-it-works">
      <Container maxWidth="lg">
        {/* Intro, diagram, controls, in reading order. On phones they stack in
            that order, so the buttons and the status sit under the drawing
            they describe. From md the diagram spans both rows beside the text;
            the second row takes any extra height, which keeps the controls
            directly under the intro rather than spreading the two apart. */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateAreas: { xs: '"intro" "diagram" "controls"', md: '"intro diagram" "controls diagram"' },
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
              sx={{ fontSize: 'clamp(2.25rem, 1.6rem + 2vw, 3.25rem)' }}
            >
              See what access changed.
            </Typography>
            <Typography
              sx={{
                mt: 2.5,
                maxWidth: '34rem',
                fontSize: { xs: '1rem', md: '1.125rem' },
                color: 'text.secondary',
                textWrap: 'pretty',
              }}
            >
              Run the same permission check against both versions of your authorization logic.
            </Typography>
          </Box>

          <Box
            ref={host}
            sx={(theme) => ({
              gridArea: 'diagram',
              width: '100%',
              minWidth: 0,
              maxWidth: 720,
              containerType: 'inline-size',
              containerName: 'access-diagram',
              '& .access-token': {
                fill: theme.vars.palette.primary.dark,
                ...theme.applyStyles('dark', { fill: theme.vars.palette.primary.main }),
              },
              '& .access-badge': {
                transition: `opacity ${motionDuration.base}ms ${motionEasing.decel}`,
              },
              '& .access-recolor': {
                transition: `fill ${motionDuration.base}ms ${motionEasing.decel}`,
              },
              [REDUCED_MOTION]: {
                '& .access-badge, & .access-recolor': { transition: 'none' },
              },
            })}
          >
            <Box sx={{ display: 'none', [WIDE_DIAGRAM]: { display: 'block' } }}>
              <ComparisonDiagram compact={false} fixed={fixed} progress={progress} />
            </Box>
            <Box sx={{ display: 'block', maxWidth: 380, [WIDE_DIAGRAM]: { display: 'none' } }}>
              <ComparisonDiagram compact fixed={fixed} progress={progress} />
            </Box>
          </Box>

          <Box sx={{ gridArea: 'controls' }}>
            <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="inherit"
                size="medium"
                onClick={() => { setFixed((current) => !current); run(true) }}
                sx={(theme) => ({
                  minHeight: 44,
                  backgroundColor: theme.vars.palette.hero.plate,
                  color: theme.vars.palette.hero.plateInk,
                  // The ink flips with the fill on hover, so it fades with it.
                  transition: theme.transitions.create(['transform', 'background-color', 'color'], {
                    duration: motionDuration.fast,
                    easing: motionEasing.decel,
                  }),
                  '&:hover': {
                    backgroundColor: theme.vars.palette.secondary.dark,
                    color: theme.vars.palette.common.white,
                  },
                  // The inset ring follows the label's ink. Restated for the
                  // dark scheme so the theme's dark focus outline cannot win.
                  '&.Mui-focusVisible, &:focus-visible': {
                    outline: '2px solid currentColor',
                    outlineOffset: -4,
                    boxShadow: `0 0 0 2px ${theme.vars.palette.text.primary}`,
                    ...theme.applyStyles('dark', { outline: '2px solid currentColor' }),
                  },
                })}
              >
                <StableLabel labels={['Show the fix', 'Show regression']} active={fixed ? 1 : 0} />
              </Button>
              {/* Does nothing when motion is reduced (the flow is always shown
                  finished), so it is not offered then. */}
              <Button
                variant="outlined"
                size="medium"
                onClick={() => (playing ? stop() : run(progress >= 1))}
                sx={{ minHeight: 44, [REDUCED_MOTION]: { display: 'none' } }}
              >
                <StableLabel labels={['Replay flow', 'Pause', 'Resume']} active={replayLabel} />
              </Button>
            </Stack>
            <Typography component="p" sx={{ ...statusSx, mt: 2 }}>
              <StatusMarker tone={finished && !fixed ? 'secondary' : 'primary'} pulsing={playing && !finished} />
              {phase}
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 3, maxWidth: '40ch', color: 'text.secondary', letterSpacing: 'normal', textWrap: 'pretty' }}
            >
              Illustrative prepared test case. The comparison covers the cases you run.
            </Typography>
          </Box>
        </Box>
        <Box aria-live="polite" sx={visuallyHidden}>
          {finished ? fixed ? 'Both versions deny access. Expected access restored.' : 'Access changed from deny to allow. A viewer gained access to a private document.' : ''}
        </Box>
      </Container>
    </Section>
  )
}
