import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import Section from './Section.tsx'
import { pageColumn, rhythm } from '../rhythm.ts'

/**
 * The teaser's closing band: the cyan flood (in both schemes), answering the
 * hero on the same flush-left grid, with the one piece of news the page
 * carries. It says why the hero's install button is switched off.
 */
export default function SoftLaunch() {
  const flood = useTheme().vars.palette.flood

  return (
    <Section tone="flood" id="soft-launch">
      <Container maxWidth={false} sx={pageColumn}>
        <Typography
          variant="h2"
          sx={{
            // The closing band's display size (see Cta), a step under the
            // hero's cap.
            fontSize: 'clamp(2.5rem, 1.2rem + 3.6vw, 5rem)',
            lineHeight: 0.98,
            // One line where it fits; an even break where it does not.
            textWrap: 'balance',
          }}
        >
          Soft launch the week of September 28.
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mt: rhythm.display,
            maxWidth: '40rem',
            fontSize: { xs: '1rem', md: '1.125rem', lg: '1.25rem' },
            color: flood.inkMuted,
            textWrap: 'pretty',
          }}
        >
          We’re getting ready to open the private alpha. Installs open when it does.
        </Typography>
      </Container>
    </Section>
  )
}
