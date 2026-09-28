import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import Section from './Section.tsx'
import RepoField from './RepoField.tsx'
import { campaign, speed } from '../alphaResults.ts'
import { pageColumn, rhythm } from '../rhythm.ts'

/**
 * The alpha campaign, cut down for the teaser: what discovery mapped, what it
 * covers and how fast it runs, then what the pull request check leaves
 * behind, each as its claim and its limit. The teaser leaves out the scan
 * completion rate and the confirmed bugs, and does not link to the results
 * page while that page is not built. Every number comes from alphaResults.ts.
 *
 * Coverage is the pinned Discovery release's: access checks in application
 * code, plus OPA, Cedar and OpenFGA policy artifacts and their enforcement
 * calls, each held by the scanner's pinned test corpus.
 *
 * The evidence row is the comparison's: its manifest binds both commits and
 * each input file's SHA-256, it never derives expected results from the
 * candidate, and a required positive control means an application that denies
 * every request is reported rather than passed.
 */
const results = [
  {
    claim: `${campaign.sites}+ access decisions mapped. No model tokens.`,
    limit: 'A mapped decision is a place to look, not a problem found.',
  },
  {
    claim: 'Covers custom auth, OPA, Cedar and OpenFGA.',
    limit:
      'Discovery finds access checks written in application code, and OPA, Cedar and OpenFGA policies with the calls that enforce them. It shows where they are, not whether they are right.',
  },
  {
    claim: 'Maps a large repo in under a minute.',
    limit: `Timed on nine public repositories: ${speed.large} for a large one and ${speed.small} for a small one, depending on the language. Fast enough to run on both sides of every pull request.`,
  },
  {
    claim: 'Evidence pinned to immutable inputs. A PR can’t grade itself.',
    limit:
      'Each report records both commits and a hash of every file it used. Expected results come from your team, never from the code under review, and an app that denies every request is flagged, not passed as secure. It covers the cases your team approved, not every path.',
  },
] as const

function ResultRow({ result }: { result: (typeof results)[number] }) {
  const palette = useTheme().vars.palette
  return (
    <Box
      component="li"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 5fr) minmax(0, 7fr)' },
        gap: { xs: 1.5, md: 8, xl: 12 },
        // The limit sits on the claim's first line, so the pair reads as one
        // statement.
        alignItems: 'baseline',
        py: rhythm.row,
        borderTop: '1px solid',
        borderColor: palette.divider,
        '&:last-of-type': { borderBottom: '1px solid', borderBottomColor: palette.divider },
      }}
    >
      <Typography variant="h4" component="h3">
        {result.claim}
      </Typography>
      <Typography
        variant="body1"
        sx={{ maxWidth: '58ch', fontSize: { xl: '1.125rem' }, color: palette.text.secondary, textWrap: 'pretty' }}
      >
        {result.limit}
      </Typography>
    </Box>
  )
}

export default function AlphaTeaser() {
  const palette = useTheme().vars.palette

  return (
    <Section id="alpha-results">
      <Container maxWidth={false} sx={pageColumn}>
        <Box sx={{ mb: rhythm.intro }}>
          <Typography variant="h2" component="h2" sx={{ maxWidth: { xs: '16ch', lg: '20ch' } }}>
            Tested on {campaign.repos} open-source repos.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mt: rhythm.heading,
              maxWidth: '52ch',
              fontSize: { md: '1.125rem', xl: '1.25rem' },
              color: palette.text.secondary,
              textWrap: 'pretty',
            }}
          >
            Discovery is the first thing Counterbranch runs on your code: the scan that finds where
            it decides who can do what. For the alpha we ran it across more than {campaign.repos}{' '}
            public repositories, with no setup and no model calls for any of them. What it maps is
            where your team, or its coding agent, chooses what to check on every pull request.
          </Typography>
        </Box>

        <RepoField sitesOnly />

        <Box component="ul" role="list" sx={{ listStyle: 'none', m: 0, mt: rhythm.exhibit, p: 0 }}>
          {results.map((result) => (
            <ResultRow key={result.claim} result={result} />
          ))}
        </Box>
      </Container>
    </Section>
  )
}
