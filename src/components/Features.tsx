import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined'
import Section from './Section.tsx'

const features = [
  {
    icon: BoltOutlinedIcon,
    title: 'Feature one',
    description: 'Short placeholder description of feature one goes here.',
  },
  {
    icon: SecurityOutlinedIcon,
    title: 'Feature two',
    description: 'Short placeholder description of feature two goes here.',
  },
  {
    icon: InsightsOutlinedIcon,
    title: 'Feature three',
    description: 'Short placeholder description of feature three goes here.',
  },
]

export default function Features() {
  return (
    <Section>
      <Container maxWidth="md">
        <Typography
          variant="h4"
          component="h2"
          sx={{ fontWeight: 700, textAlign: 'center', mb: 6 }}
        >
          Placeholder features heading
        </Typography>
        <Grid container spacing={4}>
          {features.map(({ icon: Icon, title, description }) => (
            <Grid key={title} size={{ xs: 12, md: 4 }}>
              <Stack spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                <Icon color="primary" fontSize="large" />
                <Typography variant="h6" component="h3" sx={{ fontWeight: 700 }}>
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Section>
  )
}
