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
        <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 800 }}>
            Placeholder closing call-to-action.
          </Typography>
          <Typography variant="body1" sx={{ color: 'inherit', opacity: 0.8 }}>
            One short line inviting the visitor to take the next step.
          </Typography>
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
