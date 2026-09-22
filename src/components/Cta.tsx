import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Section from './Section.tsx'
import { useInView } from '../hooks/useInView.ts'
import { revealSx } from '../motion.ts'
import { links } from '../links.ts'

export default function Cta() {
  const { ref, inView } = useInView<HTMLDivElement>()

  return (
    <Section tone="contrast">
      <Container ref={ref} maxWidth="md" sx={revealSx(inView)}>
        {/* Heading and line are one thought, so they sit tight; the action
            stands apart. The heading is the page's closing statement, one
            clear step below the hero headline rather than card-title size. */}
        <Stack spacing={{ xs: 4, md: 5 }} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Stack spacing={2} sx={{ alignItems: 'center' }}>
            <Typography
              variant="h2"
              sx={{ fontSize: 'clamp(2rem, 1.3rem + 2.6vw, 3.25rem)' }}
            >
              Placeholder closing call-to-action.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                maxWidth: 520,
                fontSize: { xs: '1rem', md: '1.125rem' },
                color: 'inherit',
                opacity: 0.8,
                textWrap: 'pretty',
              }}
            >
              One short line inviting the visitor to take the next step.
            </Typography>
          </Stack>
          <Button
            variant="contained"
            color="inherit"
            size="large"
            component="a"
            href={links.getStarted}
            sx={{
              // This band is dark in both schemes, so the ink button is
              // always the inverted one; the focus ring inverts with it.
              backgroundColor: '#FFFFFF',
              color: '#000000',
              '&:hover': { backgroundColor: '#DCDCDC' },
              '&.Mui-focusVisible, &:focus-visible': {
                outline: '2px solid #000000',
                outlineOffset: -4,
                boxShadow: '0 0 0 2px #FFFFFF',
              },
            }}
          >
            Get started
          </Button>
        </Stack>
      </Container>
    </Section>
  )
}
