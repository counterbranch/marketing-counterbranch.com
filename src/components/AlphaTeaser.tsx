import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import Section from './Section.tsx'
import RepoField from './RepoField.tsx'
import { campaign } from '../alphaResults.ts'
import { pageColumn, rhythm } from '../rhythm.ts'

/**
 * The alpha campaign, cut down for the teaser: what discovery mapped and what
 * it covers, each as its claim and its limit. The teaser leaves out the scan
 * completion rate and the confirmed bugs, and does not link to the results
 * page while that page is not built. Every number comes from alphaResults.ts.
 *
 * Coverage is the pinned Discovery release's: access checks in application
 * code, plus OPA, Cedar and OpenFGA policy artifacts and their enforcement
 * calls, each held by the scanner's pinned test corpus.
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
            For the alpha we ran discovery, the scan that finds where code decides who can do what,
            across more than {campaign.repos} public repositories. No model calls, and no setup for
            any of them.
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
