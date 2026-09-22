import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import Section from './Section.tsx'
import {
  caretBlink,
  caretOut,
  caretTravel,
  glyphIn,
  lineIn,
  motionDuration,
  motionEasing,
  stampIn,
  typeOn,
} from '../motion.ts'

/**
 * idle: the finished run, no animation. What the server renders and what
 *   every run settles back to.
 * armed: every line hidden, ready to play. Only ever set while the terminal
 *   is off screen, so nobody sees it empty out.
 * playing: the command is typed, its output arrives a line at a time, and the
 *   one changed decision stamps in.
 */
type Phase = 'idle' | 'armed' | 'playing'

/** Share of the terminal that must be on screen before the first run plays. */
const START_THRESHOLD = 0.35

/** About one step per character of the 71-character command. */
const TYPE_STEPS = 72

/** When each part of a run starts, in ms. */
const ENTER_DELAY = 1100
const PREPARE_DELAY = 1150
const MAIN_READY_DELAY = 1700
const HEAD_READY_DELAY = 2100
const PREPARE_TIME_DELAY = 2350
const RUN_DELAY = 2500
const MAIN_COUNT_DELAY = 2850
const HEAD_COUNT_DELAY = 3150
const COMPARE_DELAY = 3450
const CHANGE_DELAY = 3950
const VERDICT_DELAY = 4300
const PROMPT_DELAY = 4600
/** Once the prompt line has landed (4600 + 240). */
const BLINK_DELAY = 4850

/** Just after the last line finishes arriving. */
const RUN_MS = 4900

/**
 * The cursor blinks for under five seconds and then rests on, so the page
 * never carries a blink that runs on unattended (WCAG 2.2.2).
 */
const BLINK_CYCLES = 4

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'

const MONO_FONT = 'ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'

/**
 * The terminal's inks are mixed from its own text colour, so they follow the
 * scheme without a mode check: secondary text, the title bar's rule, and the
 * scrollbar thumb.
 */
const MUTED = 'color-mix(in srgb, currentColor 60%, transparent)'
const HAIRLINE = 'color-mix(in srgb, currentColor 12%, transparent)'
const THUMB = 'color-mix(in srgb, currentColor 30%, transparent)'

const muted = { color: MUTED }
const strong = { fontWeight: 700 }

type Keyframes = typeof lineIn

/**
 * A part of the transcript arriving `delay` ms into a run. Hidden while
 * armed; during a run, `both` fill keeps it hidden until its delay.
 */
function arrival(phase: Phase, keyframes: Keyframes, delay: number) {
  return {
    ...(phase === 'armed' && { opacity: 0 }),
    ...(phase === 'playing' && {
      animation: `${keyframes} ${motionDuration.base}ms ${motionEasing.decel} ${delay}ms both`,
    }),
    [REDUCED_MOTION]: { animation: 'none', opacity: 1, transform: 'none' },
  }
}

/**
 * One line of output. Inline-block so it can rise into place while the real
 * newline after it still ends the line, which keeps the prerendered text a
 * faithful transcript without styles.
 */
function Line({ phase, delay, children }: { phase: Phase; delay: number; children: ReactNode }) {
  return (
    <Box component="span" sx={{ display: 'inline-block', ...arrival(phase, lineIn, delay) }}>
      {children}
    </Box>
  )
}

/** The step marker that opens each stage. Decoration, so not read out. */
function Step() {
  const palette = useTheme().vars.palette
  return (
    <Box component="span" aria-hidden sx={{ color: palette.primary.main }}>
      ▸
    </Box>
  )
}

/** A version's isolated instance reporting ready. */
function Ready({ phase, delay }: { phase: Phase; delay: number }) {
  const palette = useTheme().vars.palette
  return (
    <Box
      component="span"
      sx={{ color: palette.primary.main, ...strong, ...arrival(phase, glyphIn, delay) }}
    >
      ✓
    </Box>
  )
}

/**
 * What the run is for: the decision that changed, in brand pink. Inline-block
 * so it can stamp in at its own scale.
 */
function Flag({ phase, children }: { phase: Phase; children: ReactNode }) {
  const palette = useTheme().vars.palette
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        color: palette.secondary.main,
        ...strong,
        ...arrival(phase, stampIn, VERDICT_DELAY),
      }}
    >
      {children}
    </Box>
  )
}

/**
 * The command at the prompt, typed a character per step. A caret rides a
 * track laid over the typed text and crosses it in the same steps, so it sits
 * on the edge of the reveal. Phones wrap the command, where the reveal becomes
 * a plain wipe, so the caret is left out there.
 */
