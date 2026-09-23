import { useEffect, useRef, useState } from 'react'
import type { ReactNode, Ref } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import Section from './Section.tsx'
import { AccessGrid } from './AccessGrid.tsx'
import { displayFont } from '../theme.ts'
import { pageColumn, rhythm } from '../rhythm.ts'
import {
  arrivalSx,
  glyphIn,
  motionDuration,
  motionEasing,
  slideIn,
  stampIn,
  type RunPhase,
} from '../motion.ts'

export const MONO_FONT = 'ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'

/**
 * The window's inks are mixed from its own text colour, so they follow the
 * scheme without a mode check: secondary text, and the title bar one step
 * lighter than the body.
 */
export const MUTED = 'color-mix(in srgb, currentColor 60%, transparent)'
const TITLE_BAR = 'color-mix(in srgb, currentColor 8%, transparent)'
/** A hairline in the window's own ink, between the two versions. */
const PANE_RULE = '1px solid color-mix(in srgb, currentColor 14%, transparent)'

/**
 * Close, minimise and zoom. The windows depict real macOS windows, so these
 * keep the system's own colours rather than the theme's.
 */
const TRAFFIC_LIGHTS = ['#FF5F57', '#FEBC2E', '#28C840'] as const

/** Set on each window, so what sits inside can reuse its ground and ink. */
const WINDOW_GROUND = 'var(--mac-window-ground)'
const WINDOW_INK = 'var(--mac-window-ink)'

/** Share of the run window that must be on screen before it plays. */
const START_THRESHOLD = 0.3

/** When each part of the run starts, in ms. */
const MAIN_CHECK_DELAY = 0
const HEAD_CHECK_DELAY = 150
const DENY_DELAY = 600
const ALLOW_DELAY = 850
const SUMMARY_DELAY = 1200

/** Just after the summary finishes arriving. */
const RUN_MS = SUMMARY_DELAY + motionDuration.base + 60

/**
 * A macOS window: the only rounded shapes on the site, because they depict a
 * real object. Ink with white text in the light scheme, like the hero's reel
 * window; the raised surface inside a divider in the dark one. Both grounds
 * are dark, so the brand cyan and pink read on either. The title bar is
 * decoration; `label` names the window for assistive technology. `fill`
 * makes it take its grid cell's full height, with its content in a column,
 * so windows side by side end on one line. `onDark` is for a window on a
 * dark band, where the ink ground would merge into the band: it takes a
 * light hairline and a black shadow instead, and in the dark scheme sits
 * recessed on the page's near-black. `glow` tints the window's shadow with a
 * colour, easing between colours as it changes.
 */
export function MacWindow({
  title,
  label,
  ref,
  fill = false,
  onDark = false,
  glow,
  children,
}: {
  title: string
  label: string
  ref?: Ref<HTMLElement>
  fill?: boolean
  onDark?: boolean
  glow?: string
  children: ReactNode
}) {
  const glowShadow = glow && `0 30px 70px -34px color-mix(in srgb, ${glow} 80%, transparent)`
  const theme = useTheme()
  const palette = theme.vars.palette
  return (
    <Box
      ref={ref}
      component="figure"
      aria-label={label}
      sx={{
        '--mac-window-ground': palette.hero.plate,
        '--mac-window-ink': palette.hero.plateInk,
        m: 0,
        ...(fill && { height: '100%', display: 'flex', flexDirection: 'column' }),
        // A string: sx multiplies a bare number by the theme's square
        // radius, which would leave the corners at 0.
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: WINDOW_GROUND,
        backgroundColor: WINDOW_GROUND,
        color: WINDOW_INK,
        boxShadow: `0 24px 48px -28px color-mix(in srgb, ${palette.hero.plate} 55%, transparent)`,
        ...(onDark && {
          borderColor: palette.bands.navy.line,
          boxShadow: `0 28px 56px -30px color-mix(in srgb, ${palette.common.black} 85%, transparent)`,
        }),
        ...(glowShadow && {
          boxShadow: glowShadow,
          transition: `box-shadow ${motionDuration.base}ms ${motionEasing.decel}`,
        }),
        // One dark-scheme block: applyStyles returns the same selector key each
        // time, so a second spread would replace the first rather than add to it.
        ...theme.applyStyles('dark', {
          '--mac-window-ground': onDark ? palette.background.default : palette.background.paper,
          '--mac-window-ink': palette.text.primary,
          borderColor: palette.divider,
          boxShadow:
            glowShadow ?? `0 24px 48px -28px color-mix(in srgb, ${palette.common.black} 80%, transparent)`,
        }),
      }}
    >
      <Box
        aria-hidden
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          columnGap: 1.5,
          flexShrink: 0,
          height: 38,
          px: '14px',
          backgroundColor: TITLE_BAR,
          ...theme.applyStyles('dark', {
            borderBottom: '1px solid',
            borderColor: palette.divider,
          }),
        }}
      >
        <Box sx={{ display: 'flex', gap: '8px' }}>
          {TRAFFIC_LIGHTS.map((light) => (
            <Box
              key={light}
              sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: light }}
            />
          ))}
        </Box>
        <Box
          component="span"
          sx={{
            fontFamily: MONO_FONT,
            fontSize: '0.75rem',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            color: MUTED,
          }}
        >
          {title}
        </Box>
      </Box>
      {children}
    </Box>
  )
}

