import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import { useTheme } from '@mui/material/styles'
import Section from './Section.tsx'
import RepoField from './RepoField.tsx'
import { campaign } from '../alphaResults.ts'
import { links } from '../links.ts'
import { pageColumn, rhythm } from '../rhythm.ts'

/**
 * What the alpha campaign showed, one row per result: the result as a claim
 * on the left, and on the right what it means and what it is not. Every
 * number comes from alphaResults.ts.
 */
const results = [
  {
    claim: `More than ${campaign.scansFinished} of scans finished.`,
    body: 'Real repositories, with generated files, vendored libraries and hundreds of thousands of lines, scanned without setup for any of them.',
    limit: 'That is how often a scan ran to the end, not how accurate it was.',
  },
  {
    claim: `${campaign.sites}+ access decisions mapped. No model tokens.`,
    body: 'Role checks, ownership checks, middleware and feature gates: each a place where a change could alter who can do what. Discovery is a structural scan, so the map is free to redraw and the same code gives the same map.',
    limit: 'A mapped decision is a place to look, not a problem found.',
  },
  {
    claim: `${campaign.bugs} real access-control bugs, confirmed by hand.`,
    body: `The map pointed us at the code; we read it and confirmed each bug ourselves, in ${campaign.bugProjects} projects, before counting it.`,
    limit: 'We are not naming the projects before their maintainers have had the chance to fix them.',
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
        gap: { xs: 2, md: 8, xl: 12 },
        alignItems: 'start',
        py: rhythm.row,
        borderTop: '1px solid',
        borderColor: palette.divider,
        '&:last-of-type': { borderBottom: '1px solid', borderBottomColor: palette.divider },
      }}
    >
      <Typography variant="h4" component="h3">
        {result.claim}
      </Typography>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="body1"
          sx={{ maxWidth: '58ch', fontSize: { xl: '1.125rem' }, color: palette.text.secondary, textWrap: 'pretty' }}
        >
          {result.body}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mt: 2,
            maxWidth: '58ch',
            fontSize: { xl: '1.125rem' },
            fontWeight: 600,
            color: palette.text.primary,
            textWrap: 'pretty',
          }}
        >
          {result.limit}
        </Typography>
      </Box>
    </Box>
  )
}

/**
 * The alpha campaign on the landing page: discovery run across 10,000
 * open-source repositories, drawn as a field of them, then what it showed.
 * The alpha test results page (links.alphaResults) has the method, the
 * breakdowns and the limits.
 */
export default function AlphaScan() {
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

        <Box sx={{ mt: { xs: 5, md: 6 } }}>
          <Button
            variant="outlined"
            size="large"
            component="a"
            href={links.alphaResults}
            endIcon={<ArrowForwardOutlinedIcon aria-hidden />}
            sx={{ minHeight: 48, width: { xs: '100%', sm: 'auto' } }}
          >
            Read the alpha test results
          </Button>
        </Box>
      </Container>
    </Section>
  )
}
