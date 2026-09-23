import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Section from './Section.tsx'
import { RunGrid } from './AccessGrid.tsx'
import { floodActionSx, floodOutlineSx } from './floodButtons.ts'
import { useInView } from '../hooks/useInView.ts'
import { revealSx } from '../motion.ts'
import { links } from '../links.ts'
import { pageColumn, rhythm } from '../rhythm.ts'

/**
 * The closing band answers the hero: the cyan flood (in both schemes), the
 * same flush-left poster on the same grid, and a heading at the hero's scale,
 * so the page ends on the statement it opened with. Beside it, from md, the
 * access grid of your next PR's checks being run. Every word
 * here repeats a claim the page has already made.
 */
export default function Cta() {
  const flood = useTheme().vars.palette.flood
  const { ref, inView } = useInView<HTMLDivElement>()

  return (
    <Section tone="flood">
      <Container
        maxWidth={false}
        sx={{
          ...pageColumn,
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 7fr) minmax(0, 5fr)' },
          columnGap: 8,
          alignItems: 'center',
        }}
      >
        <Box ref={ref} sx={revealSx(inView)}>
          <Typography
            variant="h2"
            sx={{
              maxWidth: '16ch',
              fontSize: 'clamp(2.5rem, 1.2rem + 4.8vw, 6rem)',
              lineHeight: 0.98,
            }}
          >
            See what your next PR does to access.
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
            Free alpha release. Runs on your laptop or CI runner, with no account, no telemetry and no AI in the check.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ mt: rhythm.intro, width: { xs: '100%', sm: 'auto' } }}
          >
            <Button
              variant="contained"
              color="inherit"
              size="large"
              component="a"
              href={links.getStarted}
              sx={floodActionSx(flood)}
            >
              Get started free
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              component="a"
              href={links.faq}
              sx={floodOutlineSx(flood)}
            >
              Read the FAQ
            </Button>
          </Stack>
        </Box>
        {/* On phones the poster carries the band alone. */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end' }}>
          <RunGrid />
        </Box>
      </Container>
    </Section>
  )
}