/** The text inside a window: wraps rather than scrolls sideways. */
const windowTextSx = {
  m: 0,
  fontFamily: MONO_FONT,
  lineHeight: 1.65,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
} as const

/** One line of the diff, run edge to edge so its tint reads as a row. */
function DiffRow({ tint, children }: { tint?: string; children: string }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        width: '100%',
        px: 3,
        ...(tint && { backgroundColor: `color-mix(in srgb, ${tint}, transparent)` }),
      }}
    >
      {children}
    </Box>
  )
}

/**
 * The strip along a window's foot that says what the window tells you about
 * access. Both windows end in one, so the two answers sit on the same line.
 */
function ImpactBar({ muted = false, children }: { muted?: boolean; children: ReactNode }) {
  const theme = useTheme()
  return (
    <Box
      sx={{
        mt: 'auto',
        px: 3,
        py: 1.25,
        fontFamily: MONO_FONT,
        fontSize: { xs: '0.8125rem', xl: '0.9375rem' },
        lineHeight: 1.5,
        whiteSpace: 'pre-wrap',
        ...(muted && { color: MUTED }),
        backgroundColor: TITLE_BAR,
        ...theme.applyStyles('dark', {
          borderTop: '1px solid',
          borderColor: theme.vars.palette.divider,
        }),
      }}
    >
      {children}
    </Box>
  )
}

/** A small label over a window, in the band's muted ink. */
function Caption({ children }: { children: ReactNode }) {
  const band = useTheme().vars.palette.bands.navy
  return (
    <Typography
      variant="body2"
      sx={{ mb: 1.5, fontSize: { xl: '1rem' }, color: band.inkMuted }}
    >
      {children}
    </Typography>
  )
}

/**
 * One version's half of the run window: the check slides in, then its
 * decision stamps in under it at display size, in the decision's colour with
 * its mark beside it: the same colour and mark pairing as the access grid's
 * callout. A rule in that colour runs down the pane to the badge.
 */
