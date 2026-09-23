import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'
import Section from './Section.tsx'
import { floodActionSx, floodOutlineSx } from './floodButtons.ts'
import { useInView } from '../hooks/useInView.ts'
import { revealSx } from '../motion.ts'
import { links } from '../links.ts'
import { rhythm } from '../rhythm.ts'

/**
 * The closing band answers the hero: the same flood, the same flush-left
 * poster on the same grid, and a heading at the hero's scale, so the page
 * ends on the statement it opened with. Every word here repeats a claim the
 * page has already made.
 */
export default function Cta() {
  const hero = useTheme().vars.palette.hero
  const { ref, inView } = useInView<HTMLDivElement>()

  return (
    <Section tone="flood">
      <Container ref={ref} maxWidth="lg" sx={{ position: 'relative', ...revealSx(inView) }}>
        <Typography
          variant="h2"
          sx={{
            maxWidth: '16ch',
            fontSize: 'clamp(2.5rem, 1.2rem + 4.8vw, 5.5rem)',
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
            color: hero.inkMuted,
            textWrap: 'pretty',
          }}
        >
          Free core. Runs in your existing workflow. No AI token charges for routine checks.
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
            sx={floodActionSx(hero)}
          >
            Get started
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            size="large"
            component="a"
            href={links.docs}
            sx={floodOutlineSx(hero)}
          >
            Read the docs
          </Button>
        </Stack>
      </Container>
    </Section>
  )
}
