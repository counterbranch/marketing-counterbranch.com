import { useEffect, useRef, useState } from 'react'
import type { ReactNode, Ref } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { displayFont } from '../theme.ts'
import {
  arrivalSx,
  glyphIn,
  motionDuration,
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

/**
 * Close, minimise and zoom. The windows depict real macOS windows, so these
 * keep the system's own colours rather than the theme's.
 */
const TRAFFIC_LIGHTS = ['#FF5F57', '#FEBC2E', '#28C840'] as const

/** Set on each window, so what sits inside can reuse its ground and ink. */
const WINDOW_GROUND = 'var(--mac-window-ground)'
const WINDOW_INK = 'var(--mac-window-ink)'

/** Share of the run pane that must be on screen before it plays. */
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
 * decoration; `label` names the window for assistive technology.
 */
export function MacWindow({
  title,
  label,
  ref,
  children,
}: {
  title: string
  label: string
  ref?: Ref<HTMLElement>
  children: ReactNode
}) {
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
        // A string: sx multiplies a bare number by the theme's square
        // radius, which would leave the corners at 0.
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: WINDOW_GROUND,
        backgroundColor: WINDOW_GROUND,
        color: WINDOW_INK,
        boxShadow: `0 24px 48px -28px color-mix(in srgb, ${palette.hero.plate} 55%, transparent)`,
        ...theme.applyStyles('dark', {
          '--mac-window-ground': palette.background.paper,
          '--mac-window-ink': palette.text.primary,
          borderColor: palette.divider,
          boxShadow: `0 24px 48px -28px color-mix(in srgb, ${palette.common.black} 80%, transparent)`,
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

/** A small label over a pane or a window. */
function Caption({ children, mb }: { children: ReactNode; mb: number }) {
  const palette = useTheme().vars.palette
  return (
    <Typography variant="body2" sx={{ mb, color: palette.text.secondary }}>
      {children}
    </Typography>
  )
}

/**
 * One version's window in the run pane: the check slides in, then its
 * decision stamps in under it. `allowed` marks the decision the run is about.
 */
function RunWindow({
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
  return (
    <Box sx={{ minWidth: 0 }}>
      <Caption mb={1}>{side}</Caption>
      <MacWindow title={version} label={`Same check against ${version}`}>
        <Box component="pre" sx={{ ...windowTextSx, px: 2, py: 2, fontSize: '0.8125rem' }}>
          <Box
            component="span"
            sx={{ display: 'inline-block', ...arrivalSx(phase, slideIn, checkDelay) }}
          >
            check viewer → read private-document
          </Box>
          {'\n'}
          <Box
            component="span"
            sx={{
              display: 'inline-block',
              mt: 1.5,
              px: 1.5,
              py: 0.5,
              fontFamily: displayFont,
              fontSize: '1.125rem',
              fontWeight: 700,
              letterSpacing: '0.07em',
              lineHeight: 1.2,
              // The window's own inks, swapped; the changed decision in pink.
              backgroundColor: allowed ? palette.secondary.main : WINDOW_INK,
              color: allowed ? palette.secondary.contrastText : WINDOW_GROUND,
              ...arrivalSx(phase, stampIn, decisionDelay),
            }}
          >
            {decision}
          </Box>
        </Box>
      </MacWindow>
    </Box>
  )
}

/**
 * The second half of "how it works": a code review tool's view of the change
 * beside what Counterbranch runs. The diff is static; it is what a reviewer
 * already has. The run plays once, the first time it is properly on screen:
 * the same check lands in both versions, each decision stamps in, and the one
 * that changed is summed up under them.
 *
 * The first render is the finished run, so the prerendered HTML and visitors
 * without JavaScript see all of it. Motion is CSS keyframes restarted by
 * remounting (`key={runKey}`); React only changes phase at the start and end
 * of the run.
 */
export default function DiffVersusRun() {
  const theme = useTheme()
  const palette = theme.vars.palette
  const runPane = useRef<HTMLElement | null>(null)
  const [runKey, setRunKey] = useState(0)
  const [phase, setPhase] = useState<RunPhase>('idle')

  // Watches the run pane rather than the whole strip: on phones it sits well
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

  // Pink reads as text on the dark grounds only; on the light page the
  // readable member of the family carries it.
  const flagSx = {
    fontWeight: 700,
    color: palette.secondary.dark,
    ...theme.applyStyles('dark', { color: palette.secondary.main }),
  }

  return (
    <Box data-strip="diff-vs-run" sx={{ mt: { xs: 10, md: 12 } }}>
      <Typography
        variant="h3"
        component="h3"
        sx={{ fontSize: 'clamp(1.75rem, 1.2rem + 2vw, 2.75rem)' }}
      >
        More than a diff.
      </Typography>
      <Typography
        variant="body1"
        sx={{ mt: 2.5, maxWidth: '40ch', color: palette.text.secondary, textWrap: 'pretty' }}
      >
        Counterbranch runs the same permission checks against your before-and-after authorization
        logic and shows what became allowed or denied. A diff shows what changed in the rules. An
        executed comparison shows what changed in access.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' },
          gap: 4,
          alignItems: 'start',
          mt: 6,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Caption mb={1.5}>What a code review tool sees</Caption>
          <MacWindow title="policy.rego — review" label="Policy diff as a review tool shows it">
            <Box component="pre" sx={{ ...windowTextSx, py: 2, fontSize: '0.875rem' }}>
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
            <Box
              sx={{
                px: 3,
                py: 1.25,
                fontFamily: MONO_FONT,
                fontSize: '0.8125rem',
                lineHeight: 1.5,
                color: MUTED,
                backgroundColor: TITLE_BAR,
                ...theme.applyStyles('dark', {
                  borderTop: '1px solid',
                  borderColor: palette.divider,
                }),
              }}
            >
              Access impact: not shown
            </Box>
          </MacWindow>
        </Box>

        <Box ref={runPane} sx={{ minWidth: 0 }}>
          <Caption mb={1.5}>What Counterbranch runs</Caption>
          <Box key={runKey}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                alignItems: 'start',
              }}
            >
              <RunWindow
                phase={phase}
                side="Before"
                version="main"
                checkDelay={MAIN_CHECK_DELAY}
                decision="DENY"
                decisionDelay={DENY_DELAY}
                allowed={false}
              />
              <RunWindow
                phase={phase}
                side="After"
                version="pr-142"
                checkDelay={HEAD_CHECK_DELAY}
                decision="ALLOW"
                decisionDelay={ALLOW_DELAY}
                allowed
              />
            </Box>
            <Box
              component="p"
              sx={{
                ...windowTextSx,
                mt: 2.5,
                fontSize: '0.875rem',
                color: palette.text.primary,
                ...arrivalSx(phase, glyphIn, SUMMARY_DELAY),
              }}
            >
              {'1 decision changed   DENY → '}
              <Box component="span" sx={flagSx}>
                ALLOW
              </Box>
              {'   '}
              <Box component="span" sx={flagSx}>
                unexpected
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
