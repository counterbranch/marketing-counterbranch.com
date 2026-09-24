import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import Section from './Section.tsx'
import RepoField from './RepoField.tsx'
import { campaign } from '../alphaResults.ts'
import { pageColumn, rhythm } from '../rhythm.ts'

/**
 * The alpha campaign, cut down for the teaser: the landing page's results
 * band (AlphaScan) with each result as its claim and its limit only, and no
 * link to the results page while that page is not built. Every number comes
 * from alphaResults.ts.
 */
const results = [
  {
    claim: `More than ${campaign.scansFinished} of scans finished.`,
    limit: 'That is how often a scan ran to the end, not how accurate it was.',
  },
  {
    claim: `${campaign.sites}+ access decisions mapped. No model tokens.`,
    limit: 'A mapped decision is a place to look, not a problem found.',
  },
  {
    claim: `${campaign.bugs} real access-control bugs, confirmed by hand.`,
    limit: `We read the code the map pointed at and confirmed each one, in ${campaign.bugProjects} projects. That is not a detection rate. We are not naming the projects before their maintainers have had the chance to fix them.`,
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

        <RepoField />

        <Box component="ul" role="list" sx={{ listStyle: 'none', m: 0, mt: rhythm.exhibit, p: 0 }}>
          {results.map((result) => (
            <ResultRow key={result.claim} result={result} />
          ))}
        </Box>
      </Container>
    </Section>
  )
}
