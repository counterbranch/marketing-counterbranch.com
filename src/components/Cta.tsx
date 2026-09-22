import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Section from './Section.tsx'

export default function Cta() {
  return (
    <Section>
      <Container maxWidth="md">
        <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
            Placeholder closing call-to-action.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            One short line inviting the visitor to take the next step.
          </Typography>
          <Button variant="contained" size="large">
            Get started
          </Button>
        </Stack>
      </Container>
    </Section>
  )
}
