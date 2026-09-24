import Box from '@mui/material/Box'
import PageShell from '../components/PageShell.tsx'
import Cta from '../components/Cta.tsx'
import ResultsHeader from './alpha-results/ResultsHeader.tsx'
import ScanLog from './alpha-results/ScanLog.tsx'
import { alphaResultsJsonLd, blocks } from './alpha-results/content.ts'

/**
 * Structured data, serialised for an inline script: `<` is escaped so no
 * text in it can close the script element early.
 */
const jsonLd = JSON.stringify(alphaResultsJsonLd()).replace(/</g, '\\u003c')

/**
 * The alpha test results page: the campaign as one annotated scan log. The
 * header answers the whole page in a paragraph; each block of the log
 * answers one question with its output, why it matters and what it isn't.
 * Everything is in the prerendered HTML, with structured data for search
 * engines and agents, and a Markdown copy beside it (scripts/prerender.mjs).
 */
export default function AlphaResults() {
  return (
    <PageShell>
      <Box component="article">
        <ResultsHeader />
        <ScanLog blocks={blocks} />
      </Box>
      <Cta />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    </PageShell>
  )
}