function Command({ phase }: { phase: Phase }) {
  const theme = useTheme()
  const typing = `${motionDuration.typing}ms steps(${TYPE_STEPS})`
  return (
    <Box component="span" sx={{ position: 'relative', display: 'inline-block' }}>
      <Box
        component="span"
        sx={{
          display: 'block',
          ...(phase === 'armed' && { clipPath: 'inset(0 100% 0 0)' }),
          ...(phase === 'playing' && { animation: `${typeOn} ${typing} both` }),
          [REDUCED_MOTION]: { animation: 'none', clipPath: 'none' },
        }}
      >
        <Box component="span" aria-hidden sx={muted}>
          $
        </Box>
        {' '}
        <Box component="span" sx={strong}>
          counterbranch compare
        </Box>
        {' --base main --head pr-142 --tests ./authz-tests'}
      </Box>
      {phase === 'playing' && (
        <Box
          component="span"
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            animation: `${caretTravel} ${typing} both, ${caretOut} 1ms linear ${ENTER_DELAY}ms forwards`,
            [theme.breakpoints.down('sm')]: { display: 'none' },
            [REDUCED_MOTION]: { display: 'none' },
          }}
        >
          <Box component="span" sx={{ position: 'absolute', top: 0, left: 0 }}>
            ▮
          </Box>
        </Box>
      )}
    </Box>
  )
}

/**
 * The same permission check run against both versions of the authorization
 * logic, shown as the CLI run that does it: the command is typed, both
 * isolated instances come up, the prepared tests run against each, and the
 * comparison reports the one decision that changed. "Replay run" plays it
 * again.
 *
 * The first render is the finished run, so the prerendered HTML and visitors
 * without JavaScript see the whole transcript. Motion is CSS keyframes
 * restarted by remounting (`key={runKey}`); React only changes phase at the
 * start and end of a run.
 */