function VersionPane({
  phase,
  side,
  version,
  checkDelay,
  decision,
  decisionDelay,
  allowed,
}: {
  phase: RunPhase
  side: string
  version: string
  checkDelay: number
  decision: string
  decisionDelay: number
  allowed: boolean
}) {
  const palette = useTheme().vars.palette
  // On the window's dark ground, full-strength pink is under 4.5:1 as text;
  // the lighter member of the family reads there.
  const wordInk = allowed ? palette.primary.main : palette.secondary.light
  const badgeFill = allowed ? palette.primary.main : palette.secondary.main
  const badgeInk = allowed ? palette.primary.contrastText : palette.secondary.contrastText
  const Mark = allowed ? CheckIcon : CloseIcon
  return (
    <Box
      sx={{
        minWidth: 0,
        px: 2.5,
        py: 2.5,
        display: 'grid',
        gridTemplateColumns: '22px minmax(0, 1fr)',
        columnGap: 1.5,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ width: 2, flexGrow: 1, mb: 1, backgroundColor: badgeFill }} />
        <Box
          aria-hidden
          sx={{
            width: 22,
            height: 22,
            display: 'grid',
            placeItems: 'center',
            backgroundColor: badgeFill,
            color: badgeInk,
            // Level with the middle of the decision word's line.
            mb: 'calc(clamp(1.75rem, 1.2rem + 1.4vw, 3rem) * 0.55 - 11px)',
          }}
        >
          <Mark sx={{ fontSize: 18 }} />
        </Box>
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Box
          component="p"
          sx={{ ...windowTextSx, fontSize: { xs: '0.75rem', xl: '0.875rem' }, color: MUTED }}
        >
          {`${side}: ${version}`}
        </Box>
        <Box
          component="p"
          sx={{
            ...windowTextSx,
            mt: 1,
            fontSize: { xs: '0.8125rem', xl: '0.9375rem' },
            ...arrivalSx(phase, slideIn, checkDelay),
          }}
        >
          check viewer → read private-document
        </Box>
        <Box
          component="p"
          sx={{
            m: 0,
            mt: 2,
            display: 'inline-block',
            fontFamily: displayFont,
            fontSize: 'clamp(1.75rem, 1.2rem + 1.4vw, 3rem)',
            fontWeight: 700,
            letterSpacing: '0.07em',
            lineHeight: 1.1,
            transformOrigin: '0 50%',
            color: wordInk,
            ...arrivalSx(phase, stampIn, decisionDelay),
          }}
        >
          {decision}
        </Box>
      </Box>
    </Box>
  )
}

/**
 * The navy band after "how it works": the access grid of every check with the
 * one that changed, then a code review tool's view of the change beside what
 * Counterbranch runs. The two windows mirror each other and end
 * on the same line, each with an "Access impact" strip along its foot: the
 * diff's says it is not shown; the run's shows the decision that changed.
 * The diff is static; it is what a reviewer already has. The run plays once,
 * the first time it is properly on screen: the same check lands in both
 * versions, each decision stamps in, and the change is summed up under them.
 *
 * The first render is the finished run, so the prerendered HTML and visitors
 * without JavaScript see all of it. Motion is CSS keyframes restarted by
 * remounting (`key={runKey}`); React only changes phase at the start and end
 * of the run.
 */
