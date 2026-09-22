import { useState } from 'react'
import type { ComponentType, ReactNode } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import Section from './Section.tsx'
import { MONO_FONT, MUTED } from './DiffVersusRun.tsx'
import { useInView } from '../hooks/useInView.ts'
import { arrivalSx, stampIn, type RunPhase } from '../motion.ts'

/** Share of a specimen that must be on screen before its key line stamps in. */
const STAMP_THRESHOLD = 0.4

/** Row 3 lands two lines: the change, then the check that did not finish. */
const SECOND_LINE_DELAY = 150

const strong = { fontWeight: 700 } as const

/** Labels and arrows: the terminal's muted ink. */
function Muted({ children }: { children: ReactNode }) {
  return (
    <Box component="span" sx={{ color: MUTED }}>
      {children}
    </Box>
  )
}

/** A decision that did not change: the panel's own ink, bold. */
function Held({ children }: { children: ReactNode }) {
  return (
    <Box component="span" sx={strong}>
      {children}
    </Box>
  )
}

/** A decision or response that changed: brand pink, as in the terminal. */
function Changed({ children }: { children: ReactNode }) {
  const palette = useTheme().vars.palette
  return (
    <Box
      component="span"
      sx={(theme) => ({
        ...strong,
        color: palette.secondary.main,
        // Full-strength pink is 4.55:1 on the dark paper ground; the lighter
        // member of the family gives real headroom there.
        ...theme.applyStyles('dark', { color: palette.secondary.light }),
      })}
    >
      {children}
    </Box>
  )
}

/** A check that could not finish: the warning hue (6.0:1 and 8.9:1 on the two grounds). */
function Incomplete({ children }: { children: ReactNode }) {
  const palette = useTheme().vars.palette
  return (
    <Box component="span" sx={{ ...strong, color: palette.warning.main }}>
      {children}
    </Box>
  )
}

/**
 * The line a specimen is about. Inline-block so it can stamp in at its own
 * scale, anchored on its left edge so the columns above it never shift; the
 * real newline after it still ends the line.
 */
function KeyLine({
  phase,
  delay,
  children,
}: {
  phase: RunPhase
  delay: number
  children: ReactNode
}) {
  return (
    <Box
      component="span"
      sx={{ display: 'inline-block', transformOrigin: '0 50%', ...arrivalSx(phase, stampIn, delay) }}
    >
      {children}
    </Box>
  )
}

function CompareSpecimen({ phase }: { phase: RunPhase }) {
  return (
    <>
      {'viewer '}
      <Muted>→</Muted>
      {' read private-document'}
      {'\n'}
      <Muted>main</Muted>
      {'      '}
      <Held>DENY</Held>
      {'\n'}
      <KeyLine phase={phase} delay={0}>
        <Muted>pr-142</Muted>
        {'    '}
        <Changed>ALLOW</Changed>
        {'    '}
        <Changed>changed</Changed>
      </KeyLine>
    </>
  )
}

function ResponseSpecimen({ phase }: { phase: RunPhase }) {
  return (
    <>
      {'GET /documents/42  as viewer'}
      {'\n'}
      <Muted>main</Muted>
      {'      '}
      <Held>403 Forbidden</Held>
      {'\n'}
      <KeyLine phase={phase} delay={0}>
        <Muted>pr-142</Muted>
        {'    '}
        <Changed>200 OK</Changed>
        {'   body returned'}
      </KeyLine>
    </>
  )
}

function ReportSpecimen({ phase }: { phase: RunPhase }) {
  return (
    <>
      <Muted>checks</Muted>
      {'       128'}
      {'\n'}
      <Muted>unchanged</Muted>
      {'    126'}
      {'\n'}
      <KeyLine phase={phase} delay={0}>
        <Muted>changed</Muted>
        {'        1   '}
        <Held>DENY</Held>
        {' '}
        <Muted>→</Muted>
        {' '}
        <Changed>ALLOW</Changed>
      </KeyLine>
      {'\n'}
      <KeyLine phase={phase} delay={SECOND_LINE_DELAY}>
        <Muted>incomplete</Muted>
        {'     '}
        <Incomplete>1</Incomplete>
        {'   '}
        <Incomplete>timed out: export-report</Incomplete>
      </KeyLine>
    </>
  )
}

interface Feature {
  title: string
  body: string
  why: string
  /** Names the specimen for assistive technology. */
  label: string
  Specimen: ComponentType<{ phase: RunPhase }>
}

