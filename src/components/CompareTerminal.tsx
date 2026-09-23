import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import Section from './Section.tsx'
import { MacWindow, MONO_FONT, MUTED } from './DiffVersusRun.tsx'
import { OutcomeGlyph } from './AccessGrid.tsx'
import { displayFont } from '../theme.ts'
import { pageColumn, rhythm } from '../rhythm.ts'
import { srOnly } from '../a11y.ts'
import {
  arrivalSx,
  caretBlink,
  nodeIn,
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
 * output arrives a line at a time, the verdict stamps in, and two more
 * comments say what it means.
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
const RESULT_DELAY = COMPARE_DELAY + LINE_STEP
/** The verdict stamps in once its line is in. */
const VERDICT_DELAY = RESULT_DELAY + LINE_STEP
/** The closing comments follow the verdict's stamp. */
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
 * What a run concludes. Each outcome keeps one colour everywhere it shows:
 * pink for a decision that changed, cyan for a clean run, the warning hue for
 * a check that could not finish.
 */
type Outcome = 'changed' | 'unchanged' | 'incomplete'

interface ExampleRun {
  outcome: Outcome
  /** The option's name, in the report's own words. */
  label: string
  /** One line under the option's name. */
  summary: string
  /** The version under review. */
  head: string
  /** The head version's executed, allowed and denied counts. */
  headCounts: { run: string; allow: number; deny: number }
  /** The comparison's result line; `verdict` wraps the part that stamps in. */
  result: (verdict: (text: string) => ReactNode) => ReactNode
  /** The two closing comments. */
  meaning: string
  action: string
}

/**
 * Three prepared runs of the same command. Every transcript has the same
 * number of lines, so switching between them never changes the window's
 * height on a wide screen; on phones, where lines wrap, all three are laid
 * over one another and the tallest sets the height.
 */
const EXAMPLE_RUNS: ExampleRun[] = [
  {
    outcome: 'changed',
    label: 'Changed',
    summary: 'A viewer can now read a private document.',
    head: 'pr-142',
    headCounts: { run: '128/128', allow: 42, deny: 86 },
    result: (verdict) => (
      <>
        <Box component="span" sx={strong}>
          1 change
        </Box>
        <Pad n={3} />
        <Box component="span" sx={strong}>
          DENY
        </Box>{' '}
        <Box component="span" sx={muted}>
          →
        </Box>{' '}
        {verdict('ALLOW')}
        <Pad n={3} />
        {'viewer → read private-document'}
        <Pad n={3} />
        {verdict('unexpected')}
      </>
    ),
    meaning: 'One decision changed: a viewer can now read a private document.',
    action: 'Fix pr-142 before it merges.',
  },
  {
    outcome: 'unchanged',
    label: 'Unchanged',
    summary: 'Every prepared check decides the same.',
    head: 'pr-143',
    headCounts: { run: '128/128', allow: 41, deny: 87 },
    result: (verdict) => (
      <>
        <Box component="span" sx={strong}>
          0 changes
        </Box>
        <Pad n={3} />
        {'128 of 128 decisions match main'}
        <Pad n={3} />
        {verdict('clean')}
      </>
    ),
    meaning: 'No decision changed across the 128 prepared checks.',
    action: 'Nothing to fix here; review pr-143 as usual.',
  },
  {
    outcome: 'incomplete',
    label: 'Incomplete',
    summary: 'A check that could not finish is not a pass.',
    head: 'pr-144',
    headCounts: { run: '127/128', allow: 41, deny: 86 },
    result: (verdict) => (
      <>
        <Box component="span" sx={strong}>
          1 incomplete
        </Box>
        <Pad n={3} />
        {'export-report timed out on pr-144'}
        <Pad n={3} />
        {verdict('not a pass')}
      </>
    ),
    meaning: '127 checks match; 1 check could not finish on pr-144.',
    action: 'Rerun the check before trusting the result.',
  },
]

/**
 * Each outcome's colour, in every role it plays:
 * - `text`: the verdict's ink on the terminal's dark ground, where pink needs
 *   the lighter member of its family to read at 4.5:1 in both schemes;
 * - `plate`: the chosen option filled with the full-strength colour and set
 *   in the ink that reads on it (5.1:1 or better on all three);
 * - `glyph`: the option's grid icon on the page background, the readable
 *   member of the family in the light scheme (3:1 or better as a graphic);
 * - `glow`: the terminal's shadow while that run is chosen.
 */
function useOutcomeInk() {
  const palette = useTheme().vars.palette
  return {
    text: {
      changed: palette.secondary.light,
      unchanged: palette.primary.main,
      incomplete: palette.warning.main,
    } satisfies Record<Outcome, string>,
    plate: {
      changed: { fill: palette.secondary.main, ink: palette.secondary.contrastText },
      unchanged: { fill: palette.primary.main, ink: palette.primary.contrastText },
      incomplete: { fill: palette.warning.main, ink: palette.flood.ink },
    } satisfies Record<Outcome, { fill: string; ink: string }>,
    glyph: {
      changed: { light: palette.secondary.dark, dark: palette.secondary.main },
      unchanged: { light: palette.primary.dark, dark: palette.primary.main },
      incomplete: { light: palette.warning.dark, dark: palette.warning.main },
    } satisfies Record<Outcome, { light: string; dark: string }>,
    glow: {
      changed: palette.secondary.main,
      unchanged: palette.primary.main,
      incomplete: palette.warning.main,
    } satisfies Record<Outcome, string>,
  }
}


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

/**
 * Spaces that line the output's columns up on a wide terminal. Below md the
 * lines wrap, where a run of spaces would open a gap mid-line, so there it
 * collapses to one.
 */
function Pad({ n }: { n: number }) {
  const theme = useTheme()
  return (
    <Box component="span" sx={{ [theme.breakpoints.down('md')]: { whiteSpace: 'normal' } }}>
      {' '.repeat(n)}
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
 * The part of the result the run is about, in its outcome's colour.
 * Inline-block so it can stamp in at its own scale.
 */
function Verdict({ phase, color, children }: { phase: Phase; color: string; children: ReactNode }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        color,
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
function Command({ phase, head }: { phase: Phase; head: string }) {
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
        </Box>{' '}
        <Box component="span" sx={strong}>
          counterbranch compare
        </Box>
        {` --base main --head ${head} --tests ./authz-tests`}
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

/** One example run's whole transcript, from the opening comment to the cursor. */
function Transcript({
  run,
  phase,
  blinking,
}: {
  run: ExampleRun
  phase: Phase
  blinking: boolean
}) {
  const ink = useOutcomeInk().text[run.outcome]
  const verdict = (text: string) => (
    <Verdict phase={phase} color={ink}>
      {text}
    </Verdict>
  )
  return (
    <>
      <Comment
        phase={phase}
        delay={PURPOSE_DELAY}
        text="Run the same permission checks against both versions of your authorization logic."
      />
      {'\n'}
      <Comment
        phase={phase}
        delay={VERSIONS_DELAY}
        text={`main is what ships today; ${run.head} is the change under review.`}
      />
      {'\n'}
      <Command phase={phase} head={run.head} />
      {'\n'}
      <Line phase={phase} delay={LOAD_DELAY}>
        <Step />
        {' Loading 128 prepared permission checks'}
        <Pad n={9} />
        <Box component="span" sx={muted}>
          ./authz-tests
        </Box>
      </Line>
      {'\n'}
      <Line phase={phase} delay={MAIN_RUN_DELAY}>
        <Step />{' '}
        {/* One run per version: the whole stage is bold, which keeps each
            version's name bold and its line one phrase. */}
        <Box component="span" sx={strong}>
          Executing against main
        </Box>
        <Pad n={7} />
        {'128/128'}
        <Pad n={4} />
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
          {`Executing against ${run.head}`}
        </Box>
        <Pad n={5} />
        {run.headCounts.run}
        <Pad n={4} />
        <Box component="span" sx={muted}>
          {`allow ${run.headCounts.allow}`}
        </Box>
        {'   '}
        <Box component="span" sx={muted}>
          {`deny ${run.headCounts.deny}`}
        </Box>
      </Line>
      {'\n'}
      <Line phase={phase} delay={COMPARE_DELAY}>
        <Step />
        {' Comparing decisions'}
      </Line>
      {'\n'}
      <Line phase={phase} delay={RESULT_DELAY}>
        {'  '}
        {run.result(verdict)}
      </Line>
      {'\n'}
      <Comment phase={phase} delay={MEANING_DELAY} text={run.meaning} />
      {'\n'}
      <Comment phase={phase} delay={ACTION_DELAY} text={run.action}>
        <Cursor phase={phase} blinking={blinking} />
      </Comment>
    </>
  )
}

/** Browsers without `:has()` style the chosen run from React's state instead. */
const NO_HAS = '@supports not selector(:has(*))'

/**
 * The three example runs as a radio group. From lg it is a column of rows
 * beside the terminal; from sm to lg, a row of three over it; on phones, a
 * column again. The chosen run is an ink plate, the same treatment as the
 * hero's reel window, and each run carries its outcome's colour as a small
 * square swatch.
 *
 * Native radios, visually hidden inside their labels: arrow keys move the
 * choice in every browser with no key handling here. Where `:has()` is
 * supported (every current browser), the choice is drawn from `:checked`, so
 * it and the transcript it shows also switch before the page hydrates and
 * without JavaScript. Older browsers fall back to React's state, so there the
 * switch needs JavaScript; the focus ring falls back to `:focus-within`.
 */
function RunPicker({
  name,
  selected,
  onChoose,
}: {
  name: string
  selected: number
  onChoose: (index: number) => void
}) {
  const theme = useTheme()
  const palette = theme.vars.palette
  const outcomeInk = useOutcomeInk()

  const focusRing = {
    outline: `2px solid ${palette.primary.dark}`,
    outlineOffset: 2,
    zIndex: 3,
    ...theme.applyStyles('dark', {
      outline: `2px solid ${palette.primary.main}`,
    }),
  }

  // The chosen option is a plate in its outcome's colour, the same colour
  // its verdict takes in the terminal; its grid icon's cells pop in as it is
  // chosen.
  const chosenFor = (outcome: Outcome) => {
    const plate = outcomeInk.plate[outcome]
    return {
      borderColor: plate.fill,
      backgroundColor: plate.fill,
      color: plate.ink,
      zIndex: 1,
      '& [data-summary], & [data-glyph]': { color: plate.ink },
      '& [data-cell]': {
        transformBox: 'fill-box',
        transformOrigin: 'center',
        animation: `${nodeIn} 200ms ${motionEasing.decel} var(--d) both`,
        [REDUCED_MOTION]: { animation: 'none' },
      },
    }
  }

  return (
    <Box component="fieldset" sx={{ m: 0, p: 0, border: 0, minWidth: 0 }}>
      <Box component="legend" sx={srOnly}>
        Example runs
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            sm: 'repeat(3, minmax(0, 1fr))',
            lg: 'minmax(0, 1fr)',
          },
        }}
      >
        {EXAMPLE_RUNS.map((run, index) => (
          <Box
            key={run.outcome}
            component="label"
            data-chosen={index === selected}
            sx={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: 'auto minmax(0, 1fr)',
              columnGap: 1.5,
              rowGap: 0.75,
              alignItems: 'center',
              px: 2.5,
              py: { xs: 1.75, sm: 2.25 },
              cursor: 'pointer',
              // Neighbouring options share one hairline rather than doubling it.
              ...(index > 0 && {
                mt: { xs: '-1px', sm: 0, lg: '-1px' },
                ml: { sm: '-1px', lg: 0 },
              }),
              border: '1px solid',
              borderColor: palette.divider,
              color: palette.text.primary,
              transition: theme.transitions.create(['background-color', 'border-color', 'color'], {
                duration: motionDuration.fast,
                easing: motionEasing.decel,
              }),
              '&:hover': { borderColor: palette.text.primary, zIndex: 2 },
              '& [data-glyph]': {
                color: outcomeInk.glyph[run.outcome].light,
                ...theme.applyStyles('dark', { color: outcomeInk.glyph[run.outcome].dark }),
              },
              '&:has(input:checked)': chosenFor(run.outcome),
              '&:has(input:focus-visible)': focusRing,
              [NO_HAS]: {
                '&[data-chosen="true"]': chosenFor(run.outcome),
                '&:focus-within': focusRing,
              },
              [REDUCED_MOTION]: { transition: 'none' },
            }}
          >
            <Box
              component="input"
              type="radio"
              name={name}
              value={index}
              checked={index === selected}
              onChange={() => onChoose(index)}
              sx={srOnly}
            />
            {/* The outcome's colour, as a key to the verdict in the terminal;
                the label beside it carries the meaning. */}
            <OutcomeGlyph outcome={run.outcome} />
            <Box
              component="span"
              sx={{
                fontFamily: displayFont,
                fontWeight: 600,
                fontSize: { xs: '0.9375rem', xl: '1.0625rem' },
                lineHeight: 1.2,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              {run.label}
            </Box>
            <Box
              component="span"
              data-summary
              sx={{
                gridColumn: '1 / -1',
                fontSize: { xs: '0.875rem', xl: '1rem' },
                lineHeight: 1.45,
                color: palette.text.secondary,
                textWrap: 'pretty',
              }}
            >
              {run.summary}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

/**
 * The same permission check run against both versions of the authorization
 * logic, shown as the CLI run that does it in a macOS Terminal window. Three
 * prepared runs sit beside it: one where a decision changed, one where none
 * did, and one where a check could not finish. Choosing one plays it: shell
 * comments say what the run is for, the command is typed, the prepared checks
 * load and execute against each version, the comparison stamps its verdict,
 * and two more comments say what that means. "Replay run" plays the chosen
 * one again.
 *
 * The first render is the finished first run, so the prerendered HTML and
 * visitors without JavaScript see its whole transcript, and can still switch
 * runs (see RunPicker). Motion is CSS keyframes restarted by remounting
 * (`key={runKey}`); React only changes phase at the start and end of a run.
 */
export default function CompareTerminal() {
  const theme = useTheme()
  const palette = theme.vars.palette
  const terminal = useRef<HTMLElement | null>(null)
  const played = useRef(false)
  const [runKey, setRunKey] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [selected, setSelected] = useState(0)
  const pickerName = useId()
  const unit = useRef<HTMLDivElement | null>(null)

  const play = useCallback(() => {
    played.current = true
    setPhase('playing')
    setRunKey((key) => key + 1)
  }, [])

  const choose = useCallback(
    (index: number) => {
      setSelected(index)
      play()
    },
    [play],
  )

  // The radios work before the page hydrates, so a visitor may already have
  // chosen a run then; that choice lives only in the DOM. Adopt it before
  // anything re-renders the controlled radios back to the first run, and
  // before the first auto-play, so that plays the run they chose.
  useLayoutEffect(() => {
    const checked = unit.current?.querySelector<HTMLInputElement>('input[type="radio"]:checked')
    const index = checked ? Number(checked.value) : 0
    if (index > 0 && index < EXAMPLE_RUNS.length) setSelected(index)
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
  const glow = useOutcomeInk().glow

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

  // Which transcript shows follows the checked radio. The React-rendered
  // `data-chosen` is the fallback where `:has()` is not supported.
  const shownRun = Object.fromEntries(
    EXAMPLE_RUNS.map((_, index) => [
      `&:has(input[value="${index}"]:checked) [data-run="${index}"]`,
      { visibility: 'visible' },
    ]),
  )

  return (
    <Section id="how-it-works">
      <Container maxWidth={false} sx={pageColumn}>
        {/* Intro across the top, then the runs and the terminal as one
            control-and-display unit. On phones everything stacks in reading
            order: intro, runs, terminal, note, replay. From lg the runs take
            a column beside the terminal, with replay under them, and the
            note sits under the terminal it qualifies. */}
        <Typography
          variant="h2"
          component="h2"
          sx={{ fontSize: 'clamp(2rem, 1.2rem + 2.8vw, 4.5rem)' }}
        >
          See what access changed.
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mt: rhythm.heading,
            maxWidth: '46ch',
            fontSize: { md: '1.125rem', xl: '1.25rem' },
            ...secondaryText,
            textWrap: 'pretty',
          }}
        >
          Run the same permission check against both versions of your authorization logic.
        </Typography>

        <Box
          ref={unit}
          sx={{
            mt: rhythm.intro,
            display: 'grid',
            // Two columns only from lg: below that the terminal column would
            // be narrower than its 71-character lines and hide the verdict.
            gridTemplateAreas: {
              xs: '"runs" "terminal" "aside"',
              lg: '"runs terminal" "aside terminal"',
            },
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              lg: 'minmax(0, 340px) minmax(0, 1fr)',
              xl: 'minmax(0, 400px) minmax(0, 1fr)',
            },
            gridTemplateRows: { lg: 'auto 1fr' },
            columnGap: 6,
            alignItems: 'start',
            ...shownRun,
            [NO_HAS]: { '& [data-run][data-chosen="true"]': { visibility: 'visible' } },
          }}
        >
          <Box sx={{ gridArea: 'runs', minWidth: 0 }}>
            <RunPicker name={pickerName} selected={selected} onChoose={choose} />
          </Box>

          <Box sx={{ gridArea: 'terminal', minWidth: 0, mt: { xs: 3, lg: 0 } }}>
            <MacWindow
              ref={terminal}
              title="counterbranch — zsh"
              label="Example compare run"
              glow={glow[EXAMPLE_RUNS[selected].outcome]}
            >
              {/* Every run is laid in the same cell, so the tallest one sets
                  the window's height and switching never moves the page.
                  Only the chosen one is visible, or read out. */}
              <Box sx={{ display: 'grid' }}>
                {EXAMPLE_RUNS.map((run, index) => {
                  const isSelected = index === selected
                  return (
                    <Box
                      key={isSelected ? `${run.outcome}-${runKey}` : run.outcome}
                      component="pre"
                      data-run={index}
                      data-chosen={isSelected}
                      sx={{
                        gridArea: '1 / 1',
                        visibility: 'hidden',
                        m: 0,
                        px: { xs: 2, sm: 3 },
                        py: 2.5,
                        fontFamily: MONO_FONT,
                        fontSize: { xs: '0.8125rem', sm: '0.875rem', xl: '1rem' },
                        lineHeight: 1.65,
                        // Wrap rather than scroll sideways, so no part of the
                        // run is ever off-screen.
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'anywhere',
                      }}
                    >
                      <Transcript
                        run={run}
                        phase={isSelected ? phase : 'idle'}
                        blinking={isSelected && runKey > 0}
                      />
                    </Box>
                  )
                })}
              </Box>
            </MacWindow>

            <Typography
              variant="body2"
              sx={{ mt: 2, maxWidth: '64ch', ...secondaryText, textWrap: 'pretty' }}
            >
              Demonstration only. This output is simulated to show the shape of a run and does not
              come from a live system. Command names and counts are illustrative. Counterbranch
              compares only the prepared authorization tests you run; it does not certify an
              application as secure.
            </Typography>
          </Box>

          {/* Replaying does nothing visible without motion, so the control
              goes with it, margin and all. */}
          <Box sx={{ gridArea: 'aside', mt: 3, [REDUCED_MOTION]: { display: 'none' } }}>
            <Button variant="outlined" color="inherit" onClick={play} sx={outlinedButtonSx}>
              Replay run
            </Button>
          </Box>
        </Box>
      </Container>
    </Section>
  )
}