export default function DiffVersusRun() {
  const palette = useTheme().vars.palette
  const band = palette.bands.navy
  const runPane = useRef<HTMLElement | null>(null)
  const [runKey, setRunKey] = useState(0)
  const [phase, setPhase] = useState<RunPhase>('idle')

  // Watches the run window rather than the whole strip: on phones it sits well
  // below the heading, and a run started from the heading would play out
  // unseen. Armed only if it starts off screen, so it never visibly empties.
  useEffect(() => {
    const node = runPane.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    let firstReport = true
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        const isFirst = firstReport
        firstReport = false
        if (entry.isIntersecting && entry.intersectionRatio >= START_THRESHOLD) {
          observer.disconnect()
          setPhase('playing')
          setRunKey((key) => key + 1)
        } else if (isFirst && !entry.isIntersecting) {
          setPhase('armed')
        }
      },
      { threshold: START_THRESHOLD },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // Settles the run back to idle once its summary has arrived.
  useEffect(() => {
    if (phase !== 'playing') return
    const id = window.setTimeout(() => setPhase('idle'), RUN_MS)
    return () => window.clearTimeout(id)
  }, [phase])

  // The verdict sits on the window's footer strip, where full-strength pink is
  // under 4.5:1; the lighter member of the family reads there in both schemes.
  const verdictSx = { fontWeight: 700, color: palette.secondary.light }

  return (
    <Section id="more-than-a-diff" tone="navy">
      <Container maxWidth={false} sx={pageColumn} data-strip="diff-vs-run">
        {/* The claim and the graph that draws it, side by side from lg. */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 5fr) minmax(0, 7fr)' },
            columnGap: 8,
            rowGap: rhythm.intro,
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography
              variant="h2"
              component="h2"
              sx={{ fontSize: 'clamp(2rem, 1.2rem + 2.8vw, 4.5rem)' }}
            >
              More than a diff.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mt: rhythm.heading,
                maxWidth: '46ch',
                fontSize: { md: '1.125rem', xl: '1.25rem' },
                color: band.inkMuted,
                textWrap: 'pretty',
              }}
            >
              Counterbranch runs the same permission checks against your before-and-after
              authorization logic and shows what became allowed or denied. A diff shows what changed
              in the rules. An executed comparison shows what changed in access.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: { lg: 'flex-end' } }}>
            <AccessGrid />
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 2fr) minmax(0, 3fr)' },
            // One caption row over one window row: from lg both captions share
            // a line, and both windows stretch to the taller one's foot. Below
            // lg the run window would be too narrow for its check to sit on
            // one line, so the two stack.
            gridTemplateRows: { lg: 'auto 1fr' },
            gridAutoFlow: { lg: 'column' },
            columnGap: 4,
            mt: rhythm.intro,
          }}
        >
          <Caption>What a code review tool sees</Caption>
          <Box sx={{ minWidth: 0 }}>
            <MacWindow
              title="policy.rego — review"
              label="Policy diff as a review tool shows it"
              fill
              onDark
            >
              <Box
                component="pre"
                sx={{ ...windowTextSx, py: 2.5, fontSize: { xs: '0.875rem', xl: '1rem' } }}
              >
                <DiffRow>{'  allow {'}</DiffRow>
                {'\n'}
                <DiffRow tint={`${palette.secondary.main} 18%`}>
                  {'-   input.user.role == "viewer"'}
                </DiffRow>
                {'\n'}
                <DiffRow tint={`${palette.secondary.main} 18%`}>{'-   input.document.public'}</DiffRow>
                {'\n'}
                <DiffRow tint={`${palette.primary.main} 14%`}>
                  {'+   input.user.role == "viewer"'}
                </DiffRow>
                {'\n'}
                <DiffRow>{'  }'}</DiffRow>
              </Box>
              <ImpactBar muted>Access impact: not shown</ImpactBar>
            </MacWindow>
          </Box>

          <Box sx={{ mt: { xs: 5, lg: 0 } }}>
            <Caption>What Counterbranch runs</Caption>
          </Box>
          <Box ref={runPane} sx={{ minWidth: 0 }}>
            <MacWindow
              title="counterbranch — compare"
              label="The same check run against main and pr-142"
              fill
              onDark
            >
              <Box
                key={runKey}
                sx={{
                  flexGrow: 1,
                  display: 'grid',
                  gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
                  '& > :nth-of-type(2)': {
                    borderTop: { xs: PANE_RULE, sm: 'none' },
                    borderLeft: { sm: PANE_RULE },
                  },
                }}
              >
                <VersionPane
                  phase={phase}
                  side="Before"
                  version="main"
                  checkDelay={MAIN_CHECK_DELAY}
                  decision="DENY"
                  decisionDelay={DENY_DELAY}
                  allowed={false}
                />
                <VersionPane
                  phase={phase}
                  side="After"
                  version="pr-142"
                  checkDelay={HEAD_CHECK_DELAY}
                  decision="ALLOW"
                  decisionDelay={ALLOW_DELAY}
                  allowed
                />
              </Box>
              <ImpactBar>
                <Box
                  key={runKey}
                  component="span"
                  sx={{ display: 'inline-block', ...arrivalSx(phase, glyphIn, SUMMARY_DELAY) }}
                >
                  <Box component="span" sx={{ color: MUTED }}>
                    {'Access impact: '}
                  </Box>
                  {'1 decision changed   DENY → '}
                  <Box component="span" sx={verdictSx}>
                    ALLOW
                  </Box>
                  {'   '}
                  <Box component="span" sx={verdictSx}>
                    VIOLATION
                  </Box>
                </Box>
              </ImpactBar>
            </MacWindow>
          </Box>
        </Box>
      </Container>
    </Section>
  )
}