export default function CompareTerminal() {
  const theme = useTheme()
  const palette = theme.vars.palette
  const terminal = useRef<HTMLElement | null>(null)
  const played = useRef(false)
  const [runKey, setRunKey] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')

  const play = useCallback(() => {
    played.current = true
    setPhase('playing')
    setRunKey((key) => key + 1)
  }, [])

  // Plays once, the first time the terminal is properly on screen. If it
  // starts off screen it is armed there, so the run later starts from an empty
  // terminal instead of visibly clearing the finished one first. Without the
  // observer it simply stays finished.
  useEffect(() => {
    const node = terminal.current
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

  // Settles each run back to idle once its last line has arrived. A new run
  // (or unmounting) clears the pending one.
  useEffect(() => {
    if (phase !== 'playing') return
    const id = window.setTimeout(() => setPhase('idle'), RUN_MS)
    return () => window.clearTimeout(id)
  }, [phase, runKey])

  const secondaryText = { color: palette.text.secondary }

  // The action is outlined in the section's own ink rather than a brand
  // colour, so it never reads as the page's primary action.
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

  // The cursor's blink belongs to a run: it is set once a run starts and kept
  // unchanged when the run settles, so settling never restarts it.
  const cursorSx = {
    ...(runKey > 0 && {
      animation: `${caretBlink} ${motionDuration.blink}ms steps(2, jump-none) ${BLINK_DELAY}ms ${BLINK_CYCLES}`,
    }),
    [REDUCED_MOTION]: { animation: 'none' },
  }

  return (
    <Section id="how-it-works">
      <Container maxWidth="lg">
        {/* Intro, terminal, action, in reading order. On phones they stack in
            that order, so the action sits under the run it replays. From lg
            the terminal spans both rows beside the text, and the second row
            takes any spare height so the action stays under the intro. */}
        <Box
          sx={{
            display: 'grid',
            // Two columns only from lg: below that the terminal column would be
            // narrower than its 71-character lines and hide the finding.
            gridTemplateAreas: { xs: '"intro" "terminal" "aside"', lg: '"intro terminal" "aside terminal"' },
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 400px) minmax(0, 1fr)' },
            gridTemplateRows: { lg: 'auto 1fr' },
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
              sx={{ mt: 2.5, maxWidth: '40ch', ...secondaryText, textWrap: 'pretty' }}
            >
              Run the same permission check against both versions of your authorization logic.
            </Typography>
          </Box>

          {/* Ink with white text in the light scheme, like the hero's reel
              window; the raised surface under a divider in the dark one. Both
              grounds are dark, so the brand cyan and pink read on either. */}
          <Box
            ref={terminal}
            component="figure"
            aria-label="Example compare run"
            sx={{
              gridArea: 'terminal',
              minWidth: 0,
              m: 0,
              border: '1px solid',
              borderColor: palette.hero.plate,
              backgroundColor: palette.hero.plate,
              color: palette.hero.plateInk,
              ...theme.applyStyles('dark', {
                borderColor: palette.divider,
                backgroundColor: palette.background.paper,
                color: palette.text.primary,
              }),
            }}
          >
            <Box
              aria-hidden
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                height: 36,
                px: 2,
                borderBottom: '1px solid',
                borderColor: HAIRLINE,
                ...theme.applyStyles('dark', { borderColor: palette.divider }),
              }}
            >
              <Box sx={{ display: 'flex', gap: '6px' }}>
                {[0, 1, 2].map((square) => (
                  <Box key={square} sx={{ width: 8, height: 8, backgroundColor: MUTED }} />
                ))}
              </Box>
              <Box
                component="span"
                sx={{ fontFamily: MONO_FONT, fontSize: '0.75rem', lineHeight: 1, ...muted }}
              >
                counterbranch
              </Box>
            </Box>

            {/* Focusable, so the transcript can be scrolled from the keyboard
                where its lines are wider than the column. */}
            <Box
              key={runKey}
              component="pre"
              sx={{
                m: 0,
                px: 3,
                py: 2.5,
                fontFamily: MONO_FONT,
                fontSize: '0.875rem',
                lineHeight: 1.65,
                // Wrap rather than scroll sideways, so no part of the run is
                // ever off-screen.
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
                scrollbarWidth: 'thin',
                scrollbarColor: `${THUMB} transparent`,
                '&:focus-visible': {
                  outline: `2px solid ${palette.primary.main}`,
                  outlineOffset: -2,
                },
              }}
            >
              <Command phase={phase} />
              {'\n'}
              <Line phase={phase} delay={PREPARE_DELAY}>
                <Step />
                {' Preparing isolated instances      main '}
                <Ready phase={phase} delay={MAIN_READY_DELAY} />
                {'   pr-142 '}
                <Ready phase={phase} delay={HEAD_READY_DELAY} />
                {'        '}
                <Box component="span" sx={{ ...muted, ...arrival(phase, glyphIn, PREPARE_TIME_DELAY) }}>
                  4.1s
                </Box>
              </Line>
              {'\n'}
              <Line phase={phase} delay={RUN_DELAY}>
                <Step />
                {' Running 128 prepared authorization tests against both'}
              </Line>
              {'\n'}
              <Line phase={phase} delay={MAIN_COUNT_DELAY}>
                {'  '}
                <Box component="span" sx={strong}>
                  main
                </Box>
                {'     128/128    '}
                <Box component="span" sx={muted}>
                  allow 41
                </Box>
                {'   '}
                <Box component="span" sx={muted}>
                  deny 87
                </Box>
              </Line>
              {'\n'}
              <Line phase={phase} delay={HEAD_COUNT_DELAY}>
                {'  '}
                <Box component="span" sx={strong}>
                  pr-142
                </Box>
                {'   128/128    '}
                <Box component="span" sx={muted}>
                  allow 42
                </Box>
                {'   '}
                <Box component="span" sx={muted}>
                  deny 86
                </Box>
              </Line>
              {'\n'}
              <Line phase={phase} delay={COMPARE_DELAY}>
                <Step />
                {' Comparing decisions'}
              </Line>
              {'\n'}
              <Line phase={phase} delay={CHANGE_DELAY}>
                {'  '}
                <Box component="span" sx={strong}>
                  1 change
                </Box>
                {'   '}
                <Box component="span" sx={strong}>
                  DENY
                </Box>
                {' '}
                <Box component="span" sx={muted}>
                  →
                </Box>
                {' '}
                <Flag phase={phase}>ALLOW</Flag>
                {'   viewer → read private-document   '}
                <Flag phase={phase}>unexpected</Flag>
              </Line>
              {'\n'}
              <Line phase={phase} delay={PROMPT_DELAY}>
                <Box component="span" aria-hidden sx={cursorSx}>
                  ▮
                </Box>
              </Line>
            </Box>
          </Box>

          <Box
            sx={{
              gridArea: 'aside',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 2,
            }}
          >
            {/* Replaying does nothing visible without motion, so the control
                goes with it. */}
            <Button
              variant="outlined"
              color="inherit"
              onClick={play}
              sx={{ ...outlinedButtonSx, [REDUCED_MOTION]: { display: 'none' } }}
            >
              Replay run
            </Button>
            <Typography
              variant="body2"
              sx={{ maxWidth: '40ch', ...secondaryText, textWrap: 'pretty' }}
            >
              Illustrative prepared test case. The comparison covers the cases you run.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Section>
  )
}
