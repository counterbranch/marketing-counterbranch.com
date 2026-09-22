import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Section from './Section.tsx'
import { heroStageSx } from '../motion.ts'

export default function Hero() {
  return (
    <Section>
      <Container maxWidth="md">
        <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{ fontWeight: 700, ...heroStageSx(0) }}
          >
            One-line value proposition goes here.
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 560, ...heroStageSx(1) }}
          >
            Short supporting sentence about the product goes here as placeholder copy.
          </Typography>
          <Stack direction="row" spacing={2} sx={heroStageSx(2)}>
            <Button variant="contained" size="large">
              Get started
            </Button>
            <Button variant="text" size="large">
              See how it works
            </Button>
          </Stack>
          <Paper
            variant="outlined"
            sx={{
              width: '100%',
              aspectRatio: '16 / 9',
              mt: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...heroStageSx(3),
            }}
          >
            <Typography color="text.secondary">
              Product screenshot placeholder
            </Typography>
          </Paper>
        </Stack>
      </Container>
    </Section>
  )
}
