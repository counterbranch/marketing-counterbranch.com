import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import { alpha } from '@mui/material/styles'
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined'
import Section from './Section.tsx'
import { useInView } from '../hooks/useInView.ts'
import { revealSx } from '../motion.ts'

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
  const { ref, inView } = useInView<HTMLDivElement>()

  return (
    <Section id="features" tone="tinted">
      <Container ref={ref} maxWidth="md" sx={revealSx(inView)}>
        <Typography
          variant="h4"
          component="h2"
          sx={{ fontWeight: 800, textAlign: 'center', mb: { xs: 6, md: 8 } }}
        >
          Placeholder features heading
        </Typography>
        <Grid container spacing={4}>
          {features.map(({ icon: Icon, title, description }) => (
            <Grid key={title} size={{ xs: 12, md: 4 }}>
              <Paper
                variant="outlined"
                sx={(theme) => ({
                  height: '100%',
                  p: 4,
                  transition: theme.transitions.create('border-color'),
                  '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                  },
                })}
              >
                <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
                  <Box
                    sx={(theme) => ({
                      width: 44,
                      height: 44,
                      borderRadius: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: alpha(theme.palette.primary.main, 0.14),
                      // Cyan is too light to read against its own light tint,
                      // so the icon uses navy (text.primary) in light mode
                      // and switches to the bright cyan once the surface
                      // behind it is dark — verified ~14:1 / ~7.6:1.
                      color: theme.palette.text.primary,
                      ...theme.applyStyles('dark', {
                        color: theme.palette.primary.main,
                      }),
                    })}
                  >
                    <Icon fontSize="medium" aria-hidden />
                  </Box>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 700 }}>
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {description}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Section>
  )
}