const features: Feature[] = [
  {
    title: 'Compare both versions.',
    body: 'Test the same user, action, and resource against the current and proposed revisions. See changes like denied → allowed.',
    why: 'A code diff shows what was edited; this shows whether access changed.',
    label: 'Example: one access check on main and pr-142, where the decision changes',
    Specimen: CompareSpecimen,
  },
  {
    title: 'Check what the app returns.',
    body: 'For a prepared app setup, send requests as test users to isolated versions and inspect each response. Counterbranch can also compare decisions from supported policy engines.',
    why: 'A rule may look correct while an endpoint still returns data it shouldn’t.',
    label: 'Example: one request sent as a test user to main and pr-142, and each response',
    Specimen: ResponseSpecimen,
  },
  {
    title: 'See the evidence and the gaps.',
    body: 'The report shows the expected result, what each version did, and any check that could not finish. Rerun the same prepared checks after a fix without an AI call.',
    why: 'Developers can verify the result, and an incomplete test won’t look like a pass.',
    label: 'Example report summary: changed checks and a check that did not finish',
    Specimen: ReportSpecimen,
  },
]

/**
 * Where a row's stamp is. The first render is the finished row (idle), so the
 * prerendered HTML and hydration agree and nothing moves without a reason.
 * Only once the observer has reported the specimen off screen is the key line
 * hidden (armed), and it stamps in (playing) when the specimen comes into
 * view. State is adjusted during render, React's pattern for deriving from a
 * previous value, so no extra effect or frame is involved.
 */
function useStampPhase(inView: boolean): RunPhase {
  const [armed, setArmed] = useState(false)
  if (!inView && !armed) setArmed(true)
  if (!armed) return 'idle'
  return inView ? 'playing' : 'armed'
}

function FeatureRow({ feature }: { feature: Feature }) {
  const theme = useTheme()
  const palette = theme.vars.palette
  const { ref, inView } = useInView<HTMLElement>({ threshold: STAMP_THRESHOLD })
  const phase = useStampPhase(inView)
  const { title, body, why, label, Specimen } = feature

  return (
    <Box
      component="li"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 5fr) minmax(0, 7fr)' },
        gap: { xs: 3, md: 8 },
        // From md the specimen stretches to the text column's height, with
        // its output centred, so each row reads as one block.
        alignItems: { xs: 'start', md: 'stretch' },
        py: { xs: 5, md: 6 },
        borderTop: '1px solid',
        borderColor: palette.divider,
        '&:last-of-type': { borderBottom: '1px solid', borderBottomColor: palette.divider },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h5" component="h3">
          {title}
        </Typography>
        <Typography
          variant="body1"
          sx={{ mt: 2, maxWidth: '46ch', color: palette.text.secondary, textWrap: 'pretty' }}
        >
          {body}
        </Typography>
        <Typography
          variant="body2"
          sx={{ mt: 2.5, maxWidth: '46ch', color: palette.text.primary, textWrap: 'pretty' }}
        >
          <Box component="strong" sx={strong}>
            Why it matters:
          </Box>{' '}
          {why}
        </Typography>
      </Box>

      {/* The same ground and ink as the How it works windows, without their
          chrome: a specimen of output, not a depiction of a window. */}
      <Box
        ref={ref}
        component="figure"
        aria-label={label}
        sx={{
          m: 0,
          minWidth: 0,
          px: 3,
          py: 2.5,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
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
          component="pre"
          sx={{
            m: 0,
            fontFamily: MONO_FONT,
            fontSize: '0.875rem',
            lineHeight: 1.65,
            // Wrap rather than scroll sideways on phones.
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere',
          }}
        >
          <Specimen phase={phase} />
        </Box>
      </Box>
    </Box>
  )
}

/**
 * What a run gives you, one row per outcome: the claim on the left, a
 * specimen of the output that proves it on the right. Each specimen's key
 * line stamps in the first time it comes into view.
 */
export default function Features() {
  const palette = useTheme().vars.palette

  return (
    <Section id="features" tone="tinted">
      <Container maxWidth="lg">
        <Box sx={{ mb: { xs: 6, md: 8 } }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{ fontSize: 'clamp(2rem, 1.4rem + 2.6vw, 3.5rem)' }}
          >
            Know what changed about access.
          </Typography>
          <Typography
            variant="body1"
            sx={{ mt: 2.5, maxWidth: '46ch', color: palette.text.secondary, textWrap: 'pretty' }}
          >
            Run the same access checks before and after a change. See who gained or lost access,
            what the app returned, and which checks completed.
          </Typography>
        </Box>

        {/* Not a sequence, so not numbered. The explicit role keeps the list
            announced in Safari, which drops it once list-style is removed. */}
        <Box component="ul" role="list" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {features.map((feature) => (
            <FeatureRow key={feature.title} feature={feature} />
          ))}
        </Box>
      </Container>
    </Section>
  )
}
