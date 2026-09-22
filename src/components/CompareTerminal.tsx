import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import Section from './Section.tsx'
import DiffVersusRun, { MacWindow, MONO_FONT, MUTED } from './DiffVersusRun.tsx'
import {
  arrivalSx,
  caretBlink,
  caretOut,
  caretTravel,
  glyphIn,
  lineIn,
  motionDuration,
  motionEasing,
  stampIn,
  typeOn,
  type RunPhase,
} from '../motion.ts'

/**
 * In a run, two comments say what it is for, the command is typed, its
 * output arrives a line at a time, the one changed decision stamps in, and
 * two more comments say what it means.
 */
type Phase = RunPhase

/** Share of the terminal that must be on screen before the first run plays. */
const START_THRESHOLD = 0.35

/** About one step per character of the 71-character command. */
const TYPE_STEPS = 72

/** How far apart the lines of output arrive, in ms. */
const LINE_STEP = 350

/** When each part of a run starts, in ms. The two opening comments come first. */
const PURPOSE_DELAY = 0
const VERSIONS_DELAY = 250
/** Typing starts once both opening comments are in. */
const COMMAND_DELAY = 500
/** Typing ends at 1400; the command is entered a beat later. */
const ENTER_DELAY = 1600
/** The output, a line at a time, starting just after the command is entered. */
const LOAD_DELAY = ENTER_DELAY + 50
const MAIN_RUN_DELAY = LOAD_DELAY + LINE_STEP
const HEAD_RUN_DELAY = MAIN_RUN_DELAY + LINE_STEP
const COMPARE_DELAY = HEAD_RUN_DELAY + LINE_STEP
const CHANGE_DELAY = COMPARE_DELAY + LINE_STEP
/** The finding stamps in once its line is in. */
const VERDICT_DELAY = CHANGE_DELAY + LINE_STEP
/** The closing comments follow the finding's stamp. */
const MEANING_DELAY = VERDICT_DELAY + 350
const ACTION_DELAY = VERDICT_DELAY + 650
/** Once the last comment has landed. */
const CURSOR_DELAY = ACTION_DELAY + motionDuration.base + 60
/** Once the cursor has landed. */
const BLINK_DELAY = CURSOR_DELAY + motionDuration.base + 10

/** Just after the cursor, the last part of a run, finishes arriving. */
const RUN_MS = CURSOR_DELAY + motionDuration.base + 60

/**
 * The cursor blinks for under five seconds and then rests on, so the page
 * never carries a blink that runs on unattended (WCAG 2.2.2).
 */
const BLINK_CYCLES = 4

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'

const muted = { color: MUTED }
const strong = { fontWeight: 700 }

/**
 * One line of output. Inline-block so it can rise into place while the real
 * newline after it still ends the line, which keeps the prerendered text a
 * faithful transcript without styles.
 */
function Line({ phase, delay, children }: { phase: Phase; delay: number; children: ReactNode }) {
  return (
    <Box component="span" sx={{ display: 'inline-block', ...arrivalSx(phase, lineIn, delay) }}>
      {children}
    </Box>
  )
}

/**
 * A shell comment narrating the run, in the prompt's muted ink. Real text, so
 * it is read out with the rest of the transcript. Children follow it on the
 * same line.
 */
function Comment({
  phase,
  delay,
  text,
  children,
}: {
  phase: Phase
  delay: number
  text: string
  children?: ReactNode
}) {
  return (
    <Line phase={phase} delay={delay}>
      <Box component="span" sx={muted}>
        {`# ${text}`}
      </Box>
      {children}
    </Line>
  )
}

/**
 * The resting block cursor, at the end of the last line rather than on a row
 * of its own. It appears in place once the closing comments are in. Its blink
 * belongs to a run: set once a run starts and kept unchanged when the run
 * settles, so settling never restarts it.
 */
function Cursor({ phase, blinking }: { phase: Phase; blinking: boolean }) {
  return (
    <Box component="span" aria-hidden sx={arrivalSx(phase, glyphIn, CURSOR_DELAY)}>
      {' '}
      <Box
        component="span"
        sx={{
          ...(blinking && {
            animation: `${caretBlink} ${motionDuration.blink}ms steps(2, jump-none) ${BLINK_DELAY}ms ${BLINK_CYCLES}`,
          }),
          [REDUCED_MOTION]: { animation: 'none' },
        }}
      >
        ▮
      </Box>
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
        ...arrivalSx(phase, stampIn, VERDICT_DELAY),
      }}
    >
      {children}
    </Box>
  )
}

/**
 * The command at the prompt, typed a character per step once the opening
 * comments are in. A caret rides a track laid over the typed text and crosses
 * it in the same steps, so it sits on the edge of the reveal; it shows only
 * from the first keystroke. Phones wrap the command, where the reveal becomes
 * a plain wipe, so the caret is left out there.
 */
