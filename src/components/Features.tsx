import type { ComponentType, ReactNode } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import Section from './Section.tsx'
import { MONO_FONT, MUTED } from './DiffVersusRun.tsx'
import { useArrivalPhase } from '../hooks/useArrivalPhase.ts'
import { arrivalSx, motionDuration, lineIn, type RunPhase } from '../motion.ts'
import { pageColumn, rhythm } from '../rhythm.ts'

/** Share of a specimen that must be on screen before its key line stamps in. */
const STAMP_THRESHOLD = 0.4

/** Row 3 lands two lines: the change, then the check that did not finish. */
const SECOND_LINE_DELAY = 150

/** Just after the last key line has stamped in. */
const STAMP_MS = SECOND_LINE_DELAY + motionDuration.base + 60

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

/**
 * A decision or response that changed, in pink as in the terminal. The
 * lighter member of the family, since it sits on the key line's pink tint,
 * where full-strength pink falls under 4.5:1 in both schemes.
 */
function Changed({ children }: { children: ReactNode }) {
  const palette = useTheme().vars.palette
  return (
    <Box component="span" sx={{ ...strong, color: palette.secondary.light }}>
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

/** How far the specimen's text sits in from its edges, in theme units. */
const SPECIMEN_PAD = 3

/**
 * The line a specimen is about, tinted edge to edge like a changed line in a
 * diff, so it is the first thing read in the panel: pink for a decision that
 * changed, the warning hue for a check that did not finish. Inline-block so it
 * can stamp in at its own scale, anchored on its left edge so the lines above
 * it never shift; the real newline after it still ends the line.
 */
function KeyLine({
  phase,
  delay,
  status = 'changed',
  children,
}: {
  phase: RunPhase
  delay: number
  status?: 'changed' | 'incomplete'
  children: ReactNode
}) {
  const palette = useTheme().vars.palette
  const tint = status === 'changed' ? palette.secondary.main : palette.warning.main
  return (
    <Box
      component="span"
      sx={(theme) => ({
        display: 'inline-block',
        boxSizing: 'content-box',
        width: '100%',
        mx: -SPECIMEN_PAD,
        px: SPECIMEN_PAD,
        backgroundColor: `color-mix(in srgb, ${tint} 16%, transparent)`,
        ...theme.applyStyles('dark', {
          backgroundColor: `color-mix(in srgb, ${tint} 20%, transparent)`,
        }),
        ...arrivalSx(phase, lineIn, delay),
      })}
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
      <KeyLine phase={phase} delay={SECOND_LINE_DELAY} status="incomplete">
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

function FeatureRow({ feature }: { feature: Feature }) {
  const theme = useTheme()
  const palette = theme.vars.palette
  const band = palette.bands.pink
  const { ref, phase } = useArrivalPhase<HTMLElement>(STAMP_THRESHOLD, STAMP_MS)
  const { title, body, why, label, Specimen } = feature

  return (
    <Box
      component="li"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 5fr) minmax(0, 7fr)' },
        gap: { xs: 3, md: 8, xl: 12 },
        // The specimen's top meets the claim's heading and it is only as tall
        // as its output, so no panel carries dead space set by the copy
        // beside it.
        alignItems: 'start',
        py: rhythm.row,
        borderTop: '1px solid',
        borderColor: band.line,
        '&:last-of-type': { borderBottom: '1px solid', borderBottomColor: band.line },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        {/* Each claim reads as a headline over its evidence, a step under the
            section heading; the copy and the specimen stay quiet around it. */}
        <Typography
          variant="h4"
          component="h3"
          sx={{ fontSize: 'clamp(1.375rem, 1.1rem + 1vw, 2.5rem)' }}
        >
          {title}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mt: rhythm.heading,
            maxWidth: '46ch',
            fontSize: { xl: '1.125rem' },
            color: band.inkMuted,
            textWrap: 'pretty',
          }}
        >
          {body}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mt: 2.5,
            maxWidth: '46ch',
            fontSize: { xl: '1rem' },
            color: band.ink,
            textWrap: 'pretty',
          }}
        >
          {why}
        </Typography>
      </Box>

      {/* The same ground and ink as the How it works windows, without their
          chrome: a specimen of output, not a depiction of a window. On the
          pink band it casts a shadow in the band's own ink. */}
      <Box
        ref={ref}
        component="figure"
        aria-label={label}
        sx={{
          m: 0,
          minWidth: 0,
          px: SPECIMEN_PAD,
          py: 3,
          border: '1px solid',
          borderColor: palette.hero.plate,
          backgroundColor: palette.hero.plate,
          color: palette.hero.plateInk,
          boxShadow: `0 28px 56px -30px color-mix(in srgb, ${band.ink} 70%, transparent)`,
          ...theme.applyStyles('dark', {
            borderColor: palette.background.paper,
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
            fontSize: { xs: '0.8125rem', md: '0.9375rem', xl: '1.0625rem' },
            lineHeight: 1.7,
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
  const band = useTheme().vars.palette.bands.pink

  return (
    <Section id="features" tone="pink">
      <Container maxWidth={false} sx={pageColumn}>
        <Box sx={{ mb: rhythm.intro }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{ maxWidth: { xs: '18ch', lg: '20ch' } }}
          >
            Know what changed about access.
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
