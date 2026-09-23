import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Section from './Section.tsx'
import { RunGrid } from './AccessGrid.tsx'
import SlotWord from './SlotWord.tsx'
import { floodActionSx, floodOutlineSx } from './floodButtons.ts'
import { links } from '../links.ts'
import { srOnly } from '../a11y.ts'
import { REEL_WORDS, reelSentence } from '../reel.ts'
import { pageColumn, rhythm } from '../rhythm.ts'

/**
 * The closing band answers the hero: the cyan flood (in both schemes), the
 * same flush-left poster on the same grid, the hero's two actions, and a
 * heading at the hero's scale, so the page ends on the statement it opened
 * with. Beside it, from md, the access grid of your next PR's checks being
 * run, on a navy plate. Every word here repeats a claim the page has already
 * made.
 */
/** The reel is aria-hidden, so the heading carries the whole sentence once. */
const CTA_FOR_SCREEN_READERS = reelSentence('See what changes access in your')

export default function Cta() {
  const theme = useTheme()
  const palette = theme.vars.palette
  const flood = palette.flood
  const tracking = theme.typography.h2.letterSpacing

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
        <Box>
          {/* The hero's reel, with its words and settings: the band answers
              the headline it opened with. The column is a size container so
              the reel's line fits it. The longest word is about 10.5em; the
              divisor of 11 leaves room for the plate's padding and the stop. */}
          <Box sx={{ containerType: 'inline-size' }}>
            <Typography
              variant="h2"
              sx={{
                // A step under the hero's cap: the band's column is narrower,
                // and this keeps it to two lines plus the reel, as the hero is.
                fontSize: 'clamp(2.5rem, 1.2rem + 3.6vw, 5rem)',
                lineHeight: 0.98,
              }}
            >
              <Box component="span" sx={srOnly}>
                {CTA_FOR_SCREEN_READERS}
              </Box>
              <Box component="span" aria-hidden sx={{ display: 'block' }}>
                See what changes access in your
                <Box
                  component="span"
                  sx={{
                    display: 'flex',
                    mt: '0.16em',
                    fontSize: 'min(1em, 7.5vw)',
                    '@supports (width: 1cqi)': { fontSize: 'min(1em, 100cqi / 11)' },
                  }}
                >
                  <SlotWord
                    words={REEL_WORDS}
                    plate={flood.plate}
                    ink={flood.plateInk}
                    suffix="."
                    tracking={typeof tracking === 'number' ? `${tracking}px` : tracking}
                  />
                </Box>
              </Box>
            </Typography>
          </Box>
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
            // Pinned below xl: the buttons belong to the copy above them.
            sx={{ mt: { xs: 6, md: 9 }, width: { xs: '100%', sm: 'auto' } }}
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
              href={links.howItWorks}
              sx={floodOutlineSx(flood)}
            >
              See how it works
            </Button>
          </Stack>
        </Box>
        {/* On phones the poster carries the band alone. The grid sits on a
            navy plate, the same ground as the access grid above. */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end' }}>
          <Box
            sx={{
              width: '100%',
              maxWidth: { xs: 560, xl: 700 },
              p: { md: 3, xl: 4 },
              backgroundColor: palette.bands.navy.background,
              color: palette.bands.navy.ink,
            }}
          >
            <RunGrid />
          </Box>
        </Box>
      </Container>
    </Section>
  )
}