function Command({ phase }: { phase: Phase }) {
  const theme = useTheme()
  const typing = `${motionDuration.typing}ms steps(${TYPE_STEPS}) ${COMMAND_DELAY}ms`
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
          <Box
            component="span"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              animation: `${glyphIn} 1ms linear ${COMMAND_DELAY}ms both`,
            }}
          >
            ▮
          </Box>
        </Box>
      )}
    </Box>
  )
}

/**
 * The same permission check run against both versions of the authorization
 * logic, shown as the CLI run that does it in a macOS Terminal window: shell
 * comments say what the run is for, the command is typed, the prepared checks
 * load and execute against each version, the comparison reports the one
 * decision that changed, and two more comments say what that means. "Replay
 * run" plays it again. Under it, DiffVersusRun sets that run beside what a
 * code review tool shows of the same change.
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

  return (
    // The shared section padding is sized for the feature bands; this section
    // sits straight under the hero and carries its own inner spacing, so it
    // runs tighter.
    <Box sx={{ '& > section': { py: { xs: 10, md: 12 } } }}>
      <Section id="how-it-works">
        <Container maxWidth="lg">
          {/* Intro, terminal, action, in reading order. On phones they stack
              in that order, so the action sits under the run it replays. From
              lg the terminal spans both rows beside the text, and the second
              row takes any spare height so the action stays under the intro.
              The gaps are margins on the later items rather than a row gap,
              so no gap is left behind when the action is hidden. */}
          <Box
            sx={{
              display: 'grid',
              // Two columns only from lg: below that the terminal column would
              // be narrower than its 71-character lines and hide the finding.
              gridTemplateAreas: {
                xs: '"intro" "terminal" "aside"',
                lg: '"intro terminal" "aside terminal"',
              },
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 400px) minmax(0, 1fr)' },
              gridTemplateRows: { lg: 'auto 1fr' },
              columnGap: 8,
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

            <Box sx={{ gridArea: 'terminal', minWidth: 0, mt: { xs: 4, lg: 0 } }}>
              <MacWindow ref={terminal} title="counterbranch — zsh" label="Example compare run">
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
                    // Wrap rather than scroll sideways, so no part of the run
                    // is ever off-screen.
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                  }}
                >
                  <Comment
                    phase={phase}
                    delay={PURPOSE_DELAY}
                    text="Run the same permission checks against both versions of your authorization logic."
                  />
                  {'\n'}
                  <Comment
                    phase={phase}
                    delay={VERSIONS_DELAY}
                    text="main is what ships today; pr-142 is the change under review."
                  />
                  {'\n'}
                  <Command phase={phase} />
                  {'\n'}
                  <Line phase={phase} delay={LOAD_DELAY}>
                    <Step />
                    {' Loading 128 prepared permission checks         '}
                    <Box component="span" sx={muted}>
                      ./authz-tests
                    </Box>
                  </Line>
                  {'\n'}
                  <Line phase={phase} delay={MAIN_RUN_DELAY}>
                    <Step />{' '}
                    {/* One run per version: the whole stage is bold, which
                        keeps each version's name bold and its line one phrase. */}
                    <Box component="span" sx={strong}>
                      Executing against main
                    </Box>
                    {'       128/128    '}
                    <Box component="span" sx={muted}>
                      allow 41
                    </Box>
                    {'   '}
                    <Box component="span" sx={muted}>
                      deny 87
                    </Box>
                  </Line>
                  {'\n'}
                  <Line phase={phase} delay={HEAD_RUN_DELAY}>
                    <Step />{' '}
                    <Box component="span" sx={strong}>
                      Executing against pr-142
                    </Box>
                    {'     128/128    '}
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
                  <Comment
                    phase={phase}
                    delay={MEANING_DELAY}
                    text="One decision changed: a viewer can now read a private document."
                  />
                  {'\n'}
                  <Comment phase={phase} delay={ACTION_DELAY} text="Fix pr-142 before it merges.">
                    <Cursor phase={phase} blinking={runKey > 0} />
                  </Comment>
                </Box>
              </MacWindow>

              <Typography
                variant="body2"
                sx={{ mt: 2, maxWidth: '60ch', ...secondaryText, textWrap: 'pretty' }}
              >
                Demonstration only. This output is simulated to show the shape of a run and does not
                come from a live system. Command names and counts are illustrative.
                Counterbranch compares only the prepared authorization tests you run; it does not
                certify an application as secure.
              </Typography>
            </Box>

            {/* Replaying does nothing visible without motion, so the control
                goes with it, margin and all. */}
            <Box sx={{ gridArea: 'aside', mt: 4, [REDUCED_MOTION]: { display: 'none' } }}>
              <Button variant="outlined" color="inherit" onClick={play} sx={outlinedButtonSx}>
                Replay run
              </Button>
            </Box>
          </Box>

          <DiffVersusRun />
        </Container>
      </Section>
    </Box>
  )
}
