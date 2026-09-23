import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { useId } from 'react'
import { useTheme } from '@mui/material/styles'
import Section from './Section.tsx'
import { motionDuration, motionEasing } from '../motion.ts'
import { pageColumn, rhythm } from '../rhythm.ts'

/**
 * The questions a team asks before adding a check to its workflow, answered
 * from what the alpha does today. Keep every answer true to the shipped CLI:
 * change the answer when the product changes, not the other way round.
 */
const QUESTIONS = [
  {
    question: 'What does it work with today?',
    answer:
      'Policy engines: OPA (Rego), Cedar and OpenFGA. Counterbranch runs the real engine against both revisions on your machine, with no containers, and an OPA repository’s existing Rego tests become checks automatically, so that is the quickest path. Access rules in your own application code, such as routes, middleware and sessions, are checked by running both versions of the app in isolated Docker containers, which takes a one-time setup for your app.',
  },
  {
    question: 'What is a prepared check, and who writes it?',
    answer:
      'A few lines of data: who is asking, for which resource, to do what, and whether that should be allowed. Your coding agent drafts them by following our AGENTS.md recipe, or you write them yourself. A drafted check only counts once you approve it. On an OPA repository, your existing Rego tests are imported as checks automatically.',
  },
  {
    question: 'Will it catch an access path nobody wrote a check for?',
    answer:
      'No. It compares the decisions your checks cover, on both revisions, and reports how many it covered. A path with no check is not compared, which is why the setup recipe starts by finding every place your code decides access, and why a check that cannot run is reported as INCOMPLETE rather than skipped.',
  },
  {
    question: 'What leaves my machine?',
    answer:
      'Nothing. The binary makes no network calls, sends no telemetry and needs no account. Reports are JSON and Markdown files written to your own disk. Posting a pull request comment is opt-in, and it uses your own GitHub CLI login.',
  },
  {
    question: 'Where does AI come in, and who pays for it?',
    answer:
      'Only during setup, and only in your own coding agent: it reads your code and drafts checks, on your key and your bill. The comparison itself makes no model calls, so every rerun is free and gives the same answer for the same code.',
  },
  {
    question: 'What does it cost?',
    answer:
      'Nothing during the alpha. Run it as often as you like; the only AI spend is your own agent’s, while it drafts checks.',
  },
  {
    question: 'What happens in CI when a decision changes?',
    answer:
      'You choose the gate: block the merge unless every check finishes and nothing changed, or report the changes without blocking. Either way, a check that could not finish is reported as INCOMPLETE, never as a pass.',
  },
  {
    question: 'How long does a run take?',
    answer:
      'Policy comparisons take seconds: a seven-test OPA example imports its tests, runs both revisions and writes its report in under three seconds on a laptop. Application checks start both versions of the app first, so they take longer, and each CI job is capped at 25 minutes.',
  },
  {
    question: 'Which platforms does it run on?',
    answer:
      'macOS on Apple silicon and Linux x86_64, on your laptop or a CI runner. Checks against your application also need Docker.',
  },
  {
    question: 'Is it open source?',
    answer:
      'Not yet. During the alpha we ship Counterbranch as a single binary while the approach settles. It runs entirely on your machines and CI runners and makes no network calls of its own, which you can confirm by watching its traffic.',
  },
  {
    question: 'What does alpha mean here?',
    answer:
      'The comparison and its reports work today. Commands, options and report formats can still change between releases.',
  },
] as const

/**
 * The FAQ: a heading that stays in view on wide screens, beside questions
 * that open in place. The answers are in the prerendered page, collapsed, so
 * search engines and in-page find can reach them.
 */
export default function Faq() {
  const theme = useTheme()
  const palette = theme.vars.palette
  const band = palette.bands.navy
  const baseId = useId()
  return (
    <Section id="faq" tone="navy">
      <Container
        maxWidth={false}
        sx={{
          ...pageColumn,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 5fr) minmax(0, 7fr)' },
          columnGap: 8,
          rowGap: rhythm.intro,
          alignItems: 'start',
        }}
      >
        <Box sx={{ position: { lg: 'sticky' }, top: { lg: 96 } }}>
          <Typography variant="h2" sx={{ fontSize: 'clamp(2rem, 1.2rem + 2.8vw, 4.5rem)' }}>
            Before you install.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mt: rhythm.heading,
              maxWidth: '40ch',
              fontSize: { md: '1.125rem', xl: '1.25rem' },
              color: band.inkMuted,
              textWrap: 'pretty',
            }}
          >
            What runs where, who pays for what, and what alpha means.
          </Typography>
        </Box>
        <Box sx={{ borderTop: '1px solid', borderColor: band.line }}>
          {QUESTIONS.map(({ question, answer }, index) => (
            <Accordion
              key={question}
              disableGutters
              elevation={0}
              square
              sx={{
                backgroundColor: 'transparent',
                color: 'inherit',
                borderBottom: '1px solid',
                borderColor: band.line,
                // The divider MUI draws above each panel doubles the border.
                '&::before': { display: 'none' },
              }}
            >
              {/* MUI labels each answer's region from these ids; it does not
                  generate them. */}
              <AccordionSummary
                id={`${baseId}-question-${index}`}
                aria-controls={`${baseId}-answer-${index}`}
                expandIcon={<AddOutlinedIcon aria-hidden />}
                sx={{
                  px: 0,
                  py: { xs: 1.5, md: 2 },
                  minHeight: 56,
                  '& .MuiAccordionSummary-content': { my: 0, pr: 2 },
                  '& .MuiAccordionSummary-expandIconWrapper': {
                    color: band.ink,
                    transition: theme.transitions.create('transform', {
                      duration: motionDuration.base,
                      easing: motionEasing.decel,
                    }),
                  },
                  // A plus that turns into a close mark.
                  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': { transform: 'rotate(45deg)' },
                  '@media (prefers-reduced-motion: reduce)': {
                    '& .MuiAccordionSummary-expandIconWrapper': { transition: 'none' },
                  },
                  // A cyan ring, which reads on the navy in both schemes, in
                  // place of MUI's grey focus fill.
                  '&.Mui-focusVisible': {
                    backgroundColor: 'transparent',
                    outline: `2px solid ${palette.primary.main}`,
                    outlineOffset: 2,
                  },
                }}
              >
                <Typography
                  component="span"
                  sx={{ fontWeight: 600, fontSize: { xs: '1.0625rem', md: '1.1875rem', xl: '1.3125rem' } }}
                >
                  {question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0, pt: 0, pb: { xs: 2.5, md: 3 } }}>
                <Typography
                  variant="body1"
                  sx={{
                    maxWidth: '64ch',
                    fontSize: { md: '1.0625rem', xl: '1.125rem' },
                    color: band.inkMuted,
                    textWrap: 'pretty',
                  }}
                >
                  {answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Section>
  )
}
